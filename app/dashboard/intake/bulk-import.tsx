"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { customerRef } from "@/lib/customer";
import { HEALTH_CONDITIONS, HEALTH_GOALS } from "@/config/intake";
import { shrinkForReading } from "./shrink-image";

/**
 * Bulk intake: many photographed forms read, checked on one screen, then filed.
 *
 * Nothing here is a new way of saving. Each photo is read by the same route the
 * single-form screen uses (/api/intake/extract) and filed through the same one
 * (/api/intake), so a form still lands as a record with its signed scan
 * attached and its guest matched or added by phone number. What this adds is
 * the queue and the review list.
 *
 * Reading is a SUGGESTION. Nothing is saved until a person has looked at the
 * list and ticked that they have checked it against the paper — these are
 * health answers and IC numbers, and a confidently wrong tick is a guest
 * treated on the strength of it.
 */

type Status = "queued" | "reading" | "ready" | "manual" | "error" | "saving" | "saved";

type Row = {
  id: string;
  fileName: string;
  preview: string | null;
  status: Status;
  error: string | null;
  /** The reader returned something — the editable boxes only make sense then. */
  read: boolean;
  include: boolean;
  guest_name: string;
  contact_no: string;
  ic_passport_no: string;
  sponsor_name: string;
  survey_date: string;
  health_conditions: string[];
  health_goals: string[];
  /** Everything else the reader found — carried through, and shown, but not edited here. */
  extras: Record<string, unknown>;
  extrasSummary: string;
  unclear: string[];
  result: string | null;
};

/** Vercel rejects a request body over about 4.5 MB before the route runs. */
const MAX_UPLOAD_BYTES = 4.4 * 1024 * 1024;
const READ_CONCURRENCY = 3;

const EXTRA_TEXT = ["voucher_no", "server_name", "notes", "water_level", "water_temp", "intensity", "duration_min", "salt_used", "recommended_salt"] as const;
const EXTRA_LISTS = ["aroma_oils", "recommended_oils"] as const;

const looksLikePhone = (v: string) => v.replace(/\D/g, "").length >= 8;

export default function BulkImport({ canExtract }: { canExtract: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  // The original files and the read queue live outside state: they are not
  // rendered, and the workers need them without waiting on a re-render.
  const files = useRef(new Map<string, File>());
  const queue = useRef<string[]>([]);
  const workers = useRef(0);
  const previews = useRef<string[]>([]);

  useEffect(() => {
    const urls = previews.current;
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const patch = (id: string, changes: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...changes } : r)));

  async function readOne(id: string) {
    const file = files.current.get(id);
    if (!file) return;
    patch(id, { status: "reading" });

    try {
      const body = new FormData();
      body.append("scan", await shrinkForReading(file));
      const res = await fetch("/api/intake/extract", { method: "POST", body });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.fields) {
        patch(id, { status: "error", error: payload?.error ?? "Could not read that photo.", include: false });
        return;
      }

      const f = payload.fields;
      const name = (f.guest_name ?? "") as string;
      const phone = (f.contact_no ?? "") as string;
      const unclear: string[] = [...(f.unclear ?? [])];
      if (f.signature_present === false) unclear.push("no signature in the guest's box");

      // Ticked by default only when there is nothing to doubt. Anything the
      // reader hedged on, or that cannot become a customer, starts unticked so
      // it takes a deliberate choice to file.
      const clean = !!name.trim() && looksLikePhone(phone) && unclear.length === 0;

      const extras: Record<string, unknown> = {};
      const bits: string[] = [];
      for (const k of EXTRA_TEXT) {
        if (f[k]) {
          extras[k] = f[k];
          bits.push(`${k.replace(/_/g, " ")}: ${f[k]}`);
        }
      }
      for (const k of EXTRA_LISTS) {
        if (f[k]?.length) {
          extras[k] = f[k];
          bits.push(`${k.replace(/_/g, " ")}: ${f[k].join(", ")}`);
        }
      }

      patch(id, {
        status: "ready",
        error: null,
        read: true,
        include: clean,
        guest_name: name,
        contact_no: phone,
        ic_passport_no: f.ic_passport_no ?? "",
        sponsor_name: f.sponsor_name ?? "",
        survey_date: f.survey_date ?? "",
        health_conditions: f.health_conditions ?? [],
        health_goals: f.health_goals ?? [],
        extras,
        extrasSummary: bits.join(" · "),
        unclear,
      });
    } catch {
      patch(id, { status: "error", error: "Could not reach the server.", include: false });
    }
  }

  function pump() {
    while (workers.current < READ_CONCURRENCY && queue.current.length > 0) {
      const id = queue.current.shift()!;
      workers.current += 1;
      void readOne(id).finally(() => {
        workers.current -= 1;
        pump();
      });
    }
  }

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    const added: Row[] = [];

    for (const file of Array.from(list)) {
      const id = crypto.randomUUID();
      const isImage = file.type.startsWith("image/");
      let preview: string | null = null;
      if (isImage) {
        preview = URL.createObjectURL(file);
        previews.current.push(preview);
      }

      const base: Row = {
        id,
        fileName: file.name,
        preview,
        status: "queued",
        error: null,
        read: false,
        include: false,
        guest_name: "",
        contact_no: "",
        ic_passport_no: "",
        sponsor_name: "",
        survey_date: "",
        health_conditions: [],
        health_goals: [],
        extras: {},
        extrasSummary: "",
        unclear: [],
        result: null,
      };

      if (!isImage) {
        added.push({ ...base, status: "manual", error: "Only photos can be read. Add this one with “Record a signed form”." });
      } else if (file.size > MAX_UPLOAD_BYTES) {
        added.push({ ...base, status: "manual", error: "Over 4.4 MB — too large to file from here. Add it with “Record a signed form”." });
      } else {
        files.current.set(id, file);
        queue.current.push(id);
        added.push(base);
      }
    }

    setConfirmed(false);
    setRows((prev) => [...prev, ...added]);
    pump();
  }

  function remove(id: string) {
    files.current.delete(id);
    queue.current = queue.current.filter((q) => q !== id);
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  const toggle = (list: string[], value: string) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const toSave = rows.filter((r) => r.include && (r.status === "ready" || r.status === "error"));
  const unread = rows.filter((r) => r.status === "queued" || r.status === "reading").length;
  const readCount = rows.filter((r) => r.status !== "queued" && r.status !== "reading").length;
  const savedCount = rows.filter((r) => r.status === "saved").length;

  async function saveAll() {
    setSaving(true);

    // One at a time, on purpose. Two forms for the same phone number in one
    // batch must not each create a customer: filed in turn, the second finds the
    // first and is filed against them.
    for (const row of toSave) {
      const file = files.current.get(row.id);
      if (!file) continue;
      patch(row.id, { status: "saving", error: null });

      const body = new FormData();
      body.set("guest_name", row.guest_name.trim());
      body.set("contact_no", row.contact_no.trim());
      body.set("ic_passport_no", row.ic_passport_no.trim());
      body.set("sponsor_name", row.sponsor_name.trim());
      if (row.survey_date) body.set("survey_date", row.survey_date);
      row.health_conditions.forEach((v) => body.append("health_conditions", v));
      row.health_goals.forEach((v) => body.append("health_goals", v));
      for (const k of EXTRA_TEXT) if (row.extras[k]) body.set(k, String(row.extras[k]));
      for (const k of EXTRA_LISTS) {
        const list = row.extras[k];
        if (Array.isArray(list)) list.forEach((v) => body.append(k, String(v)));
      }
      body.set("scan", file);

      try {
        const res = await fetch("/api/intake", { method: "POST", body });
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          patch(row.id, { status: "error", error: payload?.error ?? "Could not save that one." });
          continue;
        }
        const c = payload?.customer as { name: string | null; customer_no: number | null; created: boolean } | null;
        patch(row.id, {
          status: "saved",
          include: false,
          result: c
            ? c.created
              ? `Filed. New customer ${customerRef(c.customer_no)} (${c.name}).`
              : `Filed against existing customer ${customerRef(c.customer_no)} (${c.name}).`
            : "Filed. No customer was added — it needs a name and a number.",
        });
      } catch {
        patch(row.id, { status: "error", error: "Could not reach the server." });
      }
    }

    setSaving(false);
    setConfirmed(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-semibold hover:bg-black/5 sm:w-auto"
      >
        Import many forms
      </button>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-black/10 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Import many forms</h2>
          <p className="mt-1 max-w-xl text-sm text-black/60">
            Choose all the photos at once. Each is read for you, then you check the list against the
            paper before anything is saved. Each photo is kept as the signed form.
          </p>
        </div>
        <button onClick={() => setOpen(false)} disabled={saving} className="text-sm text-black/50 underline">
          Close
        </button>
      </div>

      {!canExtract && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Reading photos isn&apos;t switched on, so the boxes would come back empty. Use “Record a signed
          form” instead.
        </p>
      )}

      <label className="inline-block cursor-pointer rounded-lg border border-black/15 bg-white px-3.5 py-2 text-sm font-medium hover:bg-black/5">
        Choose photos
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={!canExtract || saving}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          className="hidden"
        />
      </label>

      {rows.length > 0 && (
        <p className="text-sm text-black/60">
          {unread > 0 ? `Reading… ${readCount} of ${rows.length} done.` : `${rows.length} photos read.`}
          {savedCount > 0 && ` ${savedCount} filed.`}
        </p>
      )}

      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.id} className="rounded-xl border border-black/10 p-3">
            <div className="flex gap-3">
              {r.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={r.preview} alt="" className="h-20 w-16 shrink-0 rounded-md border border-black/10 object-cover" />
              ) : (
                <div className="h-20 w-16 shrink-0 rounded-md border border-black/10 bg-black/5" />
              )}

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-black/50">
                  <span className="truncate font-medium text-black/70">{r.fileName}</span>
                  <StatusBadge status={r.status} />
                  {r.status !== "saved" && r.status !== "saving" && (
                    <button onClick={() => remove(r.id)} className="underline">
                      Remove
                    </button>
                  )}
                </div>

                {(r.status === "queued" || r.status === "reading") && (
                  <p className="text-sm text-black/50">{r.status === "queued" ? "Waiting…" : "Reading…"}</p>
                )}

                {(r.status === "error" || r.status === "manual") && r.error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{r.error}</p>
                )}

                {r.status === "saved" && r.result && <p className="text-sm text-emerald-800">{r.result}</p>}

                {r.read && (r.status === "ready" || r.status === "error" || r.status === "saving") && (
                  <>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Field label="Name" value={r.guest_name} onChange={(v) => patch(r.id, { guest_name: v })} />
                      <Field label="Phone" value={r.contact_no} onChange={(v) => patch(r.id, { contact_no: v })} />
                      <Field label="IC / passport" value={r.ic_passport_no} onChange={(v) => patch(r.id, { ic_passport_no: v })} />
                      <Field label="Referred by" value={r.sponsor_name} onChange={(v) => patch(r.id, { sponsor_name: v })} />
                      <Field label="Date" type="date" value={r.survey_date} onChange={(v) => patch(r.id, { survey_date: v })} />
                    </div>

                    <details className="text-sm">
                      <summary className="cursor-pointer text-black/60">
                        Health &amp; goals
                        {r.health_conditions.length > 0 && (
                          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">
                            {r.health_conditions.length} ticked
                          </span>
                        )}
                      </summary>
                      <div className="mt-2 grid gap-1 sm:grid-cols-2">
                        {HEALTH_CONDITIONS.map((o) => (
                          <Check
                            key={o}
                            label={o}
                            checked={r.health_conditions.includes(o)}
                            onChange={() => patch(r.id, { health_conditions: toggle(r.health_conditions, o) })}
                          />
                        ))}
                      </div>
                      <div className="mt-2 grid gap-1 sm:grid-cols-2">
                        {HEALTH_GOALS.map((o) => (
                          <Check
                            key={o}
                            label={o}
                            checked={r.health_goals.includes(o)}
                            onChange={() => patch(r.id, { health_goals: toggle(r.health_goals, o) })}
                          />
                        ))}
                      </div>
                    </details>

                    {r.extrasSummary && (
                      <p className="text-xs text-black/50">Also read from the form: {r.extrasSummary}</p>
                    )}

                    {r.unclear.length > 0 && (
                      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                        Worth checking against the paper: {r.unclear.join(" · ")}
                      </p>
                    )}

                    {r.error && r.status === "error" && (
                      <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">{r.error}</p>
                    )}

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={r.include}
                        disabled={r.status === "saving"}
                        onChange={(e) => patch(r.id, { include: e.target.checked })}
                      />
                      File this one
                      {!r.include && (!r.guest_name.trim() || !looksLikePhone(r.contact_no)) && (
                        <span className="text-xs text-black/50">(needs a name and a phone number to add a customer)</span>
                      )}
                    </label>
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {rows.length > 0 && (
        <div className="space-y-3 border-t border-black/10 pt-4">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
            <span>
              I have checked the names, phone numbers and health ticks against the paper forms.
            </span>
          </label>
          <button
            onClick={saveAll}
            disabled={!confirmed || saving || unread > 0 || toSave.length === 0}
            className="rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--lagoon-dark)" }}
          >
            {saving
              ? "Filing…"
              : unread > 0
                ? "Still reading…"
                : `File ${toSave.length} form${toSave.length === 1 ? "" : "s"}`}
          </button>
          <p className="text-xs text-black/50">
            Forms are filed one at a time. A form with a name and phone number is added to the
            customer list, or filed against the customer already on that number.
          </p>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, { label: string; cls: string }> = {
    queued: { label: "Waiting", cls: "bg-black/5 text-black/60" },
    reading: { label: "Reading", cls: "bg-sky-100 text-sky-900" },
    ready: { label: "Read", cls: "bg-emerald-100 text-emerald-900" },
    manual: { label: "Not read", cls: "bg-red-100 text-red-900" },
    error: { label: "Problem", cls: "bg-red-100 text-red-900" },
    saving: { label: "Filing", cls: "bg-sky-100 text-sky-900" },
    saved: { label: "Filed", cls: "bg-emerald-100 text-emerald-900" },
  };
  const { label, cls } = map[status];
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm">
      <span className="mb-0.5 block text-xs text-black/50">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-black/10 px-3 py-1.5 text-sm"
      />
    </label>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}
