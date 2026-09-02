# Dev Setup — Kaki Harmoni

Working notes for continuing website work. Read this alongside `CLAUDE.md`.

## Provisioned infrastructure

| Thing | Value |
|---|---|
| Repo | `hewleeling-hub/kaki-harmoni` |
| Live site | https://kaki-harmoni.vercel.app |
| Vercel team | `Kaki Harmoni` — `team_F4bsqnaZWOQQiX1ZRGjbVoxC` |
| Vercel project | `kaki-harmoni` — `prj_aWsJpljVVkRXaUTcTT1l1EJQsdld` (auto-deploys from `main`) |
| Supabase project | `kaki-harmoni` — ref `culjkdjmemhxxdxvrbyo` (ap-southeast-1) |
| Supabase URL | https://culjkdjmemhxxdxvrbyo.supabase.co |

There is a **second, separate** Supabase project (`kaki-harmoni-financials`) and a second
Vercel project of the same name. They belong to a different app — don't point this one at them.

## Running it locally

Dependencies, `.env.local` and the git commit identity are all set up automatically by
`.claude/hooks/session-start.sh` on session start. Then:

```
npm run dev        # http://localhost:3000
npm run build      # production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
```

### The one secret you must supply

`SUPABASE_SERVICE_ROLE_KEY` is **not** retrievable through the Supabase MCP tools, so the
hook leaves it blank. Copy it from Supabase → Settings → API → `service_role`, or from
Vercel → project `kaki-harmoni` → Settings → Environment Variables, and paste it into
`.env.local`.

Without it the site still renders and all read paths work, but **every public write fails
with a 500** — signup, purchase and booking. That is not a bug: migration `0004` locked RLS
down to `authenticated` only, and the public API routes are meant to write through the
service-role key, which bypasses RLS. `lib/supabase/admin.ts` falls back to the anon key,
which RLS then rejects. Symptom: `POST /api/signups` → `{"error":"Something went wrong."}`.

`.env.local` is gitignored. Never commit it, and never move the service-role key into any
`NEXT_PUBLIC_*` variable — that would ship full database access to the browser.

## Database state

Live data as of this setup: 20 signups, 17 purchases, 5 products.

Tables: `signups`, `purchases`, `activities`, `audit_logs`, `products`, `order_items`,
`spa_survey_forms`, plus the `customer_stats` view.

### ⚠️ Migration `0005_team_roles.sql` is NOT applied

The `profiles` table does not exist in the database, so `0005` (team roles) has never been
run. Consequences:

- `/dashboard/team` and the `/api/team` routes read an absent table.
- `lib/auth.ts` deliberately degrades: with no `profiles` row every signed-in user falls
  back to role `staff`, so `requireManager()` always fails and nobody can manage the team.
- The owner/manager-only delete policies from `0005` are absent; the broader
  `signups_staff_write` policy from `0004` is still what's live.

Applying it is a production schema change with a real access-control effect (it restricts
deletes and backfills every existing auth user as `owner`), so it was left alone. Apply it
deliberately when you want the team feature switched on.

`0008_email_optional.sql` **is** applied — `signups.email` is nullable, phone is the
required contact field.

### ⚠️ `0009_full_catalogue.sql` is data, and must be run for the ladder to sell

Until this runs, exactly one product is `active` — the RM25 first visit — so checkout can
only ever sell that, whichever tier the customer clicked. `0009` activates the rest of the
published ladder and corrects the two prices that had drifted from the site (the 5-visit
package was seeded RM180 against the RM160 on `/prices`).

It is **data only, no schema change**, and the `on conflict … do update` makes it safe to
re-run. Paste it into the Supabase SQL editor. The site degrades honestly without it: the
checkout simply shows whatever is active, so an un-run `0009` looks exactly like today.

**The catalogue is coupled to site copy in `config/catalogue.ts`.** Prices live in two
places — `config/business.ts` (what the site says) and the `products` table (what a
customer is charged) — and they have drifted once already. `config/catalogue.ts` maps site
slugs onto the deterministic product ids, and those slugs travel through the booking flow
as `?option=…` so a ladder CTA lands in checkout with the right tier preselected. Change a
price and change it in both, or the page and the till disagree.

Charging is always priced from the `products` row server-side; nothing the browser sends
sets a price. Packages are prepay-only, enforced in `app/api/purchases/route.ts`, not just
hidden in the form.

Note that the Supabase migration history table only lists two MCP-applied migrations; the
`0001`–`0008` files were applied by hand via the SQL editor, so that history is not a
reliable record of what's live. Check the actual schema instead.

## Open items — decisions the business still owes the site

Each of these is a one-field change once the answer exists; none needs new code.
Listed here because a chat thread is not a record.

| # | Open question | Where it lands | What the site does meanwhile |
|---|---|---|---|
| 1 | **Which non-coffee drinks are ALWAYS in stock?** Others are carried, but the selection varies by day, so none can be named as included. | `faqs`, the "I don't drink coffee" answer in `config/business.ts` | Says other drinks exist and to ask on the day. Truthful, but names none — so a guest can't arrive expecting one. Name a drink here only once it is permanently stocked. |
| 2 | **When does the launch offer end?** RM25 prepay / RM30 door is introductory, not the standing rate. | `launchOffer.endsLabel` in `config/business.ts` | Says "available for a limited period only" and the badge reads "Limited time only". Setting a date switches every mention to "until <date>" and the badge to "Until <date>". |
| 3 | **Guest testimonials** — none exist before the 11 September opening. | `testimonials` in `config/business.ts` | The section renders nothing at all. Never add invented quotes. |
| 4 | **Experience video** — no real footage filmed yet. | `experienceVideo.src` in `config/business.ts` | The section renders nothing at all. Never substitute stock footage. |
| 5 | **Team feature** — migration `0005_team_roles.sql` is unapplied (see above). | Supabase | `/dashboard/team` reads an absent table; every signed-in user degrades to `staff`. |

**Resolved (0013) — tea.** The catalogue descriptions, the FAQ and the Prices "What's
included" list all promised "coffee or tea". Tea is not stocked: the products table had a
Coffee row and no tea row, so the database was right and the copy was wrong. Every mention
is gone from all four places. Other drinks *are* carried, but the selection varies by day,
which is why the FAQ says so without naming one — see open item 1 above.

## Deploying

Deploy by git only — `git push` to `main` and Vercel builds it. Do not run `vercel deploy`
with local files; it desyncs git and the next push silently overwrites the live app.

Vercel verifies that each commit's author email belongs to a real GitHub account, so the
commit identity is pinned to `hewleeling-hub` by the session-start hook.
