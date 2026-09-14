-- Malaysia Day Harmoni — RM33 on 16 September 2026 only.
--
-- APPLIED to production on 14 September 2026, on request: the offer had to be
-- bookable online, which means a real catalogue row. One INSERT, nothing else
-- touched.
--
-- It is a catalogue product like any other so that its price comes from the
-- database on checkout, the way every other line does. A price written into
-- page copy is a price the server never checks.
--
-- sort_order 0 puts it above the standing options. It is only ever shown on its
-- own day (see config/promotions.ts), so it does not crowd the normal menu.
--
-- Kept active after the day passes rather than deleted: purchases reference
-- products, and deleting the row would orphan the record of what was actually
-- sold. It becomes unreachable because no other date offers it.
insert into products (id, name, description, price_myr, category, active, sort_order)
values (
  'c0000000-0000-0000-0000-000000000009',
  'Malaysia Day Harmoni',
  'Foot relaxation soak, any drink, and a slice of cake — 16 September only.',
  33.00,
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
