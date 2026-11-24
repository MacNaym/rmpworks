# B6 — Persistent rate limiting for future public creator lead forms

Status: **PREPARED, NOT WIRED, NOT DEPLOYED, NOT TESTED ON THE CAPTAIN'S PC**.

## Design
- Server-side Cloudflare D1 fixed-window counter, using one atomic `INSERT ... ON CONFLICT DO UPDATE ... WHERE hits < ? RETURNING hits` statement.
- Bucket key is HMAC-SHA256 derived from tenant, action and verified client IP; raw IP is not stored.
- Default-deny if binding/secret/IP unavailable, wrong configuration, SQL error or response unexpectedly shaped.
- Separate counters per tenant and action, resets each fixed window.
- SQL schema in `docs/creator-studio/2026-11-24-b6-rate-limit-d1.sql` is **not applied**. Requires confirmation of D1 project and backup before migration.
- Requires server secret `RMP_CREATOR_RATE_LIMIT_SECRET` (generate securely on platform; do NOT commit to git or chats).
- Do NOT blindly trust `X-Forwarded-For` sent by users. Derive client IP only from verified Cloudflare request context/headers when genuinely behind Cloudflare, and document proxy trust.
- Data minimization: buckets remain pseudonymous personal data; ShopShield/privacy policy and retention must cover the necessary security use. Planned expiry deletion by scheduled job.

## Limits
No production values selected yet. Example test 2 requests / 60 seconds is **not a real product quota**. Per-tenant plus global/IP controls and webhook/billing metering are separate concerns.

## Threats / remaining B6 gates
- Full public endpoint is not yet created. The private CRM currently requires auth and does not consume this limiter.
- Must compose verified origin/host, public release flag, published creator snapshot, Turnstile #45, rate limiter, honeypot, ownership of lead magnet, anti-enumeration and server-side RLS-safe lead creation **before** accepting anonymous leads.
- Always perform rate limiting before costly Turnstile and DB writes; ensure query cannot be bypassed on failure.
- For higher-volume production usage, validate atomic behaviour under concurrency on the real D1 runtime; evaluate multi-region consistency and Cloudflare Rate Limiting/WAF rules.
- Need integration tests with a real D1 preview binding and negative test tenant A/B; avoid service-role access for public clients.
- No public POST, no ShopShield script, no Stripe, no environment variables or production changes in this PR.

## Local tests
```powershell
node --experimental-strip-types --test tests/creator-rate-limit.test.mjs
```

## Merge policy
This PR can be reviewed as **dormant infrastructure** only. The SQL and secret should not be applied during merge, and release gate #28 remains closed.
