// Kaki Harmoni main business WhatsApp number: 019-287 1799 (country-code prefixed, no + or spaces).
export const BUSINESS_WHATSAPP_NUMBER = "60192871799";

// Secondary line for voice calls: 019-623 1799.
export const BUSINESS_CALL_NUMBER = "60196231799";
export const BUSINESS_CALL_DISPLAY = "019-623 1799";

// Normalises a Malaysian-style phone number (e.g. "012-345 6789") into
// the digits-only, country-code-prefixed format WhatsApp's click-to-chat API expects.
export function normalisePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("60")) return digits;
  if (digits.startsWith("0")) return `60${digits.slice(1)}`;
  return `60${digits}`;
}

export function whatsAppLink(phone: string, message: string): string {
  return `https://wa.me/${normalisePhoneForWhatsApp(phone)}?text=${encodeURIComponent(message)}`;
}
