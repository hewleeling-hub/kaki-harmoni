# Architecture — Kaki Harmoni

## Stack
| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router) on Vercel |
| Database | Supabase Postgres + RLS |
| Auth (Sprint 3) | Supabase Auth (email) |
| Notifications (Sprint 4) | Supabase Edge Functions + Resend |

## Now vs Later (feature terms)
**Now:** public landing page, signup form, purchase action, sales dashboard, seed data 
**Next:** auth + RLS lock-down, email alerts, CSV export, funnel view 
**Later:** AI lead scoring, draft follow-up messages, team roles, product catalogue

## Key User Action — Step-by-Step
1. Visitor lands on `/` — sees product pitch and signup form
2. Form submits → Next.js API route validates input → `INSERT` into `signups`
3. Activity event logged to `activities`
4. Confirmation page rendered with unique purchase link
5. Visitor clicks purchase → form submits → `INSERT` into `purchases`; `UPDATE signups SET status = 'converted'`
6. Both changes logged to `activities` and `audit_logs`
7. Sales dashboard queries `signups` joined to `purchases` — counter and list update instantly

## Layer Order
1. **Data first** — tables, RLS, seed rows (Sprint 1)
2. **App logic** — forms, API routes, dashboard CRUD (Sprints 1–2)
3. **Auth** — email login, owner-scoped RLS (Sprint 3)
4. **Smart features** — lead scoring, draft messages (Sprint 5)

## Core Without AI
Signup capture, purchase recording, and the dashboard all run on plain SQL queries. Removing the scoring column does not break any flow.
