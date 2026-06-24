# Data Model — Kaki Harmoni

## signups
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| user_id | uuid nullable | owner after lock-down sprint |
| created_at | timestamptz | default now() |
| name | text | required |
| email | text | required; unique enforced in app |
| phone | text | optional |
| referral_source | text | Instagram / Facebook / TikTok / Friend / Walk-in / Other |
| status | text | `signed_up` \| `converted` |
| lead_score | numeric | **AI field** |
| lead_score_source | text | e.g. `rule_engine_v1` |
| lead_score_confidence | numeric | 0–1 |
| lead_score_review_status | text | default `unreviewed` |

## purchases
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| created_at | timestamptz | |
| signup_id | uuid FK → signups.id | required |
| product_name | text | e.g. "Kaki Harmoni Starter Pack" |
| amount_myr | numeric | purchase price in MYR |
| payment_method | text | online_transfer / cash / etc. |
| status | text | `confirmed` \| `pending` \| `cancelled` |

## activities
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| created_at | timestamptz | |
| entity_type | text | `signup` \| `purchase` |
| entity_id | uuid | FK to related row |
| action | text | e.g. `signup_created`, `purchase_confirmed` |
| actor | text | `public_form` or authenticated user id |
| metadata | jsonb | arbitrary context |

## audit_logs
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid nullable | |
| created_at | timestamptz | |
| table_name | text | |
| row_id | uuid | |
| operation | text | INSERT / UPDATE / DELETE |
| old_data | jsonb | nullable |
| new_data | jsonb | |
| actor | text | |

## RLS
- v1: permissive read + write for all tables (demo-first)
- Sprint 3: replaced with `auth.uid() = user_id` owner policies
