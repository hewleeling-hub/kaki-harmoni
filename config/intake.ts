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
 * The screening list from the SPA SURVEY FORM pads in use at the counter, in
 * the order the boxes are printed. An earlier version of this list was written
 * from scratch and shared only six of these ten — it invented Epilepsy and
 * "cuts and sores", and left out Asthma, Lack of exercise, Insomnia, Arthritis
 * and Breathing problems. Staff would have been ticking a paper box with no
 * screen box to put it in.
 *
 * English only here. The pads are bilingual and the Chinese is what many guests
 * actually read; this list is the staff-facing half, so it stays in the
 * language the dashboard is in.
 */
export const HEALTH_CONDITIONS = [
  "Heart or blood vessel problems",
  "High / low blood pressure",
  "Diabetes",
  "Asthma",
  "Lack of exercise",
  "Insomnia",
  "Arthritis",
  "Breathing problems",
  "Digestion problems",
  "Pregnancy (4 months & below)",
] as const;

/**
 * The one hard stop on the form, printed under the tick boxes. Not a tick box
 * itself — it is a rule the team applies, so it is shown as a warning rather
 * than something anyone can tick and move past.
 */
export const HEALTH_STOP_NOTE =
  "Customers who have had an operation within the past 2 months should not spa. For safety reasons, please check if unsure.";

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

/**
 * Every oil the shop pours — nine, from two sources that disagree.
 *
 * The supplier's SPA SURVEY FORM pads print seven: Pine, Juniper, Rosemary,
 * Hayseed, Lavender, Camomile, Eucalyptus. The product posters carry Melissa
 * and Lemon, which are not on the pads. Both are real, so both are here, with
 * the pad's seven first and in the pad's printed order — that way keying in a
 * signed sheet is reading straight down the numbered boxes.
 *
 * "Pine" rather than "Pine Needle": the pads and /experiences both say Pine,
 * and this file was the only place using the longer name.
 */
export const AROMA_OILS = [
  "Pine",
  "Juniper",
  "Rosemary",
  "Hayseed",
  "Lavender",
  "Camomile",
  "Eucalyptus",
  "Melissa",
  "Lemon",
] as const;

/**
 * What each oil is for, as printed beside the boxes on the pads. Shown as a
 * hint when choosing, so a server suggesting something for tired legs doesn't
 * have to have the chart memorised. The two poster-only oils have no printed
 * purpose, so they get none invented for them.
 */
export const AROMA_OIL_PURPOSE: Record<string, string> = {
  Pine: "energy",
  Juniper: "muscles",
  Rosemary: "circulation, alertness",
  Hayseed: "bones",
  Lavender: "nerves",
  Camomile: "skin",
  Eucalyptus: "breathing",
};

/**
 * Three at once, no more — the pads say "AROMA OIL (MAX 3 OILS)" and that is a
 * blending rule, not a layout note. Enforced on the screen so a record can't
 * claim a blend the shop would never actually run.
 */
export const MAX_AROMA_OILS = 3;

/**
 * The three herbal spa salts.
 *
 * These are ours, from the product range — the supplier's SPA SURVEY FORM has
 * no salt section at all. So the paper pads and this screen genuinely differ
 * here, and that is deliberate rather than drift.
 */
export const SPA_SALTS = ["Melissa", "Seaweed", "Lemon"] as const;

/**
 * Machine settings, taken from the SPA SURVEY FORM pads actually in use at the
 * counter rather than invented. An earlier version of this file guessed at
 * Low/Medium/High water, Warm/Medium/Hot temperature and 15/30/45 minutes, and
 * every one of those was wrong — the pads mark degrees and the cycle is five to
 * fifteen minutes, not fifteen to forty-five.
 *
 * Worth keeping in mind when reading these: the TIME here is the machine cycle
 * on the form, which is not the "15-minute soak" the public copy sells. A guest
 * booked for a fifteen-minute visit can be set to 10 on the dial.
 */
export const WATER_LEVELS = ["70% full", "Below chest"] as const;
export const WATER_TEMPS = ["35°C", "38°C", "40°C"] as const;
export const INTENSITIES = ["Low", "Medium", "High"] as const;
export const DURATIONS = ["5", "10", "15"] as const;

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
