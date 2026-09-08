-- Backfill phone_normalised for rows written before 0011 added the column.
--
-- 0011 introduced phone as the customer's identity and started writing the key
-- on insert, but never filled it in for existing rows. Two of them were the
-- shop's first two paying customers.
--
-- Why it matters: hasBookedBefore() looks up other signups by
-- phone_normalised. A row with a null key can still be recognised via the
-- fallback to its own id — so the CURRENT booking is fine — but the moment
-- that person signs up again, the new row and the old one no longer match.
-- The new row has no purchases against it, so they read as brand new and are
-- offered the once-per-person RM25 first-visit price a second time.
--
-- The expression mirrors normalisePhoneForWhatsApp() in lib/whatsapp.ts:
-- digits only, prefixed to 60. Kept in step with that function — if it ever
-- changes, existing keys need rewriting to match or the two stop agreeing.

update signups
   set phone_normalised = case
     when regexp_replace(phone, '\D', '', 'g') like '60%'
       then regexp_replace(phone, '\D', '', 'g')
     when regexp_replace(phone, '\D', '', 'g') like '0%'
       then '60' || substr(regexp_replace(phone, '\D', '', 'g'), 2)
     else '60' || regexp_replace(phone, '\D', '', 'g')
   end
 where phone is not null
   and btrim(phone) <> ''
   and phone_normalised is null;
