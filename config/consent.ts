/**
 * The marketing-consent wording, in one place.
 *
 * It is shown on the website, on the staff forms and on the printed sheet, and
 * what a customer agreed to has to be the same sentence wherever they agreed to
 * it. Never pre-ticked: consent that is already ticked is not consent.
 */

/** What the customer reads and ticks. */
export const MARKETING_CONSENT_LABEL =
  "Yes, I'd like to hear about offers and news from Kaki Harmoni on WhatsApp. I can ask to stop at any time.";

/** The staff-side version: staff are recording that the customer agreed, not agreeing themselves. */
export const MARKETING_CONSENT_STAFF_LABEL =
  "Customer agreed to receive offers on WhatsApp (ticked the box, or said yes)";

/** How a yes was given. Stored with the consent so it can be traced. */
export type ConsentSource = "web_form" | "walk_in_sale" | "paper_form";
