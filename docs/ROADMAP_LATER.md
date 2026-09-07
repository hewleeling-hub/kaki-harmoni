# Roadmap — "Later" features (Sprints 6–8)

The three remaining items from the "Later" column. Sequenced so each builds
on the last. Every sprint: migration first → server/API → UI → commit + push.

Current baseline (from applied migrations `0001`–`0004`):
- One shared staff login; RLS is `authenticated`-scoped (all staff see all rows).
- `purchases` = one product name + one amount per row; links to `signups` by FK.
- Public flows write via the service-role key; dashboard reads via the logged-in user.

---

## Sprint 6 — Team accounts + role-based access  ✅ BUILT (pending migration apply + push)
**Goal:** More than one teammate can log in, and what they can do depends on their role.

**Shipped:** `profiles` table + roles (migration `0005`), `handle_new_user` trigger,
`current_user_role()` helper, RLS delete restricted to owner/manager, `lib/auth.ts`
role helpers, `/api/team` + `/api/team/[id]` (invite/change-role/remove, manager-guarded),
`/dashboard/team` page, Team nav + delete button gated by role. Existing users are
backfilled as `owner`.

**Why first:** it gates who can manage the catalogue (Sprint 7) and see revenue/retention
(Sprint 8), so the admin surfaces built later are protected from day one.

**Schema — migration `0005_team_roles.sql`:**
- `profiles` table: `id uuid PK → auth.users.id`, `email`, `full_name`, `role`
  (`owner` | `manager` | `staff`), `created_at`.
- Trigger `handle_new_user`: auto-create a `profiles` row on signup (default role `staff`).
- SQL helper `current_role()` reading `profiles` for `auth.uid()`.
- RLS: keep `authenticated` read on all tables; restrict **delete** on `signups`/`purchases`
  to `owner`/`manager` only.

**Roles:**
- **owner / manager** — full access: view, edit, delete, mark paid, manage team, see revenue.
- **staff** — view leads, add follow-ups, mark paid; cannot delete or manage team.

**App:**
- Extend `lib/auth.ts`: `requireRole('manager')` alongside `requireStaff()`.
- `/dashboard/team` page (owner/manager only): list teammates, invite by email
  (Supabase admin invite via service role), change/remove roles.
- Gate destructive buttons + the Team nav item in the UI by role.

**Done when:** a second teammate can be invited, logs in, sees leads, and the delete/team
controls are hidden for a `staff` account and present for a `manager`.

---

## Sprint 7 — Product catalogue + multi-item orders  ✅ BUILT (pending migration apply + push)
**Goal:** Sell more than the single first-visit offer; an order can hold several items.

**Shipped:** `products` + `order_items` tables (migration `0006`, seeded catalogue,
existing purchases backfilled as single-line orders); `POST /api/purchases` now accepts
an items array and prices every line from the DB; the public purchase page is a catalogue
picker with quantity steppers and a live total; `/api/products` + `/api/products/[id]` CRUD
(manager-guarded); `/dashboard/products` admin page (add/edit/archive/price); a Catalogue
nav item for managers; and the dashboard shows itemised line items per order. Backward
compatible — if `0006` isn't applied, the flow falls back to the single first-visit item.

**Schema — migration `0006_catalogue.sql`:**
- `products` table: `id`, `name`, `description`, `price_myr`, `category`
  (`service` | `addon` | `package`), `active bool`, `sort_order`.
  Seed: First-Visit Soak + Coffee (RM25), Foot Hydrotherapy (RM40), Extra Coffee,
  5-Visit Package, etc.
- `order_items` table: `id`, `purchase_id FK`, `product_id FK`, `quantity`,
  `unit_price_myr`, `line_total_myr`.
- Keep `purchases` as the order header; `amount_myr` becomes the computed order total.
- Backfill: one `order_items` row per existing purchase.

**App:**
- Public purchase page: pick items + quantities from active catalogue → live total → confirm.
- `POST /api/purchases`: accept an items array, insert header + line items, sum the total.
- Dashboard: show line items per order.
- `/dashboard/products` (owner/manager): CRUD catalogue — add/edit/deactivate, set prices.

**Done when:** a customer can add two different items in one order, the total is correct,
and staff see the itemised order on the dashboard.

---

## Sprint 8 — Retention + repeat-purchase tracking  ✅ BUILT (pending migration apply + push)
**Goal:** See who comes back, who's slipping away, and act on it.

**Shipped:** `customer_stats` view (migration `0007`, security-invoker, seeded with a
returning + a lapsed customer); `GET /api/retention` (manager) with repeat-rate/returning/
new/lapsed summary; `POST /api/signups/[id]/visit` to log a repeat visit (creates a
confirmed/attended order so retention data can grow); `/dashboard/retention` page with
metric cards, a lapsed win-back list (draft in Lotti's voice → edit → copy / open WhatsApp),
and an active-customers list with a record-visit action; a Retention nav item for managers;
`draftWinBack()` added to `lib/followup.ts`. Degrades gracefully if `0007` isn't applied.

**Schema — migration `0007_retention.sql`:**
- DB view `customer_stats`: per signup/customer — `visit_count`, `total_spend_myr`,
  `first_purchase_at`, `last_purchase_at`, `days_since_last_visit`,
  `retention_status` (`new` = 1 visit | `returning` = 2+ | `lapsed` = no visit in 45 days).

**App:**
- Dashboard "Retention" section: repeat-rate %, returning vs new split, lapsed-customer
  list for win-back, cohort by first-visit month.
- A customer-centric view (grouped by person, not per-signup) showing full visit history.
- Wire the existing `draft_followup` tool to a "win back lapsed customer" template.

**Done when:** the dashboard shows repeat rate and a lapsed-customer list, and a win-back
draft can be generated for a lapsed customer (human-approved before send, per the
existing agentic gate).

---

## After launch — align the booking grid to the machine cycle
**Deferred on 7 Sep 2026, deliberately.** Not a bug; the availability maths is correct
as it stands. This is throughput left on the table.

A soak is 15 minutes and the machine then stands for 30, so one guest occupies one
machine for **45 minutes**. Slots are offered every **30 minutes**. The two don't divide,
so a machine that comes free at 11:15 can't be used until 11:30 — 15 minutes wasted every
cycle. At full occupancy that caps the shop at **4 guests/hour** across the 4 machines.

Moving to 45-minute slots (10:00, 10:45, 11:30, 12:15, …) aligns the grid to the machines:
**5.3 guests/hour**, roughly 33% more capacity, no idle gap.

- **Change:** `SLOT_INTERVAL_MINUTES` in `lib/slots.ts` from 30 to 45. `blockingSlotsFor()`
  derives from it, so one guest would then block exactly one slot and `machinesBusyAt()`
  keeps working untouched.
- **Why not now:** the 11 Sept booking sits at 10:30, which is not on a 45-minute boundary.
  Changing the grid strands existing bookings between slots, so it must happen either
  before any bookings exist or during a quiet period with staff told what moved.
- **Watch first:** whether the rest period is really 30 minutes in practice. If the machines
  turn round faster, the interval should follow the real number rather than this one.

---

## Notes
- Sprint 7 is the biggest change (touches the public purchase flow, pricing, seed data,
  and the dashboard). Sprint 8 is mostly additive read-only views. Sprint 6 is medium.
- All three keep the existing "public writes via service role, staff reads via login"
  architecture and the human-approval gate for any outbound message.
