-- First visit moves to RM30, one price however you pay.
--
-- The old two-tier offer was RM25 prepaid / RM30 at the door, with the gap
-- added at checkout as a surcharge. That surcharge is gone from the code, so
-- the catalogue row has to carry the real price: without this, the site would
-- advertise RM30 and the checkout would still charge RM25.
--
-- Historical rows are left alone on purpose — purchases already taken at RM25
-- were charged RM25, and rewriting them would falsify the takings.

update products
   set price_myr = 30.00,
       description = 'Your first visit: a warm 15-minute leg soak with a coffee or tea. First-timers only. Same price online or at the door.'
 where id = 'c0000000-0000-0000-0000-000000000001';
