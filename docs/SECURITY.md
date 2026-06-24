# Security — Kaki Harmoni

## Secret Handling
- `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` stored in Vercel environment variables only
- Frontend uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` only — no service key ever sent to browser
- No secrets in source code or `.env` committed to repo

## Permission Model
- **v1 (demo):** permissive RLS policies — all tables readable and writable by anyone (public demo)
- **Sprint 3 lock-down:** replace with `auth.uid() = user_id` policies; dashboard requires authenticated session; public signup + purchase forms remain open but bind `user_id = null` until claimed
- Agent actions inherit the calling user's Supabase session — no elevated service-role calls from frontend

## Approved-Tools Rule
- Only named tools listed in `AGENTIC_LAYER.md` may be invoked by any automated flow
- No `run_any`, `eval`, or raw SQL execution from agent context
- Every tool call writes a row to `audit_logs` before returning

## Audit Principle
Every meaningful state change (signup, purchase, status update, agent action) produces an `activities` row and an `audit_logs` row. Logs are append-only; no UPDATE or DELETE is permitted on `audit_logs`.
