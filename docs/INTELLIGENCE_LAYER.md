# Intelligence Layer — Kaki Harmoni

## Messy Inputs
- Referral source entered freeform by visitor (normalised to enum on save)
- Time between signup and purchase (derived at query time)
- Phone number presence / absence

## Auto-Structure Schema (lead scoring event)
```json
{
  "signup_id": "uuid",
  "scored_at": "2024-07-01T10:00:00Z",
  "inputs": {
    "referral_source": "Instagram",
    "has_phone": true,
    "hours_to_purchase": null
  },
  "lead_score": 74,
  "lead_score_source": "rule_engine_v1",
  "lead_score_confidence": 0.75,
  "lead_score_review_status": "unreviewed"
}
```

## Events to Track
- `signup_created` — form submitted
- `purchase_confirmed` — purchase step completed
- `lead_scored` — score written to signups row

## Scoring Rules (v1 — rule-based, no ML)
| Signal | Points |
|---|---|
| Has phone number | +10 |
| Referral = Friend | +20 |
| Referral = Organic (walk-in) | +15 |
| Referral = Paid ad | +10 |
| Purchased within 1 hour | +30 |
| Purchased within 24 hours | +20 |

Max score ~100. Stored as `lead_score` with `confidence` = 0.6–0.9 based on data completeness.

## What Gets Ranked
Signups table sorted by `lead_score DESC` in dashboard. Sales team sees hottest leads first.

## v1 vs Later
- **v1:** rule-based scoring on signup creation
- **Later:** ML model trained on historical converted vs non-converted signups
