# B6 — Pending public lead inbox (review only)

## Live database verification
Read-only inspection performed against resolved Supabase Multi target `rmpworks` (ref `mxgwdnnpkywzhldyyrue`, account `okstyleshirts`). We **did not execute any DDL**. Verified:
- `creator_leads`: authenticated creator owners can insert only `source='preview_test'`. No anonymous insert policy.
- `creator_site_snapshots`: anon SELECT only for `published=true` and `published_at IS NOT NULL`.
- `creator_lead_magnets`: owner-only RLS; approval status `approved`.

## Proposed architecture
1. User submits form to **future** Cloudflare public endpoint, not implemented.
2. Server checks explicit release gate, verified URL/hostname, published creator, privacy/consent, approved magnet, Turnstile, honeypot, rate-limit, idempotency.
3. Only then a backend-only function `stagePublicCreatorLead` sends validated data to **new dedicated table** `creator_public_lead_inbox`.
4. Database trigger validates the creator has a published snapshot and owns an approved magnet **again, inside the insert transaction**, even if the privileged writer bypasses RLS.
5. The row remains `pending_verification`. Email ownership confirmation/delivery, deduplication, tenant-specific CRM promotion and DSAR/retention are future work. **202 Accepted MUST NOT imply a verified subscription or successful delivery.**

## Isolation and privileges
- Proposed SQL at `docs/creator-studio/2026-11-24-b6-public-inbox-proposal.sql`; **not applied**.
- RLS enabled and all privileges revoked from `anon` and `authenticated`; no public INSERT policy; no user-facing SELECT.
- Server backend credential required for a future route, scoped to trusted server environment, **not NEXT_PUBLIC_**, not sent to browsers, not put in repository.
- Warning: Supabase `service_role` is highly privileged and can bypass RLS. Trigger is defense-in-depth, not an alternative to server authorization. Before deploying a privileged writer, perform credential and ownership review, ideally least-privilege via a dedicated backend execution boundary.
- Unique constraint on (creator, magnet, normalized email) provides basic duplicate protection; do not expose whether a recipient is already present.
- The standalone helper is NOT imported into any route; no public endpoint can invoke it.
- Do not apply SQL to production without separate explicit review and migration; no live database changes approved.

## Open blockers
- PR #45 Turnstile and #46 D1 rate limit are still drafts requiring tests.
- PR #47 orchestration must be reviewed together with these modules and compiled in one test branch before wiring anything.
- Server side verifying sender's email and controlled promotion from inbox to CRM.
- Binding auth between Cloudflare and Supabase, idempotent replay handling, privacy/retention, expiry cleanup.
- Safe cross-tenant negative tests on staging, including attempts to pair creator A with magnet B, unpublished creators and unapproved magnets.
- ShopShield remains configured manually by Captain.
- Hard gate #28 remains closed.

## Local checks
```powershell
node --experimental-strip-types --test tests/public-lead-inbox.test.mjs
```
Five offline tests are **prepared, not yet executed on user's PC**.

## Deduplication hardening
The SQL names the composite uniqueness constraint `creator_public_lead_inbox_unique_lead`. PostgREST maps both PostgreSQL `23505` (unique violation) and `23503` (foreign-key violation) to HTTP 409. The writer returns `duplicate` only for a `23505` response mentioning that exact constraint; any other 409 fails closed as `unavailable`. A future public route must normalize duplicate responses to a generic acknowledgement to avoid subscriber enumeration, without disclosing database details. This check is mocked and still needs actual staging validation.
