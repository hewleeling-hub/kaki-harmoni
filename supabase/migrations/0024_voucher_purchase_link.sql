-- A voucher can be attached to the booking that uses it.
--
-- APPLIED to production on 29 October 2026, on request.
--
-- WHY. Vouchers are bought in the band without a slot — "buy by 11 November,
-- redeem by 31 December" is the offer, so the date is chosen later. When the
-- customer comes back to book, checkout has to recognise that they already
-- own a soak rather than selling them another one: without that it either
-- charges RM11 twice or writes a second voucher row and counts one person as
-- two against their own two-per-person limit.
--
-- This column is what makes a voucher single-use for booking. A row with
-- purchase_id set has had its slot taken and will not be offered again; a row
-- with it null is paid for and still waiting to be used.
--
-- ON DELETE SET NULL, not CASCADE: deleting a booking must free the voucher
-- rather than destroy the record that somebody paid for it.
--
-- Deliberately NOT reusing redeemed_at. Redemption is what happens at the
-- counter and is tracked in StoreHub; this is only "a slot has been booked
-- against it". Collapsing the two would make a booked-but-not-yet-soaked
-- voucher indistinguishable from one already used.
alter table vouchers
  add column if not exists purchase_id uuid references purchases(id) on delete set null;

-- The lookup is "has this phone got a voucher with no booking yet", so the
-- index carries the null case.
create index if not exists vouchers_unused_idx
  on vouchers (phone_normalised, offer_id)
  where purchase_id is null;
