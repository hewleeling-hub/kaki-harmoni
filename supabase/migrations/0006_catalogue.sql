-- Sprint 7: product catalogue + multi-item orders.
-- `purchases` stays the order header (amount_myr = order total); a new
-- `order_items` table holds the line items, and `products` is the catalogue.

-- ── products (catalogue) ────────────────────────────────────────────────────
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_myr numeric not null check (price_myr >= 0),
  category text not null default 'service' check (category in ('service', 'addon', 'package')),
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table products enable row level security;

-- Staff read the full catalogue; public purchase page reads via the service role.
drop policy if exists "products_staff_read" on products;
create policy "products_staff_read" on products
  for select to authenticated using (true);
-- Writes go through the server (service role) guarded by requireManager.

-- ── order_items (line items) ────────────────────────────────────────────────
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  quantity int not null default 1 check (quantity >= 1),
  unit_price_myr numeric not null check (unit_price_myr >= 0),
  line_total_myr numeric not null check (line_total_myr >= 0),
  created_at timestamptz not null default now()
);

create index if not exists order_items_purchase_idx on order_items (purchase_id);

alter table order_items enable row level security;

drop policy if exists "order_items_staff_read" on order_items;
create policy "order_items_staff_read" on order_items
  for select to authenticated using (true);
-- Writes go through the server (service role).

-- ── seed catalogue ──────────────────────────────────────────────────────────
insert into products (id, name, description, price_myr, category, active, sort_order) values
  ('c0000000-0000-0000-0000-000000000001', 'First Visit — Foot Soak + Coffee', 'First-timers only: a warm foot soak paired with a fresh coffee.', 25.00, 'service', true, 1),
  ('c0000000-0000-0000-0000-000000000002', 'Foot Hydrotherapy Soak', 'A warm, bubbling foot hydrotherapy soak.', 40.00, 'service', true, 2),
  ('c0000000-0000-0000-0000-000000000003', 'Coffee', 'A freshly brewed cup.', 12.00, 'addon', true, 3),
  ('c0000000-0000-0000-0000-000000000004', 'Extra 15 Minutes', 'Add fifteen more minutes to your soak.', 15.00, 'addon', true, 4),
  ('c0000000-0000-0000-0000-000000000005', '5-Visit Package', 'Five foot hydrotherapy soaks at a friendly price.', 180.00, 'package', true, 5)
on conflict (id) do nothing;

-- ── backfill existing purchases as single-line orders ───────────────────────
insert into order_items (purchase_id, product_id, product_name, quantity, unit_price_myr, line_total_myr)
select p.id, null, coalesce(p.product_name, 'Purchase'), 1, p.amount_myr, p.amount_myr
from purchases p
where not exists (select 1 from order_items oi where oi.purchase_id = p.id);
