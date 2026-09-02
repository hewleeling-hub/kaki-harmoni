-- Drinks: coffee only.
--
-- The catalogue descriptions promised "coffee or tea", and so did the FAQ and
-- the Prices "What's included" list. Tea is not stocked. A guest who chose us
-- because they don't drink coffee would have been turned away at the counter,
-- which is the worst possible moment to find out.
--
-- DEV_SETUP.md had already flagged the mismatch: the products table has a
-- Coffee row and no tea row, while two places in the copy promised both.
-- The database was right and the copy was wrong.
--
-- Fixed together with config/business.ts (the two FAQ answers) and
-- app/prices/page.tsx (What's included). If the café ever stocks tea, all four
-- change back together — and only then.
--
-- Idempotent, data only, no schema change.

update products
   set description = 'Your first visit: a warm 15-minute leg soak with a freshly made coffee. First-timers only.'
 where id = 'c0000000-0000-0000-0000-000000000001';

update products
   set description = 'A warm 15-minute leg soak, freshly made coffee included. Any time of day.'
 where id = 'c0000000-0000-0000-0000-000000000002';

-- Double Reset already said "a bun & coffee on us" — restated so the whole
-- catalogue reads from one migration if it is ever replayed.
update products
   set description = 'Two soaks back to back, or one either side of a break — with a bun & coffee on us.'
 where id = 'c0000000-0000-0000-0000-000000000006';
