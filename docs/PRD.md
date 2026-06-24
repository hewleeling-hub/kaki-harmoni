# PRD — Kaki Harmoni MVP

## Problem
The sales team has no fast way to capture new leads and track who actually buys. Demand is unproven; they need real data this week.

## Target Users
- **Sales team** — monitors signups and conversions via the dashboard
- **Potential clients** — land on the page, sign up, and complete the purchase action

## Core Objects
| Object | Purpose |
|---|---|
| Signup | A person who submitted the form (name, email, phone, source) |
| Purchase | A confirmed buy linked to a Signup |
| Activity | Event log of every signup and purchase |
| Audit Log | Immutable record of every data change |

## MVP Must-Haves (v1)
- [ ] Public landing page with signup form (name, email, phone, referral source)
- [ ] Signup persists to database; duplicate email handled gracefully
- [ ] "Complete Purchase" step linked from signup confirmation
- [ ] Purchase persists to database; signup status updates to `converted`
- [ ] Sales dashboard at `/dashboard` — signup list, converted badge, counters (total signups, total purchases, conversion %)
- [ ] All rows in dashboard are editable/deletable (live data, not static)
- [ ] Loading, empty, and error states on every form
- [ ] 5 seed rows so the app looks alive on first load

## Non-Goals (v1)
- Authentication / login wall
- Email notifications
- Multiple products or pricing tiers
- Team accounts / roles
- AI scoring (flagged for Sprint 5)

## Success Criteria
A new visitor opens the landing page → fills in the signup form → sees a confirmation → clicks "Complete Purchase" → purchase is saved → the sales dashboard immediately shows the new signup as **Converted**. The whole flow works without any login.
