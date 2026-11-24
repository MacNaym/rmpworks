# B9.7 — Isolated Cloudflare SMTP diagnostic deployment candidate

**NOT deployed. This is a deliberately separate diagnostic Worker, not a Pages Function or public RMP Works route.** The existing creator public-release gate remains closed.

## What it does
- Standalone `diagnostics/smtp-probe-worker.ts` imports `connect` from `cloudflare:sockets` and injects it into a private, offline-testable handler.
- `diagnostics/_lib/smtp-probe-handler.ts` refuses all requests when `RMP_SMTP_PROBE_ENABLED` is not precisely `true`. It accepts only POST with a 64-character lowercase hex secret supplied in header `x-rmp-probe-key`, checked against server-only `RMP_SMTP_PROBE_KEY` after SHA-256 digests are compared with a fixed iteration count.
- Even when enabled, the connection is pinned to Hostinger SMTP port 465 with implicit TLS. The diagnostic only reads the greeting and issues EHLO and optional QUIT. It **cannot** send SMTP AUTH, MAIL FROM, RCPT TO, DATA, passwords, confirmation tokens or emails.
- Response contains only phase/boolean diagnostics, not raw SMTP banner. Results are marked `no-store`. A single handler invocation creates no more than one socket; test an isolated Worker manually only.

## Deployment hard gates
1. Local test suite must pass before any runtime deployment.
2. A separately authorized, isolated diagnostic Worker must be created; do not add this entrypoint to Cloudflare Pages routes, production web assets, or a public cron. Do not alter the main `rmpworks` Pages project.
3. Set the enable switch and random 64-hex key as **server-only Cloudflare secrets**, not plain variables visible to public clients or GitHub. Restrict access (Cloudflare Access / no public routes if possible). Never paste the secret in chat.
4. Only after explicit approval run a single outbound TLS+EHLO probe; remove/disable the diagnostic immediately after recording sanitized results. This is NOT an email delivery test.
5. Actual SMTP authentication and a controlled test email require separate, explicit authorization, and the Hostinger mailbox authentication details must never be disclosed in chat.
6. Supabase production SQL migrations are independently blocked until a recoverable restore is demonstrated, SQL is reviewed/tested on PostgreSQL, and migration approval is explicit.

## What remains unverified
- Actual Cloudflare Workers egress to `smtp.hostinger.com:465` and server certificate handshake.
- Cloudflare Pages vs isolated Worker integration details and compatibility build.
- SPF, DKIM, DMARC, mailbox status, Hostinger limits, and actual deliverability.
- Recovery of RMP Works backup through the Supabase Multi restore plugin. Backup **creation** is complete per operator report; restore has not been verified.

## Offline tests
Run `node --experimental-strip-types --test tests/creator-smtp-private-probe-handler.test.mjs tests/creator-smtp-connection-probe.test.mjs tests/creator-cloudflare-smtp-channel.test.mjs` from a disposable worktree. They simulate sockets; they do not prove a real Cloudflare connection.

**Do not deploy the diagnostic into production or expose it on a public endpoint by default.**