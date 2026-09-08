-- Name the coffee in the multi-visit package descriptions.
--
-- These strings are what a customer reads on the radio cards in checkout, at
-- the moment they choose what to pay for. First Soak and Single Soak already
-- said "freshly made coffee"; the four packages did not, so the ladder read as
-- though the coffee stopped once you bought more than one visit. It doesn't.
--
-- A guest fed back that they couldn't tell whether coffee was included at all.
-- The site said so in its prose and left it out of every surface where a price
-- is quoted, which is the one place it matters.
--
-- Double Reset already named the bun and coffee and is unchanged.

update products
set description = 'Five soaks — buy four, get one free. RM32 a visit, coffee included each time.'
where id = 'c0000000-0000-0000-0000-000000000005';

update products
set description = 'Ten soaks at RM30 a visit, coffee included each time — enough to make it a habit.'
where id = 'c0000000-0000-0000-0000-000000000007';

update products
set description = 'Thirty soaks at RM28 a visit, coffee included each time — our lowest per-visit price.'
where id = 'c0000000-0000-0000-0000-000000000008';
