-- Multi-visit packages sold at the counter (5-Day Reset, 10-Day Reset, ...).
--
-- A package is ONE purchase for the whole price. Three nullable columns turn a
-- purchase into something with visits to use, without touching any other row:
--
--   package_visits      how many soaks it includes (set only on the package sale)
--   package_expires_on  last day to use them (6 months from the day it was paid)
--   package_id          set on a RM0 visit that was drawn from a package, pointing
--                       back at the package purchase
--
-- "Visits left" is then package_visits minus the visits pointing at it, so it can
-- never drift from the visits actually recorded. ON DELETE SET NULL: deleting a
-- package must not delete the soaks the guest really had.
--
-- Additive and nullable: no existing row changes meaning.
alter table purchases
  add column if not exists package_visits int check (package_visits > 0),
  add column if not exists package_expires_on date,
  add column if not exists package_id uuid references purchases(id) on delete set null;

create index if not exists purchases_package_id_idx on purchases (package_id) where package_id is not null;
