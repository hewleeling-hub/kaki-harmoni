# Test Plan — Kaki Harmoni

## Success Scenario (manual walkthrough)
1. Open `/` in an incognito browser — landing page loads with product copy and signup form visible
2. Submit form with name="Test User", email="test@example.com", phone="0123456789", referral_source="Friend Referral"
3. **Expected:** Confirmation page shown; no redirect to login
4. Open `/dashboard` — new signup row appears with status `signed_up`; counters increment
5. Click the purchase link from confirmation page → `/purchase/[signupId]`
6. Submit purchase form (product pre-filled, payment_method="online_transfer")
7. **Expected:** Success message shown; signup status in dashboard changes to `converted`; Total Purchases counter increments; Conversion % updates
8. In dashboard, click edit on the new signup → change phone number → save
9. **Expected:** Updated phone visible immediately (no reload needed)
10. Delete the test signup → confirm dialog → row removed
11. **Expected:** Dashboard shows empty state if no other rows

## Empty State Cases
- Delete all signups → dashboard shows "No signups yet" message and zero counters
- Access `/purchase/invalid-uuid` → show "Signup not found" error page

## Error Cases
| Scenario | Expected Behaviour |
|---|---|
| Submit signup with duplicate email | Inline error: "This email is already registered" |
| Submit signup with missing name | Inline validation error on name field |
| Network failure on form submit | Error banner: "Something went wrong. Please try again." |
| `/purchase/[signupId]` already converted | Message: "You've already completed your purchase. Thank you!" |

## Loading States
- Signup form submit button shows spinner and is disabled during API call
- Dashboard table shows skeleton rows while fetching
- Purchase form shows spinner on submit

## Permissions (Sprint 3+)
- Unauthenticated GET to `/api/signups` returns 401 after lock-down sprint
- Public `POST /api/signups` returns 200 without auth cookie
