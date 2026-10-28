-- Vouchers: a prepaid soak, bought in one window and used in a longer one.
--
-- APPLIED to production on 28 October 2026, on request. Verified afterwards:
-- all fourteen columns present, four indexes, the status check in place and
-- RLS enabled with no policies.
--
-- WHY THIS TABLE EXISTS. app/api/purchases/route.ts already records why
-- packages are settled at the counter rather than sold online: "the app has no
-- visit-credit table and taking RM840 online would record one booking and
-- leave every later visit untracked." A voucher is exactly that — a credit
-- bought now and spent later — so selling one without somewhere to record it
-- repeats the same problem at RM11. This is that missing table, scoped to
-- vouchers.
--
-- It also makes the two promises on the 11.11 poster enforceable rather than
-- aspirational: "maximum 2 per person" needs something to count, and "redeem
-- by 31 December" needs an expiry that is checked rather than remembered.

create table if not exists vouchers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Who it belongs to. ON DELETE SET NULL, not CASCADE: a voucher is a record
  -- of money taken. Deleting a signup from the dashboard must not destroy the
  -- evidence that someone paid for a soak they have not yet had.
  signup_id uuid references signups(id) on delete set null,

  -- The identity the per-person cap is counted on, and the reason it holds.
  -- Signups dedupe on email, which is optional since 0008, so the same person
  -- can own several signup rows. `phone_normalised` is what the app already
  -- uses to recognise a returning guest and to enforce the once-per-person
  -- first visit (lib/customer.ts, 0011, 0015). Same identity here, so somebody
  -- cannot reach three vouchers by signing up twice.
  -- NOT NULL: a voucher with no phone could not be counted against the cap,
  -- which would make the cap optional in practice.
  phone_normalised text not null,

  -- Which offer sold it, e.g. 'eleven-eleven-2026'. Text rather than a foreign
  -- key because offers live in config/promotions.ts, where their dates are
  -- reviewable in one place; the cap is counted per offer, so a future
  -- promotion starts its own count rather than inheriting this one's.
  offer_id text not null,

  -- The catalogue line sold, so the price charged is traceable to the products
  -- table like every other line rather than to page copy.
  product_id uuid references products(id),
  price_myr numeric(10,2) not null,

  -- 'reserved'  — claimed on the site, not yet paid
  -- 'paid'      — money received, redeemable
  -- 'redeemed'  — soaked
  -- 'cancelled' — never paid, or voided; excluded from the cap
  status text not null default 'reserved',

  -- The last day it can be used. Stored per voucher rather than read from
  -- config at redemption time: a voucher sold under this year's terms keeps
  -- those terms even if a later offer changes them.
  expires_on date not null,

  paid_at     timestamptz,
  redeemed_at timestamptz,
  -- Who served it, as staff say their own name. Free text, like server_name on
  -- the intake form.
  redeemed_by text,

  -- The number written on the paper voucher, when there is one, so a physical
  -- slip can be matched to this row.
  voucher_no text,
  notes text
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'vouchers_status_check') then
    alter table vouchers add constraint vouchers_status_check
      check (status in ('reserved', 'paid', 'redeemed', 'cancelled'));
  end if;
end $$;

-- The cap is counted by phone within an offer, which is this index's job.
create index if not exists vouchers_phone_offer_idx on vouchers (phone_normalised, offer_id);
create index if not exists vouchers_signup_id_idx   on vouchers (signup_id);
create index if not exists vouchers_status_idx      on vouchers (status);
-- Expiry sweeps and the counter's "what is outstanding" list read this.
create index if not exists vouchers_expires_on_idx  on vouchers (expires_on);

-- RLS ON with NO policies, matching spa_survey_forms. Deliberate: the anon and
-- authenticated keys can read and write nothing here, and every access goes
-- through the service-role client on the server. A voucher is worth money, so
-- the browser is never handed a route that could mint, re-date or un-redeem
-- one — and the per-person cap is only a cap if the client cannot write round
-- it.
alter table vouchers enable row level security;
