-- Sprint 9: make the whole published ladder buyable.
--
-- Until now exactly one product was `active` — the RM25 first visit — so the
-- checkout could only ever sell that. Meanwhile /prices advertised a Standard
-- single, the Double Reset and three package tiers, none of which a customer
-- could actually pay for; every ladder CTA dropped them into the same RM25
-- basket. This activates the rest and corrects the prices that had drifted.
--
-- PRICING PROVENANCE — every number below already appears on the live site and
-- comes from `config/business.ts`. Nothing here is invented:
--   Standard single   RM40   sessionRates[0].price
--   Double Reset      RM68   doubleSoak.price
--   5-Day Reset       RM160  ladderPrices.fiveVisit   (was seeded RM180 — wrong)
--   10-Day Reset      RM300  ladderPrices.tenVisit
--   30-Day Routine    RM840  ladderPrices.thirtyVisit
--   Extra 15 minutes  RM15 / Extra coffee RM12 — as seeded in 0006.
--
-- The ids are the deterministic c0000000-…-00N series from 0006, because
-- `config/catalogue.ts` maps site slugs onto them so a ladder CTA can preselect
-- the right option. Keep the two files in step.
--
-- Idempotent: safe to re-run. Data only — no schema change.

insert into products (id, name, description, price_myr, category, active, sort_order) values
  ('c0000000-0000-0000-0000-000000000001', 'First Soak',      'Your first visit: a warm 15-minute leg soak with a coffee or tea. First-timers only.',        25.00,  'service', true, 1),
  ('c0000000-0000-0000-0000-000000000002', 'Single Soak',     'A warm 15-minute leg soak, coffee or tea included. Any time of day.',                        40.00,  'service', true, 2),
  ('c0000000-0000-0000-0000-000000000006', 'Double Reset',    'Two soaks back to back, or one either side of a break — with a bun & coffee on us.',         68.00,  'package', true, 3),
  ('c0000000-0000-0000-0000-000000000005', '5-Day Reset',     'Five soaks — buy four, get one free. RM32 a visit.',                                         160.00, 'package', true, 4),
  ('c0000000-0000-0000-0000-000000000007', '10-Day Reset',    'Ten soaks at RM30 a visit — enough to make it a habit.',                                     300.00, 'package', true, 5),
  ('c0000000-0000-0000-0000-000000000008', '30-Day Routine',  'Thirty soaks at RM28 a visit, our lowest per-visit price.',                                  840.00, 'package', true, 6),
  ('c0000000-0000-0000-0000-000000000004', 'Extra 15 Minutes','Add fifteen more minutes to your soak.',                                                     15.00,  'addon',   true, 7),
  ('c0000000-0000-0000-0000-000000000003', 'Extra Coffee',    'A second cup, or one for whoever comes with you. Your own drink is already included.',       12.00,  'addon',   true, 8)
on conflict (id) do update set
  name        = excluded.name,
  description = excluded.description,
  price_myr   = excluded.price_myr,
  category    = excluded.category,
  active      = excluded.active,
  sort_order  = excluded.sort_order;
