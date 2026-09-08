-- A permanent customer number: KH001, KH002, …
--
-- Staff need something short and stable to say out loud and write on a card.
-- The primary key is a UUID, and row order changes the moment anything is
-- deleted, so neither works.
--
-- Keyed to the PERSON, not the signup row. Signups dedupe on email only, so
-- somebody who signs up twice without an email — or with a different one —
-- creates a second row with the same phone. Numbering rows would hand that
-- person two numbers. `phone_normalised` is what the app already uses to
-- recognise a returning guest (see lib/customer.ts and the once-per-person
-- first-visit rule), so it is the identity used here too.
--
-- Numbers are never reused. A deleted customer's number stays retired, so a
-- number written on a card in June can't come back pointing at someone else.

create sequence if not exists signups_customer_no_seq;

alter table signups add column if not exists customer_no integer;

comment on column signups.customer_no is
  'Permanent per-person number, rendered as KH001 by customerRef(). Shared by every signup row with the same phone_normalised. Never reused.';

-- Backfill: one number per person, oldest first, so the earliest customer is
-- KH001. A row with no phone is its own person — it has nothing to match on.
with people as (
  select coalesce(phone_normalised, 'row:' || id::text) as person_key,
         min(created_at)                                as first_seen
  from signups
  group by 1
),
ordered as (
  select person_key,
         row_number() over (order by first_seen, person_key) as n
  from people
)
update signups s
   set customer_no = o.n
  from ordered o
 where o.person_key = coalesce(s.phone_normalised, 'row:' || s.id::text)
   and s.customer_no is null;

-- Continue from the highest number handed out rather than from 1.
select setval(
  'signups_customer_no_seq',
  coalesce((select max(customer_no) from signups), 0),
  true
);

alter table signups alter column customer_no set default nextval('signups_customer_no_seq');

create index if not exists signups_customer_no_idx on signups (customer_no);
