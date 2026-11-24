# Batch B6 — Turnstile server verification helper

Added pure server-side `functions/_lib/creator-turnstile.ts` with fail-closed validation and no route integration.

- Requires server secret, 1–2048 character token, allowlisted expected hostname and action.
- Uses official Cloudflare Siteverify endpoint, verifies `success`, exact `hostname` and `action`. Network/service errors reject.
- Does not log secrets/tokens. Uses 5s request timeout.
- **No public endpoint enabled; no Turnstile site key or secret configured or deployed.**
- Server integration must validate hostname/action on each allowed host; this first version supports exact per-host configuration.
- API does not enforce single-use tokens locally; Cloudflare Siteverify handles token validation/replay. Additional application rate-limiting and idempotency remain required.
- No production testing. Offline unit tests are `node --experimental-strip-types --test tests/creator-turnstile.test.mjs`.

Before using in a public creator-lead route: configure keys securely; actual DNS/host validation; rate limits/abuse prevention, tenant isolation and RLS; separate consent/ShopShield; smoke test in staging; explicit release gate #28 approval. This helper is not public form protection on its own.
