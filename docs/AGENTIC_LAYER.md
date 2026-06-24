# Agentic Layer — Kaki Harmoni

## Risk Levels & Actions

### Low — Auto (no approval needed)
- Score a signup with the rule-based engine → write `lead_score` fields
- Tag referral source to normalised enum on signup
- Log every form submission to `activities`

### Medium — Light Approval (sales team confirms before executing)
- Draft a follow-up message for an unconverted signup
- Update a signup's status from `signed_up` to `converted` via dashboard action

### High — Always Approval
- Send a message / email to a prospect (Sprint 4+)
- Mark a purchase as `cancelled`

### Critical — Human Only
- Delete a signup or purchase record
- Issue a refund
- Any bulk data operation

## Named Tools (approved list)
| Tool | Risk | Description |
|---|---|---|
| `score_lead` | Low | Compute and write lead score for a signup |
| `normalise_referral` | Low | Map freeform source to enum |
| `log_activity` | Low | Insert row into activities |
| `draft_followup` | Medium | Generate draft message text for human review |
| `update_signup_status` | Medium | Change status field after human confirms |
| `send_email` | High | Dispatch email after explicit approval |

## Audit Log Fields (every agent action)
`table_name`, `row_id`, `operation`, `old_data`, `new_data`, `actor`, `created_at`

## v1 vs Later
- **v1:** only `score_lead`, `normalise_referral`, `log_activity` are active
- **Later:** `draft_followup` → `send_email` pipeline with approval UI
