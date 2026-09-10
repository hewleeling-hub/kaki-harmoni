/**
 * Spa intake form.
 *
 * PAPER FIRST. The guest fills in a printed form and signs it; a member of
 * staff scans it, uploads the image, and keys in the parts worth having as
 * data. The signature on paper is the consent record — the fields exist so a
 * returning guest's blend can be seen at a glance and anything needing care
 * shows on the dashboard without opening an image.
 *
 * There is no public route and no flag guarding one. Everything lives under
 * /dashboard, which already redirects to /login, so if this branch reaches
 * production by accident it is an unused authenticated route and nothing a
 * customer can find.
 *
 * ONE source for the printed form and the screen. The paper and the tick
 * boxes come from the lists below, so a question can't exist on one and not
 * the other — which is exactly how a paper process and a system drift apart.
 */

/**
 * Screening questions, worded as things a guest would recognise about
 * themselves rather than as diagnoses. Their purpose is for the team to know
 * when to check before someone puts their feet in warm water — the FAQ already
 * tells people to have a word with their doctor — so "none of these" is a real
 * answer and the list stays short enough to read in a waiting area.
 */
export const HEALTH_CONDITIONS = [
  "Pregnant",
  "Heart condition or pacemaker",
  "High or low blood pressure",
  "Diabetes",
  "Cuts, sores or skin conditions on the feet or legs",
  "Recent surgery or injury",
  "Epilepsy",
  "Something else — I'll mention it",
] as const;

/**
 * Why they came, in the words the site uses. Deliberately about how someone
 * wants to feel rather than what a soak might do to them: the same line the
 * public copy holds, and an intake form is not the place to start implying
 * outcomes. Steers which blend the team suggests.
 */
export const HEALTH_GOALS = [
  "Unwind after a long day",
  "A quiet fifteen minutes to myself",
  "Tired feet and legs",
  "Time with someone I came with",
  "Trying it for the first time",
] as const;

/** The seven aromatic oils. Matches what /experiences promises. */
export const AROMA_OILS = [
  "Lavender",
  "Camomile",
  "Melissa",
  "Eucalyptus",
  "Juniper",
  "Pine Needle",
  "Lemon",
] as const;

/** The three herbal spa salts. */
export const SPA_SALTS = ["Melissa", "Seaweed", "Lemon"] as const;

/** Machine settings, as the dials are actually marked. */
export const WATER_LEVELS = ["Low", "Medium", "High"] as const;
export const WATER_TEMPS = ["Warm", "Medium", "Hot"] as const;
export const INTENSITIES = ["Gentle", "Medium", "Strong"] as const;
export const DURATIONS = ["15", "30", "45"] as const;

/**
 * Where signed scans go. A PRIVATE Supabase Storage bucket — these are
 * photographs of a signed form carrying health answers and an IC or passport
 * number, so they are never served from a public URL. The dashboard reads them
 * through short-lived signed URLs generated server-side.
 */
export const INTAKE_SCAN_BUCKET = "intake-scans";

/** What a phone camera actually produces, plus PDF from a desk scanner. */
export const INTAKE_SCAN_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"] as const;

/** 12 MB — a phone photo of an A4 sheet, without room for a video by mistake. */
export const INTAKE_SCAN_MAX_BYTES = 12 * 1024 * 1024;

/**
 * What the dashboard reads back. Named columns rather than `*` for two reasons.
 *
 * `ic_passport_no` is not in this list. It is on the paper and it is in the
 * table, but nothing on screen needs it, and the fastest way to leak an
 * identity number is to select it into a page that only ever displays a name.
 *
 * And listing the columns 0018 adds makes an unapplied migration fail loudly
 * here. `spa_survey_forms` already exists in production without them, so `*`
 * would return rows quite happily and the screen would look ready right up
 * until the first save failed.
 */
export const INTAKE_COLUMNS = [
  "id",
  "created_at",
  "signup_id",
  "survey_date",
  "guest_name",
  "contact_no",
  "voucher_no",
  "health_conditions",
  "health_goals",
  "water_level",
  "water_temp",
  "intensity",
  "duration_min",
  "aroma_oils",
  "recommended_oils",
  "salt_used",
  "recommended_salt",
  "server_name",
  "notes",
  "scan_path",
].join(", ");
