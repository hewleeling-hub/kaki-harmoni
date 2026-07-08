create table if not exists signups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  referral_source text,
  status text not null default 'signed_up',
  lead_score numeric,
  lead_score_source text,
  lead_score_confidence numeric,
  lead_score_review_status text default 'unreviewed'
);

create unique index if not exists signups_email_unique_idx on signups (lower(email));

alter table signups enable row level security;
drop policy if exists "signups_v1_read" on signups;
create policy "signups_v1_read" on signups for select using (true);
drop policy if exists "signups_v1_write" on signups;
create policy "signups_v1_write" on signups for all using (true) with check (true);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  signup_id uuid not null references signups(id),
  product_name text not null,
  amount_myr numeric not null,
  payment_method text,
  status text not null default 'confirmed'
);

alter table purchases enable row level security;
drop policy if exists "purchases_v1_read" on purchases;
create policy "purchases_v1_read" on purchases for select using (true);
drop policy if exists "purchases_v1_write" on purchases;
create policy "purchases_v1_write" on purchases for all using (true) with check (true);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  entity_type text not null,
  entity_id uuid not null,
  action text not null,
  actor text,
  metadata jsonb
);

alter table activities enable row level security;
drop policy if exists "activities_v1_read" on activities;
create policy "activities_v1_read" on activities for select using (true);
drop policy if exists "activities_v1_write" on activities;
create policy "activities_v1_write" on activities for all using (true) with check (true);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  created_at timestamptz not null default now(),
  table_name text not null,
  row_id uuid not null,
  operation text not null,
  old_data jsonb,
  new_data jsonb,
  actor text
);

alter table audit_logs enable row level security;
drop policy if exists "audit_logs_v1_read" on audit_logs;
create policy "audit_logs_v1_read" on audit_logs for select using (true);
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_v1_write" on audit_logs for all using (true) with check (true);

insert into signups (id, name, email, phone, referral_source, status, lead_score, lead_score_source, lead_score_confidence, lead_score_review_status) values
  ('a1000000-0000-0000-0000-000000000001', 'Amirah Zulkifli', 'amirah@email.com', '0123456789', 'Instagram', 'converted', 82, 'rule_engine_v1', 0.85, 'unreviewed'),
  ('a1000000-0000-0000-0000-000000000002', 'Danial Hakim', 'danial@email.com', '0198765432', 'Friend Referral', 'signed_up', 61, 'rule_engine_v1', 0.70, 'unreviewed'),
  ('a1000000-0000-0000-0000-000000000003', 'Nurul Izzah', 'nurul@email.com', '0112233445', 'Facebook Ad', 'signed_up', 45, 'rule_engine_v1', 0.65, 'unreviewed'),
  ('a1000000-0000-0000-0000-000000000004', 'Razi Mahmud', 'razi@email.com', '0167654321', 'TikTok', 'converted', 77, 'rule_engine_v1', 0.80, 'unreviewed'),
  ('a1000000-0000-0000-0000-000000000005', 'Siti Rahimah', 'siti@email.com', '0134455667', 'Walk-in', 'signed_up', 55, 'rule_engine_v1', 0.68, 'unreviewed');

insert into purchases (id, signup_id, product_name, amount_myr, payment_method, status) values
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Kaki Harmoni Starter Pack', 199.00, 'online_transfer', 'confirmed'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004', 'Kaki Harmoni Starter Pack', 199.00, 'online_transfer', 'confirmed');

insert into activities (entity_type, entity_id, action, actor, metadata) values
  ('signup', 'a1000000-0000-0000-0000-000000000001', 'signup_created', 'public_form', '{"referral_source":"Instagram"}'),
  ('purchase', 'b1000000-0000-0000-0000-000000000001', 'purchase_confirmed', 'public_form', '{"amount_myr":199}'),
  ('signup', 'a1000000-0000-0000-0000-000000000002', 'signup_created', 'public_form', '{"referral_source":"Friend Referral"}'),
  ('signup', 'a1000000-0000-0000-0000-000000000004', 'signup_created', 'public_form', '{"referral_source":"TikTok"}'),
  ('purchase', 'b1000000-0000-0000-0000-000000000002', 'purchase_confirmed', 'public_form', '{"amount_myr":199}');