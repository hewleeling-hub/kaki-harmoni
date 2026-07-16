// ── Launch configuration ─────────────────────────────────────────────────
// Flip PRELAUNCH_MODE to false on launch day to switch on real slot booking.
// While true, customers reserve + prepay to lock the launch price, but don't
// pick a time slot yet — you schedule them once you announce the opening date.
export const PRELAUNCH_MODE = true;

// First-visit two-tier pricing (MYR): cheaper to prepay, small surcharge to
// pay at the door. Prepaying is the better deal, which nudges people to pay now.
export const PREPAY_PRICE_MYR = 25;
export const WALKIN_PRICE_MYR = 30;
export const DOOR_SURCHARGE_MYR = WALKIN_PRICE_MYR - PREPAY_PRICE_MYR;

// E-wallet / DuitNow payment link customers tap to pay online.
// TODO: replace with your real Touch 'n Go / GrabPay / DuitNow link.
export const PAYMENT_LINK = "https://example.com/REPLACE-WITH-YOUR-EWALLET-LINK";
