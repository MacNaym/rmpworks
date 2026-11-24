# B9.3 — Hostinger SMTP transport contract (offline / dormant)

**No real email delivery is enabled.** No secrets, DNS, Cloudflare deploy, database migration or Hostinger mailbox settings changed.

## Verified from Hostinger support documentation (2026-11-24)
- Hostinger Email outgoing host: `smtp.hostinger.com`.
- Default port: `465`, SSL/TLS from connection start (implicit TLS). Alternative: `587` STARTTLS if needed.
- SMTP username should be the complete mailbox address; sender must match an authenticated mailbox.
- This PR assumes `noreply@rmpworks.com` as the intended sender based on the project conversation, **not** a verified mailbox or DNS configuration.
- Documentation: https://www.hostinger.com/support/1575756-how-to-get-email-account-configuration-details-for-hostinger-email/ and https://www.hostinger.com/support/how-to-fix-smtp-email-sending-errors-on-hostinger/.

## Security and platform limitations
- Cloudflare Pages/Workers does not automatically expose a generic SMTP send API; SMTP is a TCP/TLS protocol, not an HTTPS JSON endpoint. This B9.3 module does not initiate TCP connections.
- `creator-hostinger-smtp-transport.ts` is an adapter boundary. The real `submit` must be implemented and audited separately in an execution environment that safely supports authenticated SMTP/TLS. **No SMTP password is in GitHub or client code.**
- The transport is **disabled by default** and never claims provider idempotency. An exception/timeout after SMTP DATA is `ambiguous`, since delivery may already have succeeded; B9.1 then safely marks `needs_review` rather than retrying automatically.
- Only explicit SMTP server temporary rejects qualify as `retryable`; permanent rejects become `permanent`. The future SMTP implementation must distinguish pre-acceptance definite rejection from ambiguous disconnects.
- The event ID is correlation metadata, **not an SMTP idempotency key**.
- Actual DNS SPF/DKIM/DMARC, verified mailbox, send quota, sender authentication, bounce handling, TLS negotiation, sending limits and Cloudflare runtime networking remain unverified.
- Hostinger connector may require OAuth reauthorization. This does not imply the mailbox itself is broken; connector is not needed to test the offline contract.

## Next real integration decision
Confirm whether SMTP submission can run safely in the chosen backend environment (Cloudflare, dedicated relay, or an existing transactional email HTTP provider), without adding recurring cost. Do not assume direct Cloudflare SMTP socket support. If unsupported, use an explicitly approved HTTP transactional provider. Keep sender `noreply@rmpworks.com` where domain ownership/DNS verification permits.

## Test
Ten new isolated Node tests are prepared, **not yet run** at creation. Run in a disposable worktree:
```powershell
node --experimental-strip-types --test tests/creator-hostinger-smtp-transport.test.mjs
```

Offline tests prove contract validation and outcome classification, **not SMTP connectivity, message deliverability, provider idempotency, or production readiness**.