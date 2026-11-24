# B9.4 — Direct Hostinger SMTP feasibility on Cloudflare Workers

**Decision:** prefer the existing Hostinger mailbox over Cloudflare Email Sending for public signup email under the current strict €0 budget. This is a feasibility/design and dormant protocol batch, **not** an activated mail service.

## Verified platform facts (2026-11-24)

- Cloudflare Workers supports outbound TCP sockets with `connect()` from `cloudflare:sockets`, `secureTransport: 'on'` for TLS from the start. Outbound TCP port **25 is prohibited**. Hostinger SMTP submission uses `smtp.hostinger.com:465` with implicit SSL/TLS; therefore **an outbound port 465 connection is plausible**, but actual Hostinger connectivity from the RMP Cloudflare account has NOT been tested.
- Cloudflare Email Service public beta supports Workers-native email sending, **but outbound messages to arbitrary recipients require Workers Paid**. On Workers Free, sending to specific verified destination addresses is free and unsuitable for arbitrary creator leads. Current documentation states Workers Paid includes 3,000 sends/month. Thus Cloudflare Email Sending is **not the zero-extra-cost option** for this public workflow.
- Cloudflare sockets require an event handler; cannot be opened at module/global initialization. Do not assume outbound SMTP can be sent by an HTTPS fetch to a Hostinger mail server.
- Hostinger connection should be authenticated with the complete mailbox address `noreply@rmpworks.com`, sender pinned to same address, mailbox password stored only as Cloudflare server-side secret. **No credentials in repo/chat/browser or frontend environment variables**.
- Official Cloudflare docs: https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/ and https://developers.cloudflare.com/email-service/platform/pricing/ . Official Hostinger docs: https://www.hostinger.com/support/1575756-how-to-get-email-account-configuration-details-for-hostinger-email/ .

## Offline implementation

- `creator-smtp-secure-session.ts` is a dormant SMTP protocol state machine which accepts a pre-established and trusted implicit-TLS channel (injected). Sends EHLO, checks advertised AUTH PLAIN, authenticates, sends MAIL FROM, RCPT TO, DATA, and waits for an explicit final 250 acceptance.
- MIME multipart/alternative is generated with RFC 2047 UTF-8 subject and base64-encoded text/HTML content. It pins envelope sender and validates email/header input. The module itself never opens a socket or uses credentials from persistent storage.
- Definite SMTP 4xx before or after DATA maps to temporary failure, definite 5xx maps permanent, a disconnect or unknown response maps uncertain/ambiguous. For SMTP there is **NO reliable idempotency key**; do not automatically replay ambiguous sends.
- SMTP session does not yet implement network timeouts, per-line total response byte limits, fail-fast socket abort, SMTP capability negotiation for SMTPUTF8/8BITMIME, message size discovery, SPF/DKIM/DMARC checks, bounce handling, or rate limits. It must remain disabled until those are completed and actual TLS handshake/provider behavior is verified.
- Password is provided only to the trusted SMTP session at call time; it is sent inside an encrypted TLS channel but may temporarily reside in memory. Never log SMTP traffic.
- Connection adapter for Cloudflare sockets (`connect`, line reader, writer, lifecycle and short timeouts) is **not implemented** in this batch. Neither production backend nor HTTP route is wired to this protocol. Do not deploy a mail gateway based solely on this PR.

## Test / execution status

- Ten offline simulated SMTP protocol tests authored. **Not executed yet**. Run via `node --experimental-strip-types --test tests/creator-smtp-secure-session.test.mjs` in detached worktree.
- Current provider selection stays provisional until actual mailbox confirmation, Hostinger sending quota, DNS SPF/DKIM/DMARC and Cloudflare egress are independently checked. Hostinger OAuth connector may need reauthorization, but it is not required for offline code.
- No production SQL before independently recoverable Supabase Multi backup. No DNS or Cloudflare send secret changes without explicit approval. Public creator release gate #28 remains closed.