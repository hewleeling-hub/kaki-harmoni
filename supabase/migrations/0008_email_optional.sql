-- Make signups.email optional. Phone stays the required contact field.
-- The existing unique index on lower(email) still guards real emails;
-- Postgres treats multiple NULLs as distinct, so blank-email signups don't collide.
alter table signups alter column email drop not null;
