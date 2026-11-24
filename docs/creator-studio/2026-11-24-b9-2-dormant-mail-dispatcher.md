# B9.2 — Dormant one-message confirmation dispatcher

**Status:** Code and SQL proposals only. No Cloudflare deployment, cron, provider, external email, database migration or release activation.

## Implementation

- `functions/_lib/creator-outbox-worker.ts` exposes `dispatchOneConfirmation`: exactly one job per invocation; disabled by default. All dependencies are injected by a trusted backend.
- It first claims a leased job, verifies the expected key ID, AES-GCM decrypts the payload, rebuilds the original B7 transactional confirmation message, and calls the trusted database freshness check immediately before provider dispatch.
- The provider transport is injected, never configured in the source, and must return `accepted`, `retryable`, `permanent`, or `ambiguous`. A thrown transport error is always **ambiguous**, because a message could have been accepted before the connection failed.
- The stable 64-character event ID is passed as a candidate provider idempotency key, but must only be used for actual idempotency if provider documentation confirms this behavior. The worker rejects a DB job marked idempotent if the configured transport cannot guarantee that capability.
- Acknowledgments use the original outbox ID and lease token. If an ACK is rejected, it reports `ack_unavailable`, not `sent`. For retry/ambiguous outcomes the worker reports only `recorded`: actual next state is computed by the database, not returned by a Boolean ACK.
- No secrets, raw tokens, decrypted messages or delivery provider details are logged.

## DB revalidation proposal

- Companion `2026-11-24-b9-2-dispatch-eligibility-SQL-PROPOSAL.sql` adds `creator_can_dispatch_confirmation_mail(uuid,uuid)`, restricted to `service_role`, checking current lease, expiry, pending token, active creator, published site and approved magnet using PostgreSQL time.
- It must be inserted into the same reviewed B8+B9.1 fresh-install transaction; do not execute this file alone.
- The B9.1 claim SQL is corrected to include `provider_idempotent` in the leased-job response. The adapter validates this field.
- **Remaining unavoidable race:** another transaction could revoke the creator or consume the token after the freshness check returns but before the email provider accepts the message. There is no DB lock held across network delivery. Re-check on receipt/confirmation and make tokens short-lived; do not claim perfect atomicity across PostgreSQL and a mail provider.

## Tests and scope

- B9.1 corrupted SQL (duplicate tail, incomplete constraint regexes) was corrected in parent PR #59. B9.1 source guard tests were strengthened to require exactly one table, three functions, and complete regex constraints. The previously reported 18/18 tests were executed on an **older revision**; regression tests are required after the repair.
- **14/14 SQL structural checks passed** via an isolated JavaScript test harness for the revised B9.1+B9.2 SQL. These checks do not establish SQL parse validity or runtime behavior.
- 14 new worker/database tests were authored, **not yet run with Node**. The B9.1 regression suite must also run.
- The SQL scripts are not independently applied, and there has been **no real email send**.

## Local offline verification

Run on the stacked branch in a disposable git worktree:

```powershell
node --experimental-strip-types --test tests/creator-mail-outbox.test.mjs tests/creator-outbox-db.test.mjs tests/creator-outbox-worker.test.mjs tests/creator-b9-1-outbox-sql.test.mjs tests/creator-b9-2-sql.test.mjs
```

Expected: 12 B9 encryption tests, 10 B9.1 DB tests, 14 B9.2 worker tests, 9 B9.1 SQL tests, 5 B9.2 SQL tests = **50** total. All Node tests must be reported from the actual test run, not inferred from the isolated JS structural review.

## Remaining before live service

1. Complete a recoverable manual backup through Supabase Multi (Free projects only).
2. Build a single reviewed migration from B8, B9.1 and B9.2; validate actual PostgreSQL SQL, grants, concurrent leasing, security, restore and rollback.
3. Select and verify a transactional mail provider/sender with confirmed free-tier cost and documented idempotency or conservative no-retry policy. Separate transport adapter and webhook/bounce handling remain unimplemented.
4. Enforce recipient/tenant consent, retention/deletion and ShopShield; maintain no-email-send by default.
5. Maintain public-release issue #28 closed until explicit authorization.