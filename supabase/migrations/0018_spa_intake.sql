-- Spa intake: a signed paper form, scanned, with the essentials keyed in.
--
-- ⚠️ NOT APPLIED. Every other migration in this folder is already live on the
-- production database; this one is deliberately not. Apply it to a dev branch
-- or run it yourself against production when you are ready.
--
-- `spa_survey_forms` ALREADY EXISTS in production with most of these columns.
-- It was created directly against the database, holds no rows, and no code has
-- ever referenced it — so its shape lives nowhere in git. Everything here is
-- written to be safe either way: `create table if not exists` for a fresh
-- environment, `add column if not exists` for the table already sitting there.
--
-- The signature on paper is the consent record. These columns are not a
-- substitute for it: they exist so a returning guest's blend can be read at a
-- glance and so a health answer needing care shows on the dashboard without
-- anyone opening an image.

create table if not exists spa_survey_forms (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- From the paper form
  voucher_no        text,
  survey_date       date,
  guest_name        text,
  ic_passport_no    text,
  contact_no        text,
  sponsor_name      text,
  health_conditions text[] default '{}',
  health_goals      text[] default '{}',

  -- What was actually set up and used
  server_name       text,
  water_level       text,
  water_temp        text,
  intensity         text,
  duration_min      text,
  aroma_oils        text[] default '{}',
  recommended_oils  text[] default '{}',
  recommended_salt  text,
  salt_used         text,
  notes             text
);

-- Who this belongs to. ON DELETE SET NULL rather than CASCADE: an intake form
-- is the record of a treatment that happened and of consent that was given.
-- Deleting a signup from the dashboard must not quietly destroy it.
alter table spa_survey_forms
  add column if not exists signup_id uuid references signups(id) on delete set null;

-- The scan. A path within the private bucket, never a URL: the dashboard mints
-- a short-lived signed URL when someone actually opens it, so a link copied out
-- of the page stops working rather than becoming a permanent way in.
alter table spa_survey_forms
  add column if not exists scan_path text;

alter table spa_survey_forms
  add column if not exists scan_uploaded_at timestamptz;

-- 'draft'    — being filled in at the counter
-- 'complete' — signed form scanned and uploaded, essentials keyed in
alter table spa_survey_forms
  add column if not exists status text not null default 'draft';

alter table spa_survey_forms
  add column if not exists completed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'spa_survey_forms_status_check'
  ) then
    alter table spa_survey_forms
      add constraint spa_survey_forms_status_check
      check (status in ('draft', 'complete'));
  end if;
end $$;

create index if not exists spa_survey_forms_signup_id_idx  on spa_survey_forms (signup_id);
create index if not exists spa_survey_forms_status_idx     on spa_survey_forms (status);
create index if not exists spa_survey_forms_survey_date_idx on spa_survey_forms (survey_date desc);

-- RLS stays ON with NO policies, which is how the table already is in
-- production. Deliberate, not an oversight: the anon and authenticated keys can
-- read and write nothing here, and every access goes through the service-role
-- client on the server. This table holds health answers and an IC or passport
-- number — the most sensitive fields in the app — so the browser is never given
-- a route to it.
alter table spa_survey_forms enable row level security;
