# B8 — Atomic lead intake + email challenge, no public route

## Purpose
The previous staged B6 writer returned only `accepted` or `duplicate`, without a row ID. A subsequent issue-token operation therefore could not safely identify the new pending inbox row. This stacked PR **replaces that two-step handoff for future requests** with one privileged PostgreSQL RPC that inserts the lead and attaches the digest in the same transaction.

## What is prepared
- `creator_create_pending_lead_with_token(...)` is appended to the consolidated **unapplied** SQL proposal from B8 PR #56. It accepts server-validated creator, approved magnet, recipient, consent/privacy info and a SHA-256 token digest. A BEFORE INSERT trigger performs the authoritative active-creator/published-site/approved-resource checks. If the composite uniqueness constraint already contains the email, it returns `false` and issues no challenge.
- After INSERT, it assigns `verification_token_digest` and `verification_expires_at=now()+15m`. Both writes are inside one RPC database transaction; an unexpected failure rolls back the INSERT. The function returns only boolean, **never lead ID or user information**.
- Only `service_role` can execute it; PUBLIC, anon and authenticated EXECUTE is revoked in the same schema transaction. Backend must validate origin, release gate, privacy, Turnstile and D1 before invoking; SQL has no knowledge of the HTTP request.
- `functions/_lib/creator-atomic-lead-challenge.ts` is a dormant server-only RPC adapter with a default-deny `authorizedByServer` flag. No route imports it.
- Six offline unit tests exercise the adapter (not executed on a local checkout). Five extra SQL static checks plus eight earlier structural checks were **executed through a JS harness: 13/13 PASS**. They do **not** establish real PostgreSQL parsing or actual runtime behavior.

## Explicit risk / design notes
- This is intended to avoid passing any DB row ID through a browser. The raw verification token stays only in the server and confirmation email; the database sees its SHA-256 digest.
- Never send the email when the RPC returns false/throws. Return a generic public response that does not reveal whether an email already exists.
- If an email provider fails *after* the atomic RPC succeeded, a pending lead has already been stored. Before enabling actual sending, design a durable/outbox-based retry or explicit safe reissue, plus provider idempotency and bounce handling.
- Do not call the RPC from a public GET; only the trusted server handler after release/antiabuse checks.
- Supabase Multi backup implementation is still being developed. A completed, verified backup and independent SQL review are required before any production migration. Free plan and one-database strategy remain in place. **No SQL was applied**.
- PR #56's initial SQL assembly had an interpolation error: both #56 and this stacked branch were repaired using the clean original draft, and an exact one-COMMIT / four-complete-functions test was added to this branch. Never apply an older revision of either PR's SQL.

## Local tests in a checked-out branch
```powershell
node --experimental-strip-types --test tests/creator-token-issuer.test.mjs tests/creator-b8-db-proposal.test.mjs tests/creator-b8-atomic-handoff-sql.test.mjs tests/creator-atomic-lead-challenge.test.mjs
```
Expected **5+8+5+6 = 24** cases, not yet executed via Node on the user's PC. Static SQL assertions: **13 PASS** separately in the JS review harness.

## Next gates
Backup verified -> PostgreSQL schema migration review -> controlled real SQL tests -> trusted release-gated route + transactional email outbox -> privacy/ShopShield + explicit user release approval (#28). Until then public intake remains closed.
