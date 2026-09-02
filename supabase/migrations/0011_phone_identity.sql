-- The first visit is a one-per-person price, so we need a reliable answer to
-- "have we met this person before?". Until now the only answer was the unique
-- index on lower(email) — but 0008 made email OPTIONAL, phone required. So
-- anyone who signed up with a phone and no email (or a different email) came
-- back as a brand-new signup and could claim the RM25 first visit again.
--
-- Phone is the field we always have. This stores a normalised form of it —
-- digits only, country-code prefixed, matching normalisePhoneForWhatsApp() in
-- lib/whatsapp.ts — so "012-345 6789", "0123456789" and "+60 12 345 6789" all
-- compare equal.
--
-- Deliberately NOT unique:
--   * existing rows may already share a number, and a unique index would fail;
--   * a couple sharing one mobile are two guests, and blocking the second from
--     signing up at all would be worse than the problem being solved.
-- Identity therefore stays per-signup. The phone is used only to decide
-- first-visit eligibility, which errs toward charging the standard RM40 rather
-- than merging two people's bookings together.
--
-- Idempotent and additive: no column is dropped, nothing is rewritten.

alter table signups add column if not exists phone_normalised text;

-- Backfill using the same rule the app applies on insert.
update signups
   set phone_normalised = case
         when regexp_replace(coalesce(phone, ''), '\D', '', 'g') = '' then null
         when regexp_replace(phone, '\D', '', 'g') like '60%'
           then regexp_replace(phone, '\D', '', 'g')
         when regexp_replace(phone, '\D', '', 'g') like '0%'
           then '60' || substring(regexp_replace(phone, '\D', '', 'g') from 2)
         else '60' || regexp_replace(phone, '\D', '', 'g')
       end
 where phone_normalised is null;

create index if not exists signups_phone_normalised_idx on signups (phone_normalised);
