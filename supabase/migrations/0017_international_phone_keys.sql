-- Recompute phone_normalised now that a leading "+" is respected.
--
-- normalisePhoneForWhatsApp() assumed every number was Malaysian: anything not
-- already starting 60, and not starting 0, had 60 glued to the front. So a
-- Singapore number written +65 8420 0800 was stored as 606584200800 and a UK
-- +44 as 6044… — nonsense to WhatsApp, and a shape no real number has. Kaki
-- Harmoni has customers on both.
--
-- Identity matching still worked, because the same wrong answer came out every
-- time, but any WhatsApp link built from those keys went nowhere.
--
-- The function now returns the digits as written when the number starts with
-- "+". That changes the key for every international number, so every stored
-- key is recomputed here — leave them and the two would disagree, and a
-- returning guest with a foreign number would read as somebody new.
--
-- Keep this expression in step with lib/whatsapp.ts. They encode the same rule
-- in two languages, which is a seam: if that function changes, this runs again.

update signups
   set phone_normalised = case
     when btrim(phone) like '+%'
       then regexp_replace(phone, '\D', '', 'g')
     when regexp_replace(phone, '\D', '', 'g') like '60%'
       then regexp_replace(phone, '\D', '', 'g')
     when regexp_replace(phone, '\D', '', 'g') like '0%'
       then '60' || substr(regexp_replace(phone, '\D', '', 'g'), 2)
     else '60' || regexp_replace(phone, '\D', '', 'g')
   end
 where phone is not null
   and btrim(phone) <> '';
