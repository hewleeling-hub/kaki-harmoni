-- Launch scope: sell single visits only.
--
-- The multi-visit checkout wasn't finished in time for the 11 September
-- opening, so the four package rows come off sale. Kept ACTIVE:
--   First Soak   RM25  — the introductory first visit
--   Single Soak  RM40  — the standing rate, and what a returning guest buys
--
-- Single Soak deliberately stays on. With ONLY First Soak active, a returning
-- guest gets an empty option list (the first visit is filtered out for anyone
-- who has booked before), the form falls through to its legacy static card, and
-- POST /api/purchases lands on its fallback line — which is the RM25 first
-- visit with a null product_id, so the once-per-person guard doesn't catch it.
-- They would be charged the introductory price on every visit, forever. Leaving
-- the RM40 single on sale is what closes that.
--
-- Deactivated, not deleted: order_items references products(id), so past orders
-- keep their line items, and switching the ladder back on is an UPDATE.
--
-- ⚠️ Reverting this is HALF the job. config/catalogue.ts holds PACKAGES_ON_SALE,
-- which gates every package CTA on the site. Reactivate these rows AND flip that
-- flag, or the two halves disagree.
--
-- Idempotent, data only, no schema change.

update products
   set active = false
 where id in (
   'c0000000-0000-0000-0000-000000000006',  -- Double Reset    RM68
   'c0000000-0000-0000-0000-000000000005',  -- 5-Day Reset     RM160
   'c0000000-0000-0000-0000-000000000007',  -- 10-Day Reset    RM300
   'c0000000-0000-0000-0000-000000000008'   -- 30-Day Routine  RM840
 );

-- Belt and braces: make sure the two we are selling really are on.
update products
   set active = true
 where id in (
   'c0000000-0000-0000-0000-000000000001',  -- First Soak   RM25
   'c0000000-0000-0000-0000-000000000002'   -- Single Soak  RM40
 );
