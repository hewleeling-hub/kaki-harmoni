-- 11.11 Foot Spa Voucher — RM11 a session.
--
-- NOT YET APPLIED to production. Apply it before the offer is rung up at the
-- counter, otherwise there is no catalogue line to sell and the RM11 exists
-- only in page copy — a price the server never checks.
--
-- A catalogue product like any other, so its price comes from the database on
-- checkout the way every other line does. See config/promotions.ts for the
-- sale window and the two conditions printed on the poster.
--
-- sort_order 0 puts it above the standing options while it is on sale.
--
-- active stays true after the sale window closes rather than being deleted:
-- purchases reference products, and removing the row would orphan the record
-- of what was actually sold. Vouchers are also redeemable until 31 December,
-- well after the last one is bought, so the line has to stay ringable at the
-- counter for seven weeks after the sale ends. The website stops advertising
-- it on its own — that is config/promotions.ts's job, not this row's.
insert into products (id, name, description, price_myr, category, active, sort_order)
values (
  'c0000000-0000-0000-0000-000000000010',
  '11.11 Foot Spa Voucher',
  'One 15-minute foot soak. Bought by 11 November 2026, redeemable until 31 December 2026. Maximum 2 per person.',
  11.00,
  'service',
  true,
  0
)
on conflict (id) do update
  set name        = excluded.name,
      description = excluded.description,
      price_myr   = excluded.price_myr,
      category    = excluded.category,
      active      = excluded.active,
      sort_order  = excluded.sort_order;
