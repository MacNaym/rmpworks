# B9 — Transactional confirmation email outbox (dormant)

**Scope:** design and isolated module for reliable delivery. Neither production email nor a public route is enabled. No SQL executed.

## Problem B8 cannot yet solve
The B8 atomic RPC saves a pending lead + SHA-256 digest. A mail send after that commit can fail: the lead then exists with an unusable challenge. The recovery process must preserve the ORIGINAL raw token in a form the DB cannot casually reveal, without writing it in plaintext. Re-generating/reissuing a different token during retry would invalidate an earlier delivered message and risks sending inconsistent links.

## Design
- Before calling the eventual trusted, release-gated backend intake, generate a cryptographically random raw 32-byte verification token and SHA-256 digest (B7).
- Form a confirmation message containing the raw token; encrypt `{recipient,creatorName,confirmationUrl}` using **AES-256-GCM** with a dedicated, versioned server-only key in a Cloudflare secret. Generate a unique 96-bit nonce per envelope; bind associated data to a stable unpredictable 64-character event ID. Store `version, keyId, iv, ciphertext` — never plaintext addresses, links, tokens or provider errors in the outbox.
- The recipient, consent details and digest are already in the protected B8 inbox. A dedicated outbox table should reference the lead ID, carry a unique logical delivery event, ciphertext, key version, next_attempt_at, expiry, status and row lease/attempt count. No anon or authenticated grants/policies; only the backend may read or mutate.
- **Critical transactional invariant:** the B8 DB function must insert the lead, digest and encrypted outbox event in ONE database transaction. A separate `INSERT` into outbox after B8 RPC returns is NOT enough: if it fails, the user is stranded. The current B8 function does NOT include this and must be revised, regression tested and independently reviewed before any release. Design of its response must not leak lead IDs or email existence.
- A worker runs only when an explicit, authenticated server invocation occurs (no polling infrastructure or scheduler necessary initially). In a future phase, a Cloudflare Cron Trigger could schedule this, but it must be approved and stay within free-tier limits. It atomically leases jobs with a short DB timeout; only a holder of the matching lease token may acknowledge. Never hold a DB transaction open during network calls. Race conditions, stale lease expiration and crashed workers must be tested with actual PostgreSQL before launch.
- `decideMailRetry` uses up to **4 total attempts** with 30s, 2m and 5m delays, but never after challenge expiry at the database; the sending worker must re-check token state and expiry **at claim time and again immediately before send**, using the DB clock to avoid stale links. `accepted` marks sent, permanent failures mark dead. Ambiguous failures mark `needs_review` unless the provider guarantees idempotency under a stable key.
- Provider acceptance is **not proof of email delivery**. Bounces, complaints, and invalid recipients require eventual webhook/reconciliation support. Avoid logging PII and never retry a revoked, verified, expired, deleted or suspended-creator challenge.
- For confirmed leads, erase/purge encrypted token payload promptly. Set strict retention bounds for pending/dead records and privacy deletion; to be aligned with ShopShield.
- All worker dispatch is disabled by default; there is no provider credential, HTTP route, DB migration or cron deployment in this PR.

## Implemented in B9
`functions/_lib/creator-mail-outbox.ts` exports `sealOutboxMail`, `openOutboxMail`, `validateOutboxPayload`, and `decideMailRetry`. The module does **not** send, fetch, read storage, or schedule any work; keys are injected by a trusted backend, never stored in the module. `tests/creator-mail-outbox.test.mjs` contains 12 focused offline tests.

## Execution gates
1. Supabase Multi manual backup feature must produce an actual, verified recoverable backup; no production schema changes before that.
2. A PostgreSQL-reviewed migration for encrypted outbox + atomic B8 enqueue and row leasing, including service_role-only rights and idempotency guarantees.
3. Runtime email provider choice, domain verification, costs, provider idempotency capability and webhook contract.
4. Real DB consistency/race/permissions tests and encrypted payload key rotation/destruction test.
5. Ensure the public release flag remains absent and obtain explicit authorization before deployment.

## Local test command
```powershell
node --experimental-strip-types --test tests/creator-mail-outbox.test.mjs
```
