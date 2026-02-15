Supabase security checklist (recommended fixes + how-to)

1) Storage / Prescriptions bucket ✅
- What we changed in migrations: ensure `storage.buckets.public = false` and storage.objects policies limit access to `authenticated` users and to files stored under the user's UID folder.
- Manual verification: Supabase → Storage → Buckets → `prescriptions` → ensure "Public" is OFF.

2) Phlebotomists data (sensitive) ✅
- Problem: there was a public SELECT policy exposing sensitive fields (phone/verification id).
- Fix (migrations): dropped the public policy, created `phlebotomists_public` view with only safe columns and granted SELECT to `anon`, kept full table access for authenticated users only.
- Developer action: update any client code that expects full phlebotomist columns for unauthenticated use to query `phlebotomists_public` instead.

3) Addresses RLS accidentally disabled ✅
- Problem: a migration had `ALTER TABLE addresses DISABLE ROW LEVEL SECURITY`.
- Fix (migrations): re-enabled RLS and restored the row-level policies restricting addresses to the owning user.
- Manual check: Supabase SQL editor -> `
  SELECT relrowsecurity FROM pg_class WHERE relname = 'addresses';
` should return `true`.

4) Function search_path hardening ✅
- Problem: trigger functions should set `search_path` to avoid cross-schema attacks.
- Fix (migrations): added `SET search_path = public` to trigger functions.

5) Auth / project-level warnings (leaked passwords, MFA) ⚠️ — manual/console required
- These settings are project-level and cannot be fully enforced from app migrations.
- Recommended steps (Supabase dashboard):
  - Enable Leaked Password Protection (Auth → Settings → Policies / Security).
  - Enable/enforce MFA (Auth → Settings → Multi-factor authentication) — at minimum enable OTP.
  - Enforce strong password rules where available.
- Optional automation: add a pre-deploy/CI check using the Supabase Admin API (requires service role key) to assert these settings.

References / next steps
- Run DB migrations after pulling these changes.
- Verify the `phlebotomists_public` view is used by unauthenticated client code where appropriate.
- Add service-level checks in CI (optional) to assert Auth configuration.
