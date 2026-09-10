"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { customerRef } from "@/lib/customer";
import {
  HEALTH_CONDITIONS,
  HEALTH_GOALS,
  AROMA_OILS,
  SPA_SALTS,
  WATER_LEVELS,
  WATER_TEMPS,
  INTENSITIES,
  DURATIONS,
  INTAKE_SCAN_TYPES,
} from "@/config/intake";

export type IntakeSignup = {
  id: string;
  name: string | null;
  phone: string | null;
  customer_no: number | null;
};

export type IntakeForm = {
  id: string;
  created_at: string;
  signup_id: string | null;
  survey_date: string | null;
  guest_name: string | null;
  contact_no: string | null;
  voucher_no: string | null;
  health_conditions: string[] | null;
  health_goals: string[] | null;
  water_level: string | null;
  water_temp: string | null;
  intensity: string | null;
  duration_min: string | null;
  aroma_oils: string[] | null;
  recommended_oils: string[] | null;
  salt_used: string | null;
  recommended_salt: string | null;
  server_name: string | null;
  notes: string | null;
  scan_path: string | null;
};

/**
 * Keying in a signed form.
 *
 * The paper is the record — this screen exists to get the scan filed and the
 * few fields worth searching on into the database. So it is ordered the way the
 * printed sheet is ordered, top to bottom, and everything except the customer
 * is optional: a half-legible handwritten form should still get saved with its
 * scan rather than being rejected over a blank box.
 *
 * Uncontrolled inputs on purpose. The whole thing posts as one multipart
 * request built straight from the form element, so the scan and the fields
 * arrive together and a record can never exist without the consent it refers to.
 */
export default function IntakeClient({
  signups,
  forms,
}: {
  signups: IntakeSignup[];
  forms: IntakeForm[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  // Set after mount rather than at render: the server runs on UTC and the shop
  // is on +8, so rendering "today" in both places is a hydration mismatch
  // waiting for someone to open this after 8am.
  const [surveyDate, setSurveyDate] = useState("");
  useEffect(() => {
    setSurveyDate(localToday());
  }, []);

  const selected = signups.find((s) => s.id === selectedId) ?? null;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return signups.slice(0, 8);
    return signups
      .filter((s) => {
        const haystack = [s.name ?? "", s.phone ?? "", customerRef(s.customer_no)]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 8);
  }, [signups, query]);

  const signupById = useMemo(
    () => new Map(signups.map((s) => [s.id, s] as const)),
    [signups],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/intake", { method: "POST", body: new FormData(formEl) });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(payload?.error ?? "Could not save that. Please try again.");
        return;
      }

      formEl.reset();
      setSelectedId("");
      setQuery("");
      setSurveyDate(localToday());
      setSaved(true);
      setOpen(false);
      router.refresh();
    } catch {
      setError("Could not reach the server. Check the connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {saved && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Saved. The form is filed against that customer.
        </p>
      )}

      {!open ? (
        <button
          onClick={() => {
            setOpen(true);
            setSaved(false);
          }}
          className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white sm:w-auto"
          style={{ background: "var(--lagoon-dark)" }}
        >
          Record a signed form
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-black/10 bg-white p-4 sm:p-6"
        >
          {/* ── Who ─────────────────────────────────────────────────────── */}
          <Fieldset title="Whose form is this?">
            <input type="hidden" name="signup_id" value={selectedId} />

            {selected ? (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-sm">
                <span className="rounded-md bg-white px-2 py-0.5 font-mono text-xs">
                  {customerRef(selected.customer_no)}
                </span>
                <span className="font-medium">{selected.name ?? "—"}</span>
                <span className="text-black/50">{selected.phone ?? "no phone"}</span>
                <button
                  type="button"
                  onClick={() => setSelectedId("")}
                  className="ml-auto text-xs font-medium text-black/60 underline"
                >
                  Change
                </button>
              </div>
            ) : (
              <>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, phone or KH number"
                  className="w-full rounded-xl border border-black/15 px-3 py-2.5 text-sm"
                />
                <div className="mt-2 space-y-1">
                  {matches.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedId(s.id)}
                      className="flex w-full flex-wrap items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm hover:bg-black/5"
                    >
                      <span className="font-mono text-xs text-black/45">
                        {customerRef(s.customer_no)}
                      </span>
                      <span className="font-medium">{s.name ?? "—"}</span>
                      <span className="text-black/45">{s.phone ?? ""}</span>
                    </button>
                  ))}
                  {matches.length === 0 && (
                    <p className="px-3 py-2 text-sm text-black/50">
                      Nobody by that name. Leave it unlinked and fill in the name below — you can
                      link it up later.
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Text
                name="guest_name"
                label="Name on the form"
                placeholder={selected?.name ?? "As written"}
              />
              <Text
                name="contact_no"
                label="Contact no."
                placeholder={selected?.phone ?? "As written"}
              />
              <Text name="ic_passport_no" label="IC / passport no." />
              <Text name="sponsor_name" label="Referred by" />
              <Text name="voucher_no" label="Voucher no." />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-black/55">Date on form</span>
                <input
                  type="date"
                  name="survey_date"
                  value={surveyDate}
                  onChange={(e) => setSurveyDate(e.target.value)}
                  className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
                />
              </label>
            </div>
          </Fieldset>

          {/* ── The scan ────────────────────────────────────────────────── */}
          <Fieldset title="The signed sheet">
            <input
              type="file"
              name="scan"
              accept={INTAKE_SCAN_TYPES.join(",")}
              capture="environment"
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-black/[0.06] file:px-3 file:py-2 file:text-sm file:font-medium"
            />
            <p className="mt-1.5 text-xs text-black/50">
              A photo of the sheet is fine. Up to 12 MB — JPG, PNG, WEBP or PDF. You can save
              without one and add the scan later.
            </p>
          </Fieldset>

          {/* ── What the guest ticked ───────────────────────────────────── */}
          <Fieldset title="Anything to take care with">
            <CheckGroup name="health_conditions" options={HEALTH_CONDITIONS} />
          </Fieldset>

          <Fieldset title="What they came for">
            <CheckGroup name="health_goals" options={HEALTH_GOALS} />
          </Fieldset>

          {/* ── What the team did ───────────────────────────────────────── */}
          <Fieldset title="The soak">
            <div className="grid gap-3 sm:grid-cols-2">
              <Select name="water_level" label="Water level" options={WATER_LEVELS} />
              <Select name="water_temp" label="Temperature" options={WATER_TEMPS} />
              <Select name="intensity" label="Intensity" options={INTENSITIES} />
              <Select name="duration_min" label="Minutes" options={DURATIONS} />
              <Select name="salt_used" label="Salt used" options={SPA_SALTS} />
              <Select name="recommended_salt" label="Salt suggested next time" options={SPA_SALTS} />
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-1.5 text-xs font-medium text-black/55">Oils used</p>
                <CheckGroup name="aroma_oils" options={AROMA_OILS} />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-black/55">Oils suggested next time</p>
                <CheckGroup name="recommended_oils" options={AROMA_OILS} />
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Text name="server_name" label="Served by" />
            </div>

            <label className="mt-3 block">
              <span className="mb-1 block text-xs font-medium text-black/55">Notes</span>
              <textarea
                name="notes"
                rows={3}
                className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
              />
            </label>
          </Fieldset>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--lagoon-dark)" }}
            >
              {saving ? "Saving…" : "Save form"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl border border-black/10 px-5 py-3 text-sm font-medium hover:bg-black/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* ── Filed forms ───────────────────────────────────────────────── */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-black/70">
          Filed {forms.length > 0 && <span className="font-normal text-black/40">({forms.length})</span>}
        </h2>

        {forms.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/15 px-4 py-8 text-center text-sm text-black/50">
            Nothing filed yet. Print a stack of blank forms for the counter, and record them here
            once they come back signed.
          </p>
        ) : (
          <ul className="space-y-2">
            {forms.map((form) => (
              <FormRow
                key={form.id}
                form={form}
                signup={form.signup_id ? signupById.get(form.signup_id) ?? null : null}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FormRow({ form, signup }: { form: IntakeForm; signup: IntakeSignup | null }) {
  const conditions = form.health_conditions ?? [];
  const oils = form.aroma_oils ?? [];

  return (
    <li className="rounded-2xl border border-black/10 bg-white">
      <details className="group">
        <summary className="flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 p-3.5 sm:p-4">
          <span className="font-mono text-xs text-black/45">
            {customerRef(signup?.customer_no)}
          </span>
          <span className="font-medium">{form.guest_name ?? signup?.name ?? "Unnamed"}</span>
          <span className="text-sm text-black/45">
            {shortDate(form.survey_date ?? form.created_at)}
          </span>

          {/* The reason for keying any of this in: a tick that needs care shows
              here, without anyone opening the scan. */}
          {conditions.length > 0 && (
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
              {conditions.length} to note
            </span>
          )}
          {form.scan_path ? (
            <span className="text-xs text-black/40">scan filed</span>
          ) : (
            <span className="text-xs text-amber-700">no scan</span>
          )}
          <span className="ml-auto text-xs text-black/35 group-open:hidden">
            {oils.join(", ")}
          </span>
        </summary>

        <div className="space-y-3 border-t border-black/5 px-3.5 pb-4 pt-3 text-sm sm:px-4">
          {form.scan_path && (
            <a
              href={`/api/intake/${form.id}/scan`}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/5"
            >
              Open the signed form
            </a>
          )}

          <Detail label="To take care with" value={conditions.join(" · ")} tone="amber" />
          <Detail label="Came for" value={(form.health_goals ?? []).join(" · ")} />
          <Detail
            label="Setup"
            value={[
              form.water_level && `${form.water_level} water`,
              form.water_temp,
              form.intensity,
              form.duration_min && `${form.duration_min} min`,
            ]
              .filter(Boolean)
              .join(" · ")}
          />
          <Detail
            label="Used"
            value={[oils.join(", "), form.salt_used && `${form.salt_used} salt`]
              .filter(Boolean)
              .join(" · ")}
          />
          <Detail
            label="Suggested next time"
            value={[
              (form.recommended_oils ?? []).join(", "),
              form.recommended_salt && `${form.recommended_salt} salt`,
            ]
              .filter(Boolean)
              .join(" · ")}
          />
          <Detail label="Served by" value={form.server_name} />
          <Detail label="Voucher" value={form.voucher_no} />
          <Detail label="Notes" value={form.notes} />
        </div>
      </details>
    </li>
  );
}

function Detail({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | null | undefined;
  tone?: "amber";
}) {
  if (!value) return null;
  return (
    <p className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <span className="w-44 shrink-0 text-xs font-medium uppercase tracking-wide text-black/40">
        {label}
      </span>
      <span className={tone === "amber" ? "text-amber-900" : "text-black/75"}>{value}</span>
    </p>
  );
}

function Fieldset({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-black/70">{title}</legend>
      {children}
    </fieldset>
  );
}

function Text({
  name,
  label,
  placeholder,
}: {
  name: string;
  label: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-black/55">{label}</span>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm"
      />
    </label>
  );
}

function Select({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: readonly string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-black/55">{label}</span>
      <select
        name={name}
        defaultValue=""
        className="w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm"
      >
        <option value="">—</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Tick boxes as tappable chips. Same values as the printed sheet, so keying in
 * a form is reading down the page rather than translating it — and the server
 * only accepts values from these same lists.
 */
function CheckGroup({ name, options }: { name: string; options: readonly string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <label
          key={option}
          className="flex cursor-pointer items-center gap-2 rounded-xl border border-black/12 px-3 py-2 text-sm has-[:checked]:border-black/40 has-[:checked]:bg-black/[0.05]"
        >
          <input type="checkbox" name={name} value={option} className="h-4 w-4 accent-black/70" />
          {option}
        </label>
      ))}
    </div>
  );
}

function localToday(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function shortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
