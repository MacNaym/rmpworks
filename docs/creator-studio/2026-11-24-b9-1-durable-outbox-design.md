# B9.1 — Durable encrypted outbox, database leases and crash recovery

**Status:** SQL proposal and dormant server contracts only. No production SQL, route, email provider, cron or activation. Stacked on B9 PR #58, B8.1 #57 and B8 #56.

## Planned workflow
1. Trusted backend verifies platform release, creator identity/approval, privacy, rate limits, Turnstile and recipient input. The B9.1 adapter does not perform these checks independently.
2. Server generates a 32-byte random token, SHA-256 digest, and 64-character random hexadecimal event ID.
3. Confirmation link is sealed by AES-256-GCM with event ID as associated authenticated data; only ciphertext and digest reach SQL. Atomic RPC creator_create_lead_with_outbox inserts pending lead, digest/expiry and encrypted outbox row in one database transaction.
4. A future trusted, manually activated worker calls creator_claim_confirmation_mail. The DB uses FOR UPDATE SKIP LOCKED, a short lease and monotonically incremented attempt count, returning encrypted data and lease metadata to the privileged caller only.
5. Before provider dispatch the worker must decrypt, revalidate the payload and re-check recipient/creator/magnet eligibility. The worker and provider integration do not exist yet.
6. creator_ack_confirmation_mail requires the matching, still-live lease and computes bounded retries and expiry using database time. Sent/dead states erase encrypted content.
7. A crashed worker with potentially accepted mail goes to needs_review unless the provider contract explicitly guarantees stable idempotency and the job remains eligible.

## Non-negotiable gates
- The SQL companion is NOT a standalone migration: concatenate its statements inside the reviewed B8 transaction before COMMIT, then validate on PostgreSQL. Never execute it independently.
- The new functions explicitly restrict EXECUTE to service_role; anonymous/authenticated roles have no table grants or RLS policies. SECURITY DEFINER and actual grant semantics require real-DB verification.
- Old B8 two-step token issuing functions are revoked from service_role; no direct B6 writer should be wired into public intake. The older backend paths remain dormant.
- Do not mark providerSupportsIdempotency true unless the chosen provider explicitly supports a stable idempotency key.
- Confirmation worker, mail provider, key rotation, reconciliation, bounce handling, retention/deletion and ShopShield integration remain to be built.
- Supabase Multi backup is still being implemented. No production migrations until a real recoverable backup and restore plan are verified and the exact SQL is separately approved.
- Cloudflare public release gate #28 stays closed.

## Test state
Eight SQL structural tests passed in a JavaScript harness. Ten new Node tests have been authored but NOT yet run. Neither suite proves PostgreSQL execution, correctness of concurrent leases, or real mail delivery.

Run from a disposable worktree:
```powershell
node --experimental-strip-types --test tests/creator-outbox-db.test.mjs tests/creator-b9-1-outbox-sql.test.mjs
```