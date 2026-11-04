/**
 * Enquiries: people who message the shop on WhatsApp or Messenger (usually off a
 * Facebook ad) and never reach the website. They are stored as ordinary signups
 * with an `enquiry*` status, so nothing new has to exist in the database, and
 * they become a normal lead the moment staff mark them booked.
 *
 * They are kept OUT of the main dashboard counters on purpose: an enquiry is
 * not yet a signup, and counting it would drag the conversion rate down every
 * time someone asks a question.
 */
export const ENQUIRY_STATUS = "enquiry";
export const ENQUIRY_FOLLOWED_UP = "enquiry_followed_up";
export const ENQUIRY_LOST = "enquiry_lost";
export const ENQUIRY_STATUSES = [ENQUIRY_STATUS, ENQUIRY_FOLLOWED_UP, ENQUIRY_LOST];

/** Where the enquiry came in. Stored in referral_source; scoring still reads "Facebook". */
export const ENQUIRY_SOURCES = [
  "Facebook ad (WhatsApp)",
  "Facebook ad (Messenger)",
  "Instagram",
  "Other",
] as const;

export const isEnquiryStatus = (s: string | null | undefined): boolean =>
  !!s && ENQUIRY_STATUSES.includes(s);

const HOUR = 60 * 60 * 1000;
/** A new enquiry is due a nudge after a day of silence. */
export const FIRST_NUDGE_AFTER_MS = 24 * HOUR;
/** Someone already nudged is only raised again after three more days. */
export const SECOND_NUDGE_AFTER_MS = 72 * HOUR;

/**
 * Whether an enquiry should be chased now. `lastTouch` is when they enquired,
 * or when staff last followed up, whichever is later.
 */
export function enquiryIsDue(status: string, lastTouchISO: string, now: number = Date.now()): boolean {
  if (status === ENQUIRY_LOST) return false;
  const wait = status === ENQUIRY_FOLLOWED_UP ? SECOND_NUDGE_AFTER_MS : FIRST_NUDGE_AFTER_MS;
  return now - new Date(lastTouchISO).getTime() >= wait;
}
