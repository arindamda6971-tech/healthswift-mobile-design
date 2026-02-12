Recent security and quality fixes (Feb 12, 2026)

- Prescription analysis edge function now requires authentication. The function verifies incoming `Authorization: Bearer <token>` via Supabase `/auth/v1/user` using `SUPABASE_SERVICE_ROLE_KEY`. See `supabase/functions/analyze-prescription/index.ts`.
- Order creation now requires payment verification before inserting an order. The client will no longer insert orders with `payment_status: "completed"` unconditionally. See `src/pages/TrackingScreen.tsx`.
- Reports screen now fetches real user reports via Supabase, respecting RLS, and joins `tests` for display. See `src/pages/ReportsScreen.tsx`.
- Added migration to create `phlebotomists_public` view exposing only non-sensitive fields; applications should query that view instead of the base table. See `supabase/migrations/20260212000000_create_phlebotomists_public_view.sql`.
- Added non-intrusive MFA guidance banner in `ProfileScreen`. Enabling MFA requires project-level changes in Supabase.

Notes:
- You must set `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` as environment variables for the analyze-prescription function to validate tokens.
- MFA enabling is a Supabase project configuration; the app only provides user guidance.
