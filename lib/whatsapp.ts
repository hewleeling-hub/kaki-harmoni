// Kaki Harmoni business WhatsApp number: 012-376 3081 (Malaysian format, country-code prefixed, no + or spaces).
export const BUSINESS_WHATSAPP_NUMBER = "60123763081";

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
