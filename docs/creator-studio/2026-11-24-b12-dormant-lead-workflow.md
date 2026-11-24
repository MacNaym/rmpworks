# B12 — Server-only creator lead intake and email confirmation (DORMANT)

## Implemented

- `functions/_lib/creator-lead-workflow.ts` composes `enqueueLeadWithMail` and `redeemEmailVerification` with backend-only database RPC `creator_consume_email_token`.
- Lead intake requires two explicitly enabled trusted server gates and valid 32-byte AES-GCM outbox key + key ID; uses atomic deployed production RPC `creator_create_lead_with_outbox`. No plaintext token stored in DB.
- Confirmation hashes the 43-character email token with SHA-256 and submits **only its digest** to the privileged single-use redemption RPC, never the token. The verification endpoint must ultimately use POST only, with CSRF/origin controls before calling this function.
- No active Cloudflare Page function, public route, scheduler or UI imports this module. Production use is **not enabled**.
- `tests/creator-lead-workflow.test.mjs`: 8 offline mock-fetch tests authored, **not executed yet**. They verify both feature gates, invalid credentials, exactly one atomic insert RPC with ciphertext, duplicate suppression, invalid tokens, server-only digest redemption and controlled provider failure.

## Real production schema

B11 SQL was already successfully applied on 24 Nov 2026 to account `okstyleshirts`, project ref `mxgwdnnpkywzhldyyrue`, and checked: new lead/outbox tables RLS enabled, no public permissions, server RPCs granted to service_role, zero initial rows. **Do not reapply B11 SQL**.

## Activation blockers (do not bypass)

1. Review trusted Cloudflare Pages functions routing and implement a private runtime adapter with server-only Supabase service key, AES-GCM outbox key and relevant feature flags, never exposing any of these to the browser. The existing Pages `RESEND_API_KEY` secret alone is insufficient.
2. Add public intake rate-limits, abuse detection and consent controls, and confirm magnet/resource/creator tenancy and fresh published snapshot in the atomic DB RPC.
3. Secure email confirmation with **POST** (no side-effectful GET), CSRF/origin controls, anti-automation throttling and generic success/error responses.
4. Add an authenticated internal trigger for `dispatchOneResendOutbox`, secret rotation, delivery metrics and quota monitoring. Do **not** create an anonymous public email-dispatch route.
5. Verify full end-to-end *controlled* trial in production with explicit operator authorization, then separately review whether to open release gate #28.

## Offline command

```powershell
node --experimental-strip-types --test tests/creator-lead-workflow.test.mjs tests/creator-resend-outbox-dispatch.test.mjs tests/creator-resend-http-transport.test.mjs tests/creator-outbox-worker.test.mjs
```

No real emails or database writes are made by these mock tests. Production Cloudflare settings, DB records, DNS, Stripe and ShopShield are unchanged by B12.
