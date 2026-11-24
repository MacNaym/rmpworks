# B10 — Dormant Resend HTTPS adapter for creator confirmation mail

## Decision

The real Cloudflare SMTP probe to Hostinger failed on 465 and returned `blocked` for a plain TCP socket on 587. No further direct SMTP investment for now. Prefer a **transactional HTTPS API** on Cloudflare Workers/Pages using an existing verified RMP Works sender domain and no recurring-cost plan.

Resend Free currently lists **3,000 transactional emails/month**, **100/day**, and **3 verified domains**. Reference: https://resend.com/pricing/ . Verify provider terms and account-specific quotas before activation; do not enable paid overages/pay-as-you-go inadvertently.

Resend supports HTTP POST `https://api.resend.com/emails` and `Idempotency-Key`, with provider-side key retention **24 hours**: https://resend.com/changelog/idempotency-keys . The existing B9.1 confirmation outbox expires in 15 minutes, so its permitted retries fit within this retention window, provided event ID and payload are identical for each retry. HTTP requests use provider-side idempotency, unlike Hostinger SMTP.

Cloudflare documents integration directly from Workers over HTTPS: https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/ . B10 uses native `fetch` without SDK dependency.

## Code and boundaries

- `functions/_lib/creator-resend-http-transport.ts` returns a `WorkerTransport` consumed by existing B9.2 one-job dispatch flow; `supportsIdempotency=true` reflects Resend's documented 24-hour guarantee **only for the 15-minute verification event lifecycle**.
- Transport is **dormant**. Nothing imports it into any API route, cron or deployment. No real Resend account, API key, domain verification or DNS changes were created.
- Sender is pinned to `RMP Works <noreply@rmpworks.com>`. Hostinger remains the inbox provider; Resend would be the outbound transactional transport, only after the domain is verified.
- Explicit `enabled:true`, server-side API key and server-owned `domainVerified:true` guard all outbound HTTPS calls. The user's browser must never control these switches. Never put the API key in GitHub, logs, request bodies, `.env` checked into git, or browser-exposed variables.
- Fixed endpoint `https://api.resend.com/emails`, HTTPS POST, JSON body and `Idempotency-Key: creator-confirmation/<eventId>`. The event ID must be 64 lowercase hex characters.
- 2xx status only reports `accepted` with a valid provider email ID; missing/malformed IDs are `ambiguous`. Resend API acknowledgement is **not a guarantee of inbox delivery**.
- 408/425/429/5xx are `retryable` **only because Resend has provider idempotency** within the outbox TTL. Known 4xx validation/auth/permission errors are `permanent`, idempotent 409 concurrency conflicts retryable, conflicting-payload 409 terminal, unknown results ambiguous.
- Network failure or timeout yields `ambiguous`; database retry behavior remains protected by `provider_idempotent`, stable event ID/payload, attempts limit, 15-minute token expiration and current eligibility revalidation.

## Activation prerequisites

1. Operator explicitly approves creation or reuse of a Resend account on the **Free** plan. Confirm actual domain quota; existing projects (e.g. other RMP-related services) might already share a Resend account.
2. In Resend, add `rmpworks.com` and obtain the exact DNS records for **that account**. Verify Cloudflare existing DNS before making an additive change; do not replace Hostinger mailbox MX records or its SPF records blindly. Maintain inbound Hostinger.
3. Confirm domain status `verified` in Resend. Configure a scoped `RESEND_API_KEY` through Cloudflare server-only secrets. Never share the key in ChatGPT.
4. Confirm all B8–B9 database proposals parse and pass PostgreSQL concurrency/RLS tests in an isolated database; RMP backup creation completed but **restore still to be verified** before production migrations.
5. Explicitly agree to a single test email to a controlled address; authorize only then. Review bounce handling, provider quotas, logs, and privacy retention before public go-live.
6. Keep creator release issue #28 closed until onboarding, checkout, legal compliance and delivery workflow are independently validated.

## Test

13 isolated Node tests prepared, **not yet run**. They use a mocked fetcher and cannot send real emails:

```powershell
node --experimental-strip-types --test tests/creator-resend-http-transport.test.mjs
```

**No pricing commitment, DNS change, production deployment, real email or database write occurs in this draft.**