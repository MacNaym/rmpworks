# B7 — Email confirmation and lead magnet delivery, phase 1 (DORMANT)

## What is implemented
- `functions/_lib/creator-email-verification.ts` contains standalone Web Crypto primitives for issuing 32-byte random base64url confirmation tokens, hashing with SHA-256, 15-minute expiry metadata, token validation, redemption through an **injected atomic storage adapter** and allowlisted HTTPS links to RMP Works.
- `tests/creator-email-verification.test.mjs` provides seven offline tests: random token uniqueness, TTL, malformed inputs, digest-only DB lookup, errors, replay contract and HTTPS origin restrictions.
- `2026-11-24-b7-email-verification-proposal.sql` sketches the pending-inbox token fields and atomic one-time UPDATE. **SQL has not been applied**. It is not a ready-to-run migration and requires staging review, idempotence and negative permission tests.

## Explicit limitations
- No Cloudflare route imports this module, no email provider is called, no email is sent, and nothing is delivered yet.
- The injected consume adapter is an **interface, not implementation**; exactly-once and expiry can only be guaranteed by a real atomic DB statement using database time and scoped verified tenant/resource conditions.
- The current B6 pending inbox is itself only a SQL proposal, not a live table.
- Do not use raw tokens in logs, analytics, webhooks, error reporters or public CRM.
- Any confirmation landing page should show a neutral confirmation UI on GET, with `Referrer-Policy: no-referrer`, no third-party scripts and a deliberate POST to consume the token (mail scanners may prefetch GET).
- Do not imply marketing opt-in from delivery consent. Record privacy notice version and retention/DSAR workflow.
- Sending emails requires verified sender domain, provider credential (server only), template review, bounce/failure handling, per-recipient throttling, and safe reissues.
- Post-verification delivery requires checking approval/published status again and granting short-lived resource access scoped to a specific creator and magnet. Do not send a permanent public resource URL.
- Service-role tokens must never be included in browser code; privileged writer/consumer should use narrowly scoped backend boundary and be reviewed.
- No modifications to ShopShield; Captain will configure it manually.

## Staging release sequence
1. Review and test the B6 D1 limiter and Supabase inbox proposals on isolated staging, including cross-creator negative cases and rollback.
2. Review and implement a transactional token issuance/consumption storage adapter, avoid leaking recipient existence.
3. Build provider adapter as a separately switchable, no-send default module. Verify sender and templates before enabling test delivery.
4. Implement approved resource delivery with short-lived access, audit, and tests for revoked magnet/unpublished creator.
5. End-to-end tests through preview and explicit Captain approval under #28 before opening public forms.

## Local unit tests
```powershell
node --experimental-strip-types --test tests/creator-email-verification.test.mjs
```
Seven cases prepared, **not yet run** on checked-out source. No production testing performed.
