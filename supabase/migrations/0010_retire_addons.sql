-- Add-ons come off the website. An extra fifteen minutes or a second coffee is
-- a decision someone makes in the chair, not on a checkout screen before they
-- have arrived — the shop handles it in person.
--
-- Deactivated rather than deleted: `order_items` references products(id), so
-- past orders keep their line items intact, and the shop can switch either back
-- on from the dashboard if it ever wants them sold online.
--
-- Idempotent, data only, no schema change.

update products
   set active = false
 where id in (
   'c0000000-0000-0000-0000-000000000003',  -- Extra Coffee
   'c0000000-0000-0000-0000-000000000004'   -- Extra 15 Minutes
 );
