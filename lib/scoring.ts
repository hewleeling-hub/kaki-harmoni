// Named tool: normalise_referral (risk: Low, see docs/AGENTIC_LAYER.md)
export type ReferralSource =
  | "Instagram"
  | "Facebook"
  | "TikTok"
  | "Friend"
  | "Walk-in"
  | "Other";

export function normaliseReferral(raw: string | null | undefined): ReferralSource {
  const v = (raw ?? "").trim().toLowerCase();
  if (v.includes("instagram")) return "Instagram";
  if (v.includes("facebook")) return "Facebook";
  if (v.includes("tiktok")) return "TikTok";
  if (v.includes("friend")) return "Friend";
  if (v.includes("walk")) return "Walk-in";
  return "Other";
}

const PAID_AD_SOURCES: ReferralSource[] = ["Instagram", "Facebook", "TikTok"];

export interface ScoreLeadInput {
  referralSource: string | null | undefined;
  hasPhone: boolean;
  hoursToPurchase: number | null;
}

export interface ScoreLeadResult {
  lead_score: number;
  lead_score_source: "rule_engine_v1";
  lead_score_confidence: number;
  inputs: {
    referral_source: ReferralSource;
    has_phone: boolean;
    hours_to_purchase: number | null;
  };
}

// Named tool: score_lead (risk: Low, see docs/AGENTIC_LAYER.md)
// Rules per docs/INTELLIGENCE_LAYER.md
export function scoreLead({ referralSource, hasPhone, hoursToPurchase }: ScoreLeadInput): ScoreLeadResult {
  const normalised = normaliseReferral(referralSource);
  let score = 0;
  let knownSignals = 0;
  const totalSignals = 3; // phone, referral, purchase timing

  if (hasPhone) score += 10;
  knownSignals += 1; // phone presence is always knowable

  if (normalised === "Friend") {
    score += 20;
    knownSignals += 1;
  } else if (normalised === "Walk-in") {
    score += 15;
    knownSignals += 1;
  } else if (PAID_AD_SOURCES.includes(normalised)) {
    score += 10;
    knownSignals += 1;
  }

  if (hoursToPurchase !== null) {
    if (hoursToPurchase <= 1) score += 30;
    else if (hoursToPurchase <= 24) score += 20;
    knownSignals += 1;
  }

  const confidence = Math.min(0.9, Math.max(0.6, 0.6 + (knownSignals / totalSignals) * 0.3));

  return {
    lead_score: Math.min(100, score),
    lead_score_source: "rule_engine_v1",
    lead_score_confidence: Number(confidence.toFixed(2)),
    inputs: {
      referral_source: normalised,
      has_phone: hasPhone,
      hours_to_purchase: hoursToPurchase,
    },
  };
}
