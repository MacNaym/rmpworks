# B10.2 — Dormant Resend ↔ durable outbox composition

## Evidence from B10.1

On 24 Nov 2026, the one authorized provider test returned **Resend ACCEPTED** and the operator confirmed actual delivery to **both** Gmail CC `luigi.pes84@gmail.com` and Hostinger inbox `noreply@rmpworks.com`. The provider/verified sender works. This is NOT yet proof of full live creator lead flow.

## This batch

`functions/_lib/creator-resend-outbox-dispatch.ts` composes existing B9.1 database RPC adapters, B9.2 one-job AES-GCM decryption/eligibility worker and B10 Resend HTTPS sender. It performs one attempt per invocation and never imports into production routes.

Workflow: atomic claim of exactly one pending outbox lease → AES-GCM decrypt with server secret → validate token expiry → database eligibility recheck → HTTPS Resend POST with persisted `eventId` Idempotency-Key → lease ACK with DB-owned retry state. No plaintext recipient/token in logs. No new dependency.

### Independent server gates

- `RMP_CREATOR_PUBLIC_RELEASE` must be the literal `true` (currently absent / gate #28 closed).
- `RMP_CONFIRMATION_DISPATCH_ENABLED` must be `true` (new, not configured).
- `RMP_RESEND_DOMAIN_VERIFIED` must be `true` (new, not configured; domain verified externally).
- `RESEND_API_KEY` exists as production secret_text in Cloudflare Pages project rmpworks, but this module does not read it on its own.
- `RMP_SUPABASE_URL`, `RMP_SUPABASE_SERVICE_KEY` (server-only service credential), `RMP_OUTBOX_KEY_ID`, `RMP_OUTBOX_KEY_B64URL` (32-byte AES key as unpadded 43-char base64url, server-only) are **not provisioned**. No fake defaults and no secrets committed.
- All settings must originate from a trusted server binding, never from request JSON, URL parameters, browser variables or cookies.

### Critical production gates

1. RMP Works backup creation confirmed; **verified restore still outstanding**. Do not migrate B8/B9 SQL until a real isolated PostgreSQL restoration/concurrency/RLS exercise and explicit migration authorization.
2. Review the stacked draft chain, carefully reconcile SQL in B8 + B9.1 + B9.2, then independently run isolated DB migration tests.
3. Before any live creator release, ensure an authenticated/internal scheduling trigger (no public dispatch route), secret provisioning, throttling, abuse protection, quotas, data retention and observability.
4. In B9.1, the value `provider_idempotent` is written at enqueue time. The new Resend sender's documented 24h idempotency window covers the current 15-minute token lifetime. Old SMTP jobs need careful policy reconciliation; never bulk-mark them idempotent.
5. Do not enable either release or dispatch flag from this batch. No production worker is currently wired.

## Offline tests

Nine new mock DB+Resend integration tests **authored, not run** as of this document. Run after pulling the worktree:

```powershell
node --experimental-strip-types --test tests/creator-resend-outbox-dispatch.test.mjs tests/creator-resend-http-transport.test.mjs tests/creator-outbox-worker.test.mjs
```

No emails, DB RPC, Cloudflare runtime calls, public releases or production state changes are performed by these mocked tests.