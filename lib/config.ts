// ── Launch configuration ─────────────────────────────────────────────────
// Flip PRELAUNCH_MODE to false on launch day to switch on real slot booking.
// While true, customers reserve + prepay to lock the launch price, but don't
// pick a time slot yet — you schedule them once you announce the opening date.
export const PRELAUNCH_MODE = true;

// When you expect to open — shown in the reservation messaging so people know
// roughly when their visit will be. Update to an exact date once you have one.
export const LAUNCH_WINDOW = "early August";

// First-visit two-tier pricing (MYR): cheaper to prepay, small surcharge to
// pay at the door. Prepaying is the better deal, which nudges people to pay now.
export const PREPAY_PRICE_MYR = 25;
export const WALKIN_PRICE_MYR = 30;
export const DOOR_SURCHARGE_MYR = WALKIN_PRICE_MYR - PREPAY_PRICE_MYR;

// DuitNow QR image customers scan to pay online (any bank or e-wallet).
// Save your QR poster to public/duitnow-qr.png.
export const PAYMENT_QR = "/duitnow-qr.png";
