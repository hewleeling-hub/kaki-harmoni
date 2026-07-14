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

## Sprint 7 — Product catalogue + multi-item orders
**Goal:** Sell more than the single first-visit offer; an order can hold several items.

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

## Sprint 8 — Retention + repeat-purchase tracking
**Goal:** See who comes back, who's slipping away, and act on it.

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

## Notes
- Sprint 7 is the biggest change (touches the public purchase flow, pricing, seed data,
  and the dashboard). Sprint 8 is mostly additive read-only views. Sprint 6 is medium.
- All three keep the existing "public writes via service role, staff reads via login"
  architecture and the human-approval gate for any outbound message.
