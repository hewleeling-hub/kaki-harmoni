-- Marketing consent: who has agreed to receive offers by WhatsApp, and when.
--
-- APPLIED to production on 2 November 2026, on request. Verified afterwards: the
-- three columns present, marketing_consent NOT NULL default false, and all 42
-- customers on file read as not agreed (none counted as consenting).
--
-- WHY. Promotional messages need the customer's agreement (Malaysia's PDPA
-- expects consent for direct marketing, and WhatsApp's own rules require an
-- opt-in). Phone numbers were collected to make a booking, so nothing in the
-- database says anyone agreed to anything else. This records it.
--
-- DEFAULT FALSE FOR EVERYONE ALREADY HERE. Nobody who signed up before this
-- existed has agreed to marketing, so no existing row is marked as consenting.
-- That is the point: the "message customers" list can only ever contain people
-- who actively said yes.
--
-- Purely additive: three new columns, no data changed, nothing dropped.
-- `marketing_consent_at` keeps the date of the first yes (it is only written
-- while consent is still false), and `marketing_consent_source` says how it was
-- given — 'web_form', 'walk_in_sale' or 'paper_form' — so a customer's consent
-- can be traced to the moment they gave it. A withdrawal sets consent back to
-- false and leaves the date and source as the record of what was once agreed.

alter table signups
  add column if not exists marketing_consent boolean not null default false,
  add column if not exists marketing_consent_at timestamptz,
  add column if not exists marketing_consent_source text;

comment on column signups.marketing_consent is
  'True only if the customer actively agreed to receive offers by WhatsApp. False for everyone who signed up before this column existed.';
