// Kaki Harmoni main business WhatsApp number: 019-287 1799 (country-code prefixed, no + or spaces).
export const BUSINESS_WHATSAPP_NUMBER = "60192871799";

// The same number as a person reads it. WhatsApp links carry the digits in the
// href, so a "WhatsApp us" link left the number invisible until the chat
// actually opened — no use to anyone saving the contact, ringing from another
// phone, or checking they have the right shop. Kept beside the raw number so
// the two cannot drift.
export const BUSINESS_WHATSAPP_DISPLAY = "019-287 1799";

// Secondary line for voice calls: 019-623 1799.
export const BUSINESS_CALL_NUMBER = "60196231799";
export const BUSINESS_CALL_DISPLAY = "019-623 1799";

// Normalises a Malaysian-style phone number (e.g. "012-345 6789") into
// the digits-only, country-code-prefixed format WhatsApp's click-to-chat API expects.
export function normalisePhoneForWhatsApp(phone: string): string {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";

  // A leading "+" means the country code is already there — take it as given.
  // Without this every number was assumed Malaysian, so a Singapore number
  // written +65 8420 0800 became 606584200800 and a UK +44 became 6044…:
  // nonsense to WhatsApp, and a shape no real number has. Kaki Harmoni has
  // customers on both already.
  if (trimmed.startsWith("+")) return digits;

  if (digits.startsWith("60")) return digits;
  if (digits.startsWith("0")) return `60${digits.slice(1)}`;
  return `60${digits}`;
}

export function whatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${normalisePhoneForWhatsApp(phone)}?text=${encodeURIComponent(message)}`;
}
