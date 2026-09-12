"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  MAX_AROMA_OILS,
  AROMA_OIL_PURPOSE,
  HEALTH_STOP_NOTE,
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
 * The text boxes are uncontrolled on purpose: the whole thing posts as one
 * multipart request built straight from the form element, so the scan and the
 * fields arrive together and a record can never exist without the consent it
 * refers to. The tick lists are controlled, because three things write to them
 * — the person ticking, "Same as last time", and reading a photo — and one
 * source of truth is what keeps the three-oil limit honest.
 */
export default function IntakeClient({
  signups,
  forms,
  canExtract,
}: {
  signups: IntakeSignup[];
  forms: IntakeForm[];
  /** Whether reading a photo is switched on. False keeps the screen entirely manual. */
  canExtract: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [listQuery, setListQuery] = useState("");

  // What this customer had before. Fetched rather than read out of `forms`,
  // which is only the most recent hundred — a regular from opening week would
  // have fallen off it by the time they came back, which is the one moment
  // this needs to work.
  const formRef = useRef<HTMLFormElement>(null);
  const [history, setHistory] = useState<IntakeForm[] | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // The oils live up here rather than inside their tick lists, because two
  // things write to them: the server, and "Same as last time". One source, so
  // the three-oil limit counts what is actually ticked either way.
  const [oilsUsed, setOilsUsed] = useState<string[]>([]);
  const [oilsNext, setOilsNext] = useState<string[]>([]);
  // Same reason as the oils: reading a photo writes into these, so they can't
  // own their own state or the two would disagree.
  const [conditions, setConditions] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);

  // Reading the photo. A suggestion only — nothing is saved until Save is
  // pressed, so this fills the boxes and then gets out of the way.
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);
  const [unclear, setUnclear] = useState<string[] | null>(null);

  const setField = useCallback((name: string, value: string | null) => {
    const el = formRef.current?.elements.namedItem(name);
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      el.value = value ?? "";
    } else if (el instanceof HTMLSelectElement) {
      el.value = value ?? "";
    }
  }, []);

  async function readPhoto() {
    if (!scanFile) return;
    setReading(true);
    setReadError(null);
    setUnclear(null);

    try {
      const body = new FormData();
      body.append("scan", scanFile);
      const res = await fetch("/api/intake/extract", { method: "POST", body });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok || !payload?.fields) {
        setReadError(payload?.error ?? "Could not read that photo.");
        return;
      }

      const f = payload.fields;
      for (const name of [
        "guest_name",
        "contact_no",
        "ic_passport_no",
        "sponsor_name",
        "voucher_no",
        "server_name",
        "notes",
        "water_level",
        "water_temp",
        "intensity",
        "duration_min",
        "salt_used",
        "recommended_salt",
      ]) {
        setField(name, f[name] ?? null);
      }
      if (f.survey_date) setSurveyDate(f.survey_date);
      setConditions(f.health_conditions ?? []);
      setGoals(f.health_goals ?? []);
      setOilsUsed(f.aroma_oils ?? []);
      setOilsNext(f.recommended_oils ?? []);

      const flags: string[] = [...(f.unclear ?? [])];
      if (f.signature_present === false) flags.push("no signature in the guest's box");
      setUnclear(flags);
    } catch {
      setReadError("Could not reach the server.");
    } finally {
      setReading(false);
    }
  }
  // Set after mount rather than at render: the server runs on UTC and the shop
  // is on +8, so rendering "today" in both places is a hydration mismatch
  // waiting for someone to open this after 8am.
  const [surveyDate, setSurveyDate] = useState("");
  useEffect(() => {
    setSurveyDate(localToday());
  }, []);

  const selected = signups.find((s) => s.id === selectedId) ?? null;
  const customerNo = selected?.customer_no ?? null;

  useEffect(() => {
    if (customerNo === null) {
      setHistory(null);
      return;
    }

    let cancelled = false;
    setHistoryLoading(true);

    fetch(`/api/intake?customer_no=${customerNo}`)
      .then((res) => (res.ok ? res.json() : { forms: [] }))
      .then((payload) => {
        if (!cancelled) setHistory((payload?.forms ?? []) as IntakeForm[]);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [customerNo]);

  const lastVisit = history?.[0] ?? null;

  /**
   * Copy a previous blend into the boxes.
   *
   * Reaches into the form element for the selects rather than turning every
   * input into controlled state; the oils go through their own state, which is
   * what the three-oil limit counts. Reading a photo (readPhoto) writes to the
   * same places by the same means.
   */
  const applyBlend = useCallback(
    (oils: string[], salt: string | null, settings: IntakeForm | null) => {
      const el = formRef.current;
      if (!el) return;

      // Trimmed to the blending limit. A record from before the limit existed
      // can carry more than three, and copying it forward would quietly create
      // a blend the shop doesn't pour.
      setOilsUsed(oils.slice(0, MAX_AROMA_OILS));

      const setSelect = (name: string, value: string | null) => {
        const field = el.querySelector<HTMLSelectElement>(`select[name="${name}"]`);
        if (field) field.value = value ?? "";
      };

      setSelect("salt_used", salt);
      if (settings) {
        setSelect("water_level", settings.water_level);
        setSelect("water_temp", settings.water_temp);
        setSelect("intensity", settings.intensity);
        setSelect("duration_min", settings.duration_min);
      }
    },
    [],
  );

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

  /**
   * The filed list, narrowed to one customer.
   *
   * Searches the name written on the form as well as the name on the signup:
   * a walk-in with no signup row has only the former, and would otherwise be
   * unfindable the moment there are more than a screenful of forms.
   */
  const visibleForms = useMemo(() => {
    const q = listQuery.trim().toLowerCase();
    if (!q) return forms;

    return forms.filter((form) => {
      const signup = form.signup_id ? signupById.get(form.signup_id) : null;
      return [
        form.guest_name ?? "",
        form.contact_no ?? "",
        signup?.name ?? "",
        signup?.phone ?? "",
        customerRef(signup?.customer_no),
      ]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [forms, listQuery, signupById]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      // The scan comes from state, not from the form element: the two file
      // inputs deliberately have no name, so this is what puts it on the wire.
      const body = new FormData(formEl);
      if (scanFile) body.set("scan", scanFile);

      const res = await fetch("/api/intake", { method: "POST", body });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(payload?.error ?? "Could not save that. Please try again.");
        return;
      }

      // form.reset() only clears what the DOM owns; the oils are React state.
      formEl.reset();
      setOilsUsed([]);
      setOilsNext([]);
      setConditions([]);
      setGoals([]);
      setScanFile(null);
      setUnclear(null);
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
          ref={formRef}
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-black/10 bg-white p-4 sm:p-6"
        >
          {/* ── Who ─────────────────────────────────────────────────────── */}
          <Fieldset title="Whose form is this?">
            <input type="hidden" name="signup_id" value={selectedId} />

            {selected && (
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
            )}

            {/* Been before? Then what they had last time belongs here, at the
                moment you are filling this in — not on another screen you would
                have to go and look at while they wait. */}
            {selected && (historyLoading || lastVisit) && (
              <div className="mt-3 rounded-xl border border-black/10 bg-black/[0.02] p-3.5 text-sm">
                {historyLoading ? (
                  <p className="text-black/45">Looking up their last visit…</p>
                ) : (
                  lastVisit && (
                    <>
                      <p className="text-xs font-semibold uppercase tracking-wide text-black/45">
                        Been before — {history!.length}{" "}
                        {history!.length === 1 ? "visit" : "visits"} on file, last on{" "}
                        {shortDate(lastVisit.survey_date ?? lastVisit.created_at)}
                      </p>

                      {(lastVisit.health_conditions ?? []).length > 0 && (
                        <p className="mt-2 rounded-lg bg-amber-100 px-2.5 py-1.5 text-amber-900">
                          Last time they noted:{" "}
                          {(lastVisit.health_conditions ?? []).join(" · ")}
                        </p>
                      )}

                      <dl className="mt-2 space-y-1">
                        <HistoryLine
                          label="Had"
                          value={[
                            (lastVisit.aroma_oils ?? []).join(", "),
                            lastVisit.salt_used && `${lastVisit.salt_used} salt`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        />
                        <HistoryLine
                          label="Setup"
                          value={[
                            lastVisit.water_level && `${lastVisit.water_level} water`,
                            lastVisit.water_temp,
                            lastVisit.intensity,
                            lastVisit.duration_min && `${lastVisit.duration_min} min`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        />
                        <HistoryLine
                          label="We suggested"
                          value={[
                            (lastVisit.recommended_oils ?? []).join(", "),
                            lastVisit.recommended_salt && `${lastVisit.recommended_salt} salt`,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        />
                        <HistoryLine label="Notes" value={lastVisit.notes} />
                      </dl>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            applyBlend(
                              lastVisit.aroma_oils ?? [],
                              lastVisit.salt_used,
                              lastVisit,
                            )
                          }
                          className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-medium hover:bg-black/5"
                        >
                          Same as last time
                        </button>
                        {((lastVisit.recommended_oils ?? []).length > 0 ||
                          lastVisit.recommended_salt) && (
                          <button
                            type="button"
                            onClick={() =>
                              applyBlend(
                                lastVisit.recommended_oils ?? [],
                                lastVisit.recommended_salt,
                                lastVisit,
                              )
                            }
                            className="rounded-lg border border-black/15 bg-white px-3 py-1.5 text-xs font-medium hover:bg-black/5"
                          >
                            Use what we suggested
                          </button>
                        )}
                      </div>
                      <p className="mt-1.5 text-xs text-black/40">
                        Fills in the boxes below — change anything before saving.
                      </p>
                    </>
                  )
                )}
              </div>
            )}

            {!selected && (
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
            {/* Two ways in, on purpose. `capture` makes a phone open the camera
                straight away, which is what you want with the sheet in front of
                you — but on many Android browsers it opens the camera and
                NOTHING else, so a photo already in the gallery becomes
                unattachable. The second input has no `capture` and reaches the
                gallery and the file system. Neither carries name="scan": the
                submit appends the chosen file from state, so two inputs can't
                post an empty one over a real one. */}
            <div className="flex flex-wrap gap-2">
              <PickFile
                label="Take a photo"
                capture
                onPick={(file) => {
                  setScanFile(file);
                  setUnclear(null);
                  setReadError(null);
                }}
              />
              <PickFile
                label="Choose a file"
                onPick={(file) => {
                  setScanFile(file);
                  setUnclear(null);
                  setReadError(null);
                }}
              />
            </div>

            {scanFile && (
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">{scanFile.name}</span>
                <span className="text-black/45">
                  {(scanFile.size / (1024 * 1024)).toFixed(1)} MB
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setScanFile(null);
                    setUnclear(null);
                    setReadError(null);
                  }}
                  className="text-xs font-medium text-black/60 underline"
                >
                  Remove
                </button>
              </p>
            )}

            <p className="mt-1.5 text-xs text-black/50">
              A photo of the sheet is fine. Up to 12 MB — JPG, PNG, WEBP or PDF. You can save
              without one and add the scan later.
            </p>

            {canExtract && scanFile && scanFile.type !== "application/pdf" && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={readPhoto}
                  disabled={reading}
                  className="rounded-lg border border-black/15 bg-white px-3.5 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-60"
                >
                  {reading ? "Reading the photo…" : "Read the form for me"}
                </button>
                <p className="mt-1.5 text-xs text-black/45">
                  Fills in the boxes below from the photo. Check them before saving — nothing is
                  saved until you press Save.
                </p>
              </div>
            )}

            {readError && (
              <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                {readError}
              </p>
            )}

            {/* What the reading was unsure about. Named fields, so staff know
                where to look rather than being told to check everything. */}
            {unclear && (
              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {unclear.length > 0 ? (
                  <>
                    <span className="font-semibold">Worth checking against the paper:</span>{" "}
                    {unclear.join(" · ")}
                  </>
                ) : (
                  <>Read it cleanly. Still worth a glance before you save.</>
                )}
              </div>
            )}
          </Fieldset>

          {/* ── What the guest ticked ───────────────────────────────────── */}
          <Fieldset title="Anything to take care with">
            <CheckGroup
              name="health_conditions"
              options={HEALTH_CONDITIONS}
              value={conditions}
              onChange={setConditions}
            />
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
              {HEALTH_STOP_NOTE}
            </p>
          </Fieldset>

          <Fieldset title="What they came for">
            <CheckGroup
              name="health_goals"
              options={HEALTH_GOALS}
              value={goals}
              onChange={setGoals}
            />
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
                <p className="mb-1.5 text-xs font-medium text-black/55">
                  Oils used <span className="text-black/35">— up to {MAX_AROMA_OILS}</span>
                </p>
                <CheckGroup
                  name="aroma_oils"
                  options={AROMA_OILS}
                  hints={AROMA_OIL_PURPOSE}
                  max={MAX_AROMA_OILS}
                  value={oilsUsed}
                  onChange={setOilsUsed}
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs font-medium text-black/55">
                  Oils suggested next time{" "}
                  <span className="text-black/35">— up to {MAX_AROMA_OILS}</span>
                </p>
                <CheckGroup
                  name="recommended_oils"
                  options={AROMA_OILS}
                  hints={AROMA_OIL_PURPOSE}
                  max={MAX_AROMA_OILS}
                  value={oilsNext}
                  onChange={setOilsNext}
                />
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-black/70">
            Filed{" "}
            <span className="font-normal text-black/40">
              ({listQuery ? `${visibleForms.length} of ${forms.length}` : forms.length})
            </span>
          </h2>
          {forms.length > 0 && (
            <input
              type="search"
              value={listQuery}
              onChange={(e) => setListQuery(e.target.value)}
              placeholder="Find a customer"
              className="w-full rounded-xl border border-black/15 px-3 py-2 text-sm sm:w-64"
            />
          )}
        </div>

        {forms.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/15 px-4 py-8 text-center text-sm text-black/50">
            Nothing filed yet. Print a stack of blank forms for the counter, and record them here
            once they come back signed.
          </p>
        ) : visibleForms.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-black/15 px-4 py-8 text-center text-sm text-black/50">
            No forms for “{listQuery}”.
          </p>
        ) : (
          <ul className="space-y-2">
            {visibleForms.map((form) => (
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

/**
 * A file input dressed as a button.
 *
 * The input is hidden inside the label rather than styled, because a bare file
 * input renders differently in every browser and reads as "No file chosen" even
 * when one has been. The chosen file is shown once, above, by the caller.
 */
function PickFile({
  label,
  capture,
  onPick,
}: {
  label: string;
  capture?: boolean;
  onPick: (file: File | null) => void;
}) {
  return (
    <label className="cursor-pointer rounded-lg border border-black/15 bg-white px-3.5 py-2 text-sm font-medium hover:bg-black/5">
      {label}
      <input
        type="file"
        accept={INTAKE_SCAN_TYPES.join(",")}
        {...(capture ? { capture: "environment" as const } : {})}
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        className="hidden"
      />
    </label>
  );
}

function HistoryLine({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
      <dt className="w-28 shrink-0 text-xs uppercase tracking-wide text-black/40">{label}</dt>
      <dd className="text-black/75">{value}</dd>
    </div>
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
 *
 * `max` enforces a blending rule rather than a UI preference: the pads say
 * MAX 3 OILS. Once three are on, the rest grey out instead of vanishing, so
 * what's available is still legible — and unticking one frees a slot again.
 */
function CheckGroup({
  name,
  options,
  hints,
  max,
  value,
  onChange,
}: {
  name: string;
  options: readonly string[];
  hints?: Record<string, string>;
  max?: number;
  value?: string[];
  onChange?: (next: string[]) => void;
}) {
  // Controlled when the parent passes value/onChange — which the oils do,
  // because "Same as last time" writes into them from outside. Left
  // uncontrolled otherwise, so the plain tick lists stay plain.
  const [own, setOwn] = useState<string[]>([]);
  const chosen = value ?? own;
  const setChosen = onChange ?? setOwn;
  const full = max !== undefined && chosen.length >= max;

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const on = chosen.includes(option);
        const locked = full && !on;
        return (
          <label
            key={option}
            className={`flex items-center gap-2 rounded-xl border border-black/12 px-3 py-2 text-sm has-[:checked]:border-black/40 has-[:checked]:bg-black/[0.05] ${
              locked ? "cursor-not-allowed opacity-40" : "cursor-pointer"
            }`}
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              disabled={locked}
              checked={on}
              onChange={(e) =>
                setChosen(
                  e.target.checked ? [...chosen, option] : chosen.filter((v) => v !== option),
                )
              }
              className="h-4 w-4 accent-black/70"
            />
            <span>
              {option}
              {hints?.[option] && (
                <span className="ml-1.5 text-xs text-black/40">{hints[option]}</span>
              )}
            </span>
          </label>
        );
      })}
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
