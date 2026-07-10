-- Adds slot-based booking to purchases, capacity-limited per slot (see lib/slots.ts)
alter table purchases add column if not exists booking_date date;
alter table purchases add column if not exists booking_time text; -- e.g. '14:00', 24h format

create index if not exists purchases_booking_slot_idx on purchases (booking_date, booking_time);
