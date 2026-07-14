-- Sprint 6: team accounts + role-based access.
-- Adds a `profiles` table keyed to auth.users so each teammate carries a role,
-- and restricts destructive deletes to owner/manager.

-- ── profiles ────────────────────────────────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'staff' check (role in ('owner', 'manager', 'staff')),
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Any signed-in teammate can see the team roster.
drop policy if exists "profiles_staff_read" on profiles;
create policy "profiles_staff_read" on profiles
  for select to authenticated using (true);

-- No client-side write policy on profiles by design: if staff could update their
-- own row they could self-promote to owner. All role/profile writes go through
-- the server using the service-role key (which bypasses RLS). Clean up any old one.
drop policy if exists "profiles_self_update" on profiles;

-- ── auto-create a profile for every new auth user ───────────────────────────
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'role', 'staff')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Backfill: any existing auth users (the current staff login) become owners.
insert into public.profiles (id, email, role)
select id, email, 'owner' from auth.users
on conflict (id) do nothing;

-- ── role helper ─────────────────────────────────────────────────────────────
create or replace function current_user_role()
returns text
language sql
stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ── restrict deletes to owner/manager ───────────────────────────────────────
-- Replace the single permissive "for all" staff-write policy with granular
-- insert/update (any staff) + delete (owner/manager only) policies.

-- signups
drop policy if exists "signups_staff_write" on signups;
create policy "signups_staff_insert" on signups
  for insert to authenticated with check (true);
create policy "signups_staff_update" on signups
  for update to authenticated using (true) with check (true);
create policy "signups_manager_delete" on signups
  for delete to authenticated using (current_user_role() in ('owner', 'manager'));

-- purchases
drop policy if exists "purchases_staff_write" on purchases;
create policy "purchases_staff_insert" on purchases
  for insert to authenticated with check (true);
create policy "purchases_staff_update" on purchases
  for update to authenticated using (true) with check (true);
create policy "purchases_manager_delete" on purchases
  for delete to authenticated using (current_user_role() in ('owner', 'manager'));
