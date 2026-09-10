-- Private storage for signed intake scans.
--
-- ⚠️ NOT APPLIED, and separate from 0018 on purpose: this one creates
-- infrastructure rather than altering a table, and creating a bucket on the
-- production project is the kind of change worth doing with your eyes on it.
--
-- PRIVATE (public = false). These are photographs of a signed form carrying
-- health answers and an IC or passport number. A public bucket in Supabase
-- means anyone holding the URL can fetch the object forever, with no login and
-- no expiry — so the dashboard mints a short-lived signed URL server-side each
-- time someone opens a scan, and a link copied out of the page stops working.
--
-- NO storage policies are created, which is what keeps it shut: with RLS on
-- storage.objects and nothing granting the anon or authenticated roles access,
-- only the service-role key can read or write. Every upload and every view
-- goes through a server route that has already checked requireStaff().

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'intake-scans',
  'intake-scans',
  false,
  12582912, -- 12 MB, matching INTAKE_SCAN_MAX_BYTES in config/intake.ts
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;
