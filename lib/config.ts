// ── Launch configuration ─────────────────────────────────────────────────
// PRELAUNCH_MODE off => real slot booking is on: customers reserve, pick a
// time slot, then pay — payment is what confirms the slot. Set back to true to
// pause slot booking (reservations then skip straight to confirmation).
export const PRELAUNCH_MODE = false;

// Legacy pre-launch label (kept for any old references). Booking is now open —
// see BOOKING_START_* below for the live booking window.
export const LAUNCH_WINDOW = "early August";

// First date customers can book, and how far ahead the calendar runs.
export const BOOKING_START_DATE = "2026-09-11"; // ISO (Asia/Kuala_Lumpur)
export const BOOKING_START_LABEL = "11 September 2026";
export const BOOKING_WINDOW_DAYS = 30;

// First-visit two-tier pricing (MYR): cheaper to prepay, small surcharge to
// pay at the door. Prepaying is the better deal, which nudges people to pay now.
export const PREPAY_PRICE_MYR = 25;
export const WALKIN_PRICE_MYR = 30;
export const DOOR_SURCHARGE_MYR = WALKIN_PRICE_MYR - PREPAY_PRICE_MYR;

// DuitNow QR image customers scan to pay online (any bank or e-wallet).
// Save your QR poster to public/duitnow-qr.png.
export const PAYMENT_QR = "/duitnow-qr.png";
