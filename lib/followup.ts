// Named tool: draft_followup (risk: Medium, see docs/AGENTIC_LAYER.md)
// Generates draft follow-up message TEXT only. It never sends anything — a human
// must review and approve in the dashboard before any message goes out.

export interface DraftFollowupInput {
  name: string;
  referral_source: string | null;
  status: string;
  lead_score: number | null;
  has_booking: boolean;
  pending_payment: boolean;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

// Produces a warm, on-brand WhatsApp follow-up tailored to where the lead is in
// the funnel. Kept short and human — this is a draft for staff to edit/approve.
export function draftFollowup(input: DraftFollowupInput): string {
  const who = firstName(input.name);

  // Already converted but hasn't picked a slot yet.
  if (input.status === "converted" && !input.has_booking) {
    return `Hi ${who}! Thanks for grabbing the RM25 first-visit foot soak + coffee at Kaki Harmoni. You haven't picked a time yet — want me to save you a slot this week? Just let me know what suits you.`;
  }

  // Converted, booked, but payment still pending.
  if (input.status === "converted" && input.pending_payment) {
    return `Hi ${who}! Looking forward to seeing you at Kaki Harmoni. Just a gentle note that your RM25 first-visit payment is still pending — you can settle it on arrival or send it ahead, whichever's easier. See you soon!`;
  }

  // Hot lead who signed up but hasn't purchased.
  if ((input.lead_score ?? 0) >= 70) {
    return `Hi ${who}! It's Kaki Harmoni. We saved your spot for the RM25 first-visit foot soak + coffee (usually RM40). It's a lovely 15 minutes to reset — want me to hold a time for you this week?`;
  }

  // Default nudge for a signed-up-but-not-converted lead.
  return `Hi ${who}! This is Kaki Harmoni — just checking in on your RM25 first-visit foot soak + coffee. No rush at all, but we'd love to have you. Want us to save you a slot this week?`;
}
