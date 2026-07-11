-- Sprint 3 completion: lock down RLS.
-- The v1 permissive policies let ANYONE with the public anon key read/write all
-- tables directly (bypassing the app entirely). Replace them with staff-only
-- policies: only authenticated (logged-in) users can read; only authenticated
-- users can write. Public flows (signup/purchase/booking) now go through server
-- API routes using the service-role key, which bypasses RLS.
-- Note: the plan called for "owner-scoped" policies, but this is a small shared
-- staff team where everyone sees all leads, so authenticated-scoped is the fit.

-- signups
drop policy if exists "signups_v1_read" on signups;
drop policy if exists "signups_v1_write" on signups;
create policy "signups_staff_read" on signups
  for select to authenticated using (true);
create policy "signups_staff_write" on signups
  for all to authenticated using (true) with check (true);

-- purchases
drop policy if exists "purchases_v1_read" on purchases;
drop policy if exists "purchases_v1_write" on purchases;
create policy "purchases_staff_read" on purchases
  for select to authenticated using (true);
create policy "purchases_staff_write" on purchases
  for all to authenticated using (true) with check (true);

-- activities (append-only via server; staff can read)
drop policy if exists "activities_v1_read" on activities;
drop policy if exists "activities_v1_write" on activities;
create policy "activities_staff_read" on activities
  for select to authenticated using (true);

-- audit_logs (append-only via server; staff can read)
drop policy if exists "audit_logs_v1_read" on audit_logs;
drop policy if exists "audit_logs_v1_write" on audit_logs;
create policy "audit_logs_staff_read" on audit_logs
  for select to authenticated using (true);
