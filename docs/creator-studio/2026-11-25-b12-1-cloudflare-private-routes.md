# B12.1 — Cloudflare Pages PRIVATE creator lead trial routes

## Implementation

Three new Cloudflare Pages Functions:
- `POST /api/creator-private-lead-intake`: requires exact same-origin HTTPS `Origin`, operator secret header `x-rmp-private-key`, server trial flag and independent intake flag. Looks up **published** creator snapshot display name and **approved** magnet using server-only credential, then calls existing atomic encrypted `creator_create_lead_with_outbox`. Returns generic 202 for both stored and duplicate/ineligible leads, without disclosing account or email existence.
- `POST /api/creator-private-confirm-email`: exact same private guards, independent confirmation flag, SHA-256 digest single-use RPC. No side effects in GET; invalid tokens give generic 200, unavailable returns 503.
- `POST /api/creator-private-outbox-dispatch`: same private guard, independent dispatch flag, invokes existing B10.2 one-job encrypted outbox lease/revalidation/Resend adapter. No cron and no anonymous dispatch. GET returns 405.

`functions/_lib/creator-private-route-guards.ts` implements same-origin HTTPS checks for `rmpworks.com`, `www.rmpworks.com`, `rmpworks.pages.dev` and branch previews, fixed-size SHA-256 comparison of operator key, bounded JSON input, server binding validation.

Existing module gates previously required public release. **Only after operator authentication**, these private endpoints pass a server-derived `publicReleaseEnabled:true` or `RMP_CREATOR_PUBLIC_RELEASE:"true"` to internal module APIs; this is an explicitly scoped private trial override. The actual Cloudflare public release flag stays absent/false. Do not import or reuse these overrides in a public endpoint.

## All new variables default absent => disabled

Cloudflare Pages server bindings required **only for a future explicitly authorized private trial**:
- `RMP_CREATOR_PRIVATE_TRIAL=true` — trial master gate, server-only.
- `RMP_CREATOR_PRIVATE_KEY` — generate a random >=32-character **server-only secret**; never put it into frontend or repository. Operator supplies it as `x-rmp-private-key` only when making a private trial request.
- `RMP_CREATOR_INTAKE_ENABLED=true`, `RMP_CREATOR_CONFIRMATION_ENABLED=true`, `RMP_CONFIRMATION_DISPATCH_ENABLED=true` — separately gated.
- `RMP_SUPABASE_URL=https://mxgwdnnpkywzhldyyrue.supabase.co`, `RMP_SUPABASE_SERVICE_KEY` — backend-only Supabase key with privileged RPC permission; **never** use a publishable or anon browser key as a substitute.
- `RMP_OUTBOX_KEY_ID` (e.g. `mail-v1`) and `RMP_OUTBOX_KEY_B64URL`: freshly generated 32-byte random AES key encoded as unpadded base64url, server secret. Avoid reusing another project's keys or logging its value; preserve previous keys while pending messages still exist.
- `RMP_RESEND_DOMAIN_VERIFIED=true` after trusted manual domain verification, and existing `RESEND_API_KEY` (already present in Pages production as a secret_text).

**None of the missing variables is provisioned in this PR. No deployments or production site changes.** The B11 schema is already installed on Supabase production and MUST NOT be reapplied.

## Security boundary

These are *operator-only smoke-test routes*, **not a public lead intake launch**. Before a truly public endpoint, implement server-side Cloudflare Turnstile siteverify, durable IP + tenant scoped rate limiting, content/consent validation and abuse handling; do not remove the private key and call these routes public-ready. Turnstile validation is mandatory server-side according to Cloudflare documentation: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

The email link currently points to `/creator/confirm-email?token=...`. This route does NOT yet provide the actual user-facing confirmation page; the private manual trial uses POST to the operator-only endpoint. The public verification page is a later gated batch.

## Offline tests

13 new tests in `tests/creator-private-pages-routes.test.mjs` (auth headers, flag gates, origins, host checks, JSON size/type limits, no GET side effects). They are **prepared but not yet executed**. Run with the 44 previous B9–B12 offline tests:

```powershell
node --experimental-strip-types --test tests/creator-private-pages-routes.test.mjs tests/creator-lead-workflow.test.mjs tests/creator-resend-outbox-dispatch.test.mjs tests/creator-resend-http-transport.test.mjs tests/creator-outbox-worker.test.mjs
```

Expected: 57 tests. These are mock/local and do not call production Supabase or Resend.

## Deployment gates

- Keep draft PR stacked; do NOT merge into `main` or deploy Pages yet.
- After offline tests, verify Pages build and Functions bundling before deploying any route.
- Review private operator secret handling and rate limit design before enabling trial flags.
- Public site and email remain off unless separately authorized.
