#!/bin/bash
# SessionStart hook — makes a Claude Code on the web session immediately able to
# build, lint and run the Kaki Harmoni site. Safe to re-run.
set -euo pipefail

# Local machines already have their own setup; only bootstrap remote sessions.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# ── 1. Dependencies ─────────────────────────────────────────────────────────
# `npm install` (not `ci`) so the cached container layer is reused across sessions.
npm install --no-audit --no-fund

# ── 2. Environment ──────────────────────────────────────────────────────────
# The app reads Supabase config from .env.local, which is gitignored and so is
# absent in a fresh clone. Recreate it from the provisioned project.
# NEXT_PUBLIC_* values are public by design (they ship in the browser bundle).
# The service-role key is a real secret: it is never committed. Supply it via a
# SUPABASE_SERVICE_ROLE_KEY environment variable on the environment, or paste it
# in by hand — without it, RLS blocks the public signup/purchase/booking writes.
if [ ! -f .env.local ]; then
  cat > .env.local <<ENV
NEXT_PUBLIC_SUPABASE_URL=https://culjkdjmemhxxdxvrbyo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1bGprZGptZW1oeHhkeHZyYnlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMDE2NDEsImV4cCI6MjA5Nzg3NzY0MX0.av8DGU_b2FzAQmY47urYoTDHyoApuDm9mxSloxyl-2I
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-}
NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV
fi

# ── 3. Commit identity ──────────────────────────────────────────────────────
# Vercel rejects a deploy whose commit author is not a verified GitHub identity.
git config user.email "238494399+hewleeling-hub@users.noreply.github.com"
git config user.name "hewleeling-hub"

echo "kaki-harmoni ready: deps installed, .env.local present, git identity pinned."
