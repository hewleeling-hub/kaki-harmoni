# Tasks — Kaki Harmoni

## Gantt Overview
```
Sprint 1  [DB + Signup Form         ] Week 1 days 1-2
Sprint 2  [Purchase Action + Dashboard] Week 1 days 3-4  ← v1 functional ★
Sprint 3  [Lock It Down — Auth + RLS] Week 2 days 1-2
Sprint 4  [Notifications + Export   ] Week 2 days 3-4
Sprint 5  [Intelligence Layer       ] Week 3
```

---

## Sprint 1 — Database + Public Signup Flow
**Goal:** DB is live; any visitor can sign up and data is saved.

- [ ] Run migration SQL (all tables + seed rows)
- [ ] Build `/` landing page: product pitch copy, signup form (name, email, phone, referral_source)
- [ ] API route `POST /api/signups`: validate → INSERT → log activity
- [ ] Duplicate email returns clear error message
- [ ] Confirmation page shown after submit
- [ ] Loading spinner and error banner on form
- [ ] Deploy to Vercel; confirm seed rows appear

**Definition of Done:** Visiting `/` shows the form + seed data visible at `/dashboard`. Submitting the form creates a real DB row. Duplicate email is rejected with a message.

---

## Sprint 2 — Core Purchase Action + Dashboard ★ v1 functional
**Goal:** The full signup → purchase flow works end-to-end; sales dashboard is live.

- [ ] `/purchase/[signupId]` page with purchase confirmation form (product name pre-filled, payment method)
- [ ] API route `POST /api/purchases`: INSERT purchase → UPDATE signup status to `converted` → log both to activities
- [ ] `/dashboard` page: signup list table (name, email, source, status badge, created_at, lead_score)
- [ ] Dashboard counters: Total Signups, Total Purchases, Conversion %
- [ ] Edit signup inline (name, phone, status); delete signup with confirmation dialog
- [ ] Empty state when no signups exist
- [ ] All seed rows deletable to confirm live data

**Definition of Done:** A tester completes the full flow (sign up → purchase) in one browser session. Dashboard counters update. Rows can be edited and deleted. No dead buttons.

---

## Sprint 3 — Lock It Down (Auth + RLS)
**Goal:** Dashboard is behind login; public forms remain open.

- [ ] Supabase email auth configured
- [ ] `/login` page for sales team
- [ ] Middleware: redirect unauthenticated users from `/dashboard` to `/login`
- [ ] Replace v1 permissive RLS with owner-scoped policies on all tables
- [ ] Public signup/purchase routes remain accessible without auth
- [ ] Test: unauthenticated user cannot read `/dashboard` data via API

**Definition of Done:** Logged-out user sees `/login` when accessing `/dashboard`. Logged-in sales user sees their data. Public signup still works.

---

## Sprint 4 — Notifications + Export
**Goal:** Sales team is alerted in real time; data is exportable.

- [ ] Supabase Edge Function: send email to sales team on `signup_created` (Resend)
- [ ] Supabase Edge Function: send email on `purchase_confirmed`
- [ ] `/dashboard` → Export CSV button (signups + purchase status)
- [ ] Conversion funnel bar chart (signups vs purchases)

**Definition of Done:** New signup triggers email within 30 seconds. CSV download contains all rows with correct columns.

---

## Sprint 5 — Intelligence Layer
**Goal:** Signups are scored; hottest leads surface at the top.

- [ ] `score_lead` function: compute score from referral_source, phone presence, time-to-purchase
- [ ] Write `lead_score`, `lead_score_source`, `lead_score_confidence`, `lead_score_review_status` to signups row
- [ ] Dashboard: sort by lead_score DESC by default; show score badge
- [ ] Filter by `review_status` (unreviewed / approved / flagged)
- [ ] Draft follow-up message UI: generate text → show for human approval before any send

**Definition of Done:** Every signup has a score. Dashboard sorted by score. Draft message shown in review modal before any action is taken.
