# Kaki Harmoni — handoff brief

Paste this whole file as your opening instruction. It is written to be read cold,
with no prior conversation.

---

## 1. What this is

Kaki Harmoni is a 15-minute foot-spa business at Desa Cindaimas Condominium
Clubhouse, Jalan Sekutu, Taman Gembira, 58200 Kuala Lumpur. This repo is its
live website and booking app — not a marketing page. Real customers sign up,
pick a slot and pay through it, and the rows land in a production database that
already holds real bookings.

**The core job the app must do:** a stranger lands on the homepage, enters their
details, picks a time, pays, and a staff member sees that booking. Everything
else is secondary to that path still working.

There is a **limited-period 11.11 promotion** running right now. Most of the
recent work is that promotion, and section 4 is the part you must read before
touching anything price- or voucher-related.

Deeper background lives in `/docs` (`PRD.md`, `ARCHITECTURE.md`,
`DATA_MODEL.md`, `TASKS.md`, `TEST_PLAN.md`, `DEV_SETUP.md`). Read `PRD.md` and
`DATA_MODEL.md` before your first change.

---

## 2. Stack and deploy — binding rules

- **Next.js 15 (App Router), React 19, TypeScript, Tailwind 4, Turbopack.**
  Node 22. Scripts: `npm run dev`, `build`, `start`, `lint`, `typecheck`.
- **Supabase Postgres** (project ref `culjkdjmemhxxdxvrbyo`, ap-southeast-1)
  with RLS. Server code uses a service-role admin client
  (`lib/supabase/admin.ts`).
- **Vercel** hosts it, auto-deploying from GitHub. Custom domain
  **www.kakiharmoni.com**.

**Rules that are not negotiable:**

1. **Deploy by git, never by CLI.** `git add -A && git commit && git push`.
   Do **not** run `vercel deploy` / `vercel --prod` from local files — it
   desyncs git and the next push silently overwrites the live app.
2. **Commit and push every change.** Git is the source of truth; uncommitted
   work is lost.
3. **Commit as the owner's GitHub identity or Vercel blocks the deploy.**
   Vercel verifies every commit author email belongs to the GitHub account:
   ```
   git config user.email "238494399+hewleeling-hub@users.noreply.github.com"
   git config user.name  "hewleeling-hub"
   ```
4. **Never put secrets in frontend code.** Env vars come from Vercel
   (`vercel link`, then `vercel env pull .env.local`). The names in use are
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_APP_URL`. Do not invent new ones
   and do not commit values.
5. **Demo-first: no login wall on the public app.** The homepage *is* the
   working app and must stay reachable by anyone. `/dashboard` is the staff
   area and is gated; the public flow is not. Do not add a redirect to
   `/login` on the public pages.

---

## 3. Database — already provisioned, do not re-initialise

**Migrations `0001`–`0024` are APPLIED to production**, with one exception:

- **`0005_team_roles.sql` has NOT been applied** (no `profiles` table), which
  is why the team feature is off. Leave it that way unless asked.

**Re-running `0001_init.sql` against this database is destructive, not a setup
step.** It holds real signups, purchases and products. Build on the existing
tables. If unsure of a column, query the live schema rather than guessing — I
have twice written a column name that does not exist.

Tables you will actually touch:

| Table | What it is |
|---|---|
| `signups` | A person. Deduped on email, but **email is optional since 0008**, so one person can own several rows. |
| `purchases` | A booking. `booking_date` / `booking_time` are **nullable** — a dateless purchase is legitimate (see 4.4). |
| `order_items` | Line items per purchase. |
| `products` | The catalogue. **Every price charged is read from here, never from page copy or a request body.** |
| `vouchers` | Prepaid 11.11 soaks. RLS enabled with **no policies** — service-role only, because a voucher is worth money. |

**Identity is the phone number, not the row.** `signups.phone_normalised`
(written by `normalisePhoneForWhatsApp()` / `phoneKeyFor()`) collapses all six
Malaysian formats to one key. Every per-person rule — first-visit-once, the
voucher cap, "has this person booked before" — counts on that key. Counting
`signups` rows instead would let one person sign up twice and double their
allowance. This has already been got wrong once; do not reintroduce it.

---

## 4. The 11.11 promotion — the domain rules

From the poster, and all four are enforced in code, not just printed:

> **11.11 Foot Spa Voucher — RM11 per session. Buy by 11 November 2026.
> Maximum 2 vouchers per person. Redeem by 31 December 2026.**

### 4.1 Offers are date-driven and self-expiring

`config/promotions.ts` owns the offer and its window. The band, the nav CTA,
the struck-through prices and the paused RM30 first-visit offer all appear and
disappear on their own. **Nobody has to remember to take the promotion down.**

Two traps that have already caused bugs:

- **Use UTC instants, not local dates.** Kuala Lumpur is UTC+08:00.
  `sellUntil` is `2026-11-11T16:00:00Z`, which is midnight *ending* the 11th in
  KL. `2026-11-11T00:00:00Z` would be 8am local and would close the sale while
  the shop was still taking money for it.
- **Module-level constants freeze at server start.** Anything that depends on
  "now" must be a **function** called per request — `faqsNow()`,
  `routinePackagesNow()`, `soakOfferPrice()`, `activeVoucherOffer()`. A
  `const` evaluated at import time will be stale by the next day.
- **Server vs client.** The date check is resolved in `PublicShell` (a server
  component) and passed to `Nav` (a client component) as a prop. Doing the
  check in both places causes a hydration mismatch.

### 4.2 One source for every price surface

`soakOfferPrice()` is the single source for "what a soak costs right now,
as it should be shown". It exists because the RM11 price was added to the band,
then the prices page, then the ladder — each pass fixing only the surfaces that
pass happened to look at — and the site ended up quoting RM30 or RM40 in six
places while running an RM11 offer.

**If you change a price, grep the whole repo.** Do not patch the one screen in
front of you.

### 4.3 The cap, and which way each check fails

Two functions in `lib/vouchers.ts`, and they fail in **opposite** directions on
purpose:

- **`voucherAllowance()` FAILS CLOSED.** It returns `countable: false` when the
  query fails or there is no usable phone number, and callers must refuse.
  An earlier version read a failed count as "holds none", which turned every
  database hiccup into unlimited RM11 vouchers for whoever hit it.
- **`unusedVoucherFor()` FAILS SAFE (returns null).** It decides whether to
  charge, so a failure must mean "they pay again and a human sorts it out",
  never "a free soak for anyone whose query errored".

Do not "tidy" these into consistency. The asymmetry is the design.

The cap is **shared across every route**. Two bought in the band and two bought
at checkout is still two, not four, because both count rows on
`phone_normalised`. `/api/purchases` re-checks server-side: hiding a radio
button is presentation, not a rule.

### 4.4 Voucher lifecycle — the part most likely to be broken by a change

A voucher is a **prepaid credit with a redeem-by date**, not an appointment.
That one sentence explains every rule below.

```
vouchers.purchase_id IS NULL  →  paid for, no slot yet, redeemable
vouchers.purchase_id IS SET   →  its slot has been booked, spent
```

- **Buying N vouchers writes N rows.** The cap counts rows, so two sold as a
  single RM22 line would otherwise be invisible to it. Only the first row is
  attached to the purchase, and only if a slot was actually chosen.
- **Quantity is NOT a capacity multiplier.** Two vouchers are two prepaid
  soaks, not two machines at once. Multiplying would refuse a customer a slot
  that has room for them. See the comment in `/api/purchases/route.ts`.
- **Redeeming collapses to one soak** however many a request claims, and a
  held voucher is only spent against a booking that actually has a slot.
- **Expired vouchers are unusable but still count toward the cap** — someone
  cannot let two lapse and buy two more.
- `vouchers.purchase_id` is `ON DELETE SET NULL`, never CASCADE: deleting a
  booking must free the voucher, not destroy the record that someone paid.
- `redeemed_at` is **deliberately not reused** for this. Redemption happens at
  the counter and is tracked in StoreHub; `purchase_id` only means "a slot has
  been booked against it".

### 4.5 One funnel, details entered once

This was the most recent change and it was made in response to direct feedback:
*"I don't like the way it is making people go round and round"* and *"if they
come through this channel, they should not have to key in the details again
later."*

The band used to carry its own claim form — name, number, quantity, pay by QR —
and then hand the customer to the ordinary booking flow to **type the same name
and number again** and pick a time. Two funnels for one purchase.

**It is now one funnel, and it must stay one.** The band's CTA goes to
`/?option=eleven-eleven#reserve`, which is the ordinary reserve form with the
voucher preselected. From there it is the same three steps as any booking:

```
homepage reserve form (name, phone, optional email)
   → POST /api/signups
   → /confirmation/[id]
   → /purchase/[id]/book          pick a slot   ──┐
   → /purchase/[id]               pay             │ or skip the slot:
   → /purchase/[id]/success                       └→ /purchase/[id]?later=1
```

- The `?option=` slug travels the whole way (`withOption()`), so the choice
  survives every hop. **Do not add a step that re-asks for name or phone.**
- **Up to two vouchers in one order.** The picker tops out where the cap does.
- **"I'd rather pay now and pick my time later"** (`?later=1`) is offered for
  the voucher only, and only to someone actually buying — not to someone who
  already owns one, who has nothing left to pay and only needs a time.
- On the `later=1` path the voucher is the only sellable item, enforced
  server-side, because `later=1` is a URL anyone can type. A dateless RM40
  visit has no redeem-by terms and would just become something to chase.

---

## 5. Where the rules live

| File | Owns |
|---|---|
| `config/promotions.ts` | The offer, its window, `activeVoucherOffer()`, `soakOfferPrice()`, `firstVisitPaused()`, `voucherBuyHref()`, `isVoucherProduct()` |
| `config/catalogue.ts` | Slug ↔ product-id bridge (`?option=` values), soaks-per-unit for capacity |
| `config/business.ts` | What the site *says* — copy, hours, FAQs, package ladder |
| `lib/vouchers.ts` | The cap (`voucherAllowance`, `refuseVoucherClaim`) and redemption lookup (`unusedVoucherFor`) |
| `lib/order-lines.ts` | Turning a request into priced lines; quantity ceilings; prices from the DB |
| `lib/customer.ts` | `phoneKeyFor()`, `hasBookedBefore()` — the identity rules |
| `lib/slots.ts`, `lib/capacity.ts` | Slot generation and per-slot machine occupancy |
| `app/api/purchases/route.ts` | The checkout. The single most important file. |
| `components/ui/VoucherBanner.tsx` | The self-expiring 11.11 band |
| `app/purchase/[signupId]/**` | book → pay → success |
| `app/dashboard/**` | Staff area (gated) |

**Opening hours:** first slot 10:30. Last slot 17:30 weekdays, **15:30 Saturday
and Sunday**.

---

## 6. Verification — read this before you claim something works

**The cloud container's network policy blocks outbound access to both
`*.supabase.co` and the `*.vercel.app` deployments.** You therefore **cannot**
run the app end-to-end against the real database from the dev container. Plan
around it; do not discover it late and do not claim a pass you did not get.

What works:

- `npm run typecheck` and `npm run lint`.
- `npm run build`, then `npm run start` — **pages that do not hit the database
  render fine** (homepage, band, prices, FAQ, about, how-it-works).
- `npx tsx --env-file=.env.local scripts/test-order-lines.ts`
  `npx tsx --env-file=.env.local scripts/test-voucher-rules.ts`
  These exercise the **real** functions with a stubbed Supabase client:
  quantity clamping, prices-from-catalogue, the cap table, slug routing.
  Add to them rather than writing throwaway probes.
- Reading and writing the production database **through the Supabase MCP tool**,
  which routes differently and does work. This is how you verify that a run a
  human performed produced the right rows.

**Two verification failures worth not repeating:**

1. I once reported every page "clean" because a stale dev server was serving
   500s whose HTML contained none of my search strings. **Absence looked like
   success.** Always assert the status code, and grep for something you expect
   to be *present*, not only for what should be gone.
2. React splits text nodes with `<!-- -->` comments, so a literal grep for
   `"Get your RM11 voucher"` returns zero on markup that reads
   `Get your <!-- -->RM11<!-- --> voucher`. Grep for a distinctive fragment.

---

## 7. Where things stand

**Done and deployed to the branch** `claude/kh-app-project-setup-s2wkcj`:

- The 11.11 band, self-expiring, with the three poster terms.
- Two-per-person cap on `phone_normalised`, shared across every route,
  failing closed.
- Voucher sold through the single ordinary funnel, 1 or 2 per order, with
  pay-now-pick-later.
- Redemption: a held voucher books a slot at RM0, marked "(already paid)".
- RM30 first-visit offer paused for the promotion, auto-reverting at midnight
  KL on 12 November.
- Struck-through pricing site-wide from one source; RM40 alternative removed.
- All "free coffee" claims removed from code **and** from six live product
  descriptions in the database.
- Double Reset withdrawn.
- Slot times 10:30–17:30 weekday, 10:30–15:30 weekend.
- DuitNow QR payment with "put your full name in the reference" plus
  "send us a screenshot" instructions.

**Not done:**

1. **The branch is NOT merged to `main`.** www.kakiharmoni.com does **not**
   have the promotion yet. Merging is the owner's call — ask, do not merge
   unprompted.
2. **No staff view of vouchers.** `/dashboard` shows signups and purchases but
   nothing reads the `vouchers` table, so Supabase is currently the only place
   to see who claimed an RM11 voucher and whether they paid. **This is the
   highest-value next piece of work:** a list with name, number, paid/unpaid,
   and a button to mark one paid when the WhatsApp screenshot arrives.
3. **Test rows in `vouchers`** from the owner's own walkthroughs. Confirm with
   the owner before deleting anything — some rows in these tables are real
   customers.
4. Two small copy staleness items: `/prices` still says "from RM40 for a
   one-off down to RM28 a visit on the 30-Day Routine" although packages are
   off the checkout; and the site's structured data advertises
   `priceRange: RM30–RM840`, stale at both ends during the promotion.

---

## 8. How to work

1. **Read before writing.** `docs/PRD.md`, `docs/DATA_MODEL.md`,
   `docs/ARCHITECTURE.md`, and the file you are about to change — the comments
   in this codebase record *why*, and several of them exist because the
   opposite was tried and broke something.
2. **Every button and form must persist to the database and the UI must
   reflect it.** No dead buttons, no read-only screens of seeded data. Seeded
   rows are demo placeholders the user can also create, edit and delete.
3. **Match the surrounding style.** This codebase comments the reasoning behind
   a rule, not the mechanics of the line. Keep that.
4. **Re-read your own diff adversarially before pushing.** The last two real
   bugs were found that way, not by tests: a link shown to people it could do
   nothing for, and a rule enforced in the link that offered it but not on the
   URL anyone could type.
5. **Say plainly what you did not verify.** Given section 6 you will often be
   unable to test a database path yourself. Name it; do not paper over it.
6. Commit and push after each coherent chunk, with the identity in section 2.
