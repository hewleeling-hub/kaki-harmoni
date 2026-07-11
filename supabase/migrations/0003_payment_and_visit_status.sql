-- purchases.status now carries payment state: 'pending_payment' (transfer/e-wallet awaiting
-- staff confirmation) or 'confirmed' (cash paid at venue, or transfer/e-wallet verified by staff).
comment on column purchases.status is 'pending_payment | confirmed';

-- New: tracks whether the booked visit actually happened, so staff can flag no-shows.
alter table purchases add column if not exists visit_status text not null default 'upcoming';
comment on column purchases.visit_status is 'upcoming | attended | no_show';
