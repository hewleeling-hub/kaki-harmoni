-- Sprint 8: retention + repeat-purchase tracking.
-- A read-only view that rolls each customer's purchases up into visit counts,
-- spend, recency, and a retention status.

create or replace view customer_stats as
select
  s.id as signup_id,
  s.name,
  s.email,
  s.phone,
  s.referral_source,
  s.lead_score,
  count(p.id) as visit_count,
  coalesce(sum(p.amount_myr), 0) as total_spend_myr,
  min(p.created_at) as first_purchase_at,
  max(p.created_at) as last_purchase_at,
  case
    when count(p.id) = 0 then null
    else extract(day from (now() - max(p.created_at)))::int
  end as days_since_last_visit,
  case
    when count(p.id) = 0 then 'prospect'
    when (now() - max(p.created_at)) > interval '45 days' then 'lapsed'
    when count(p.id) >= 2 then 'returning'
    else 'new'
  end as retention_status
from signups s
left join purchases p on p.signup_id = s.id
group by s.id;

-- Respect the caller's RLS (staff-only reads of signups/purchases) rather than
-- the view owner's, and let signed-in staff select from it.
alter view customer_stats set (security_invoker = on);
grant select on customer_stats to authenticated;

-- ── seed a returning + a lapsed customer so the screen is alive on first load ─
insert into signups (id, name, email, phone, referral_source, status, lead_score, lead_score_source, lead_score_confidence, lead_score_review_status)
values ('a1000000-0000-0000-0000-000000000006', 'Mei Ling Tan', 'meiling@email.com', '0161234567', 'Friend', 'converted', 68, 'rule_engine_v1', 0.72, 'approved')
on conflict (id) do nothing;

-- Amirah comes back for a second, recent visit -> 'returning'
insert into purchases (id, signup_id, product_name, amount_myr, payment_method, status, visit_status, booking_date, created_at)
values ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'Foot Hydrotherapy Soak', 40.00, 'cash', 'confirmed', 'attended', current_date, now())
on conflict (id) do nothing;

-- Mei Ling visited 70 days ago and hasn't been back -> 'lapsed'
insert into purchases (id, signup_id, product_name, amount_myr, payment_method, status, visit_status, booking_date, created_at)
values ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006', 'First Visit — Foot Soak + Coffee', 25.00, 'cash', 'confirmed', 'attended', current_date - 70, now() - interval '70 days')
on conflict (id) do nothing;

insert into order_items (id, purchase_id, product_id, product_name, quantity, unit_price_myr, line_total_myr) values
  ('d0000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000002', 'Foot Hydrotherapy Soak', 1, 40.00, 40.00),
  ('d0000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'First Visit — Foot Soak + Coffee', 1, 25.00, 25.00)
on conflict (id) do nothing;
