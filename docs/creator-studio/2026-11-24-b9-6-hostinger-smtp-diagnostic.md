# B9.6 — Hostinger SMTP connection diagnostic (no credentials)

**Status:** dormant source and mocked tests, not a deployed diagnostic. No live Cloudflare connection, SMTP login, secret, email send, DNS change, SQL migration or public route.

## What it checks
- Enforced destination smtp.hostinger.com on port 465, implicit TLS requested through the B9.5 `openHostingerTlsChannel` adapter.
- Server provides a complete 220 greeting; the diagnostic sends only EHLO rmpworks.com, requires SMTP 250 capability reply, optionally sends QUIT.
- Reports only structured booleans and a coarse failure phase. Never returns raw SMTP greetings or errors that might contain provider details. No user email, recipient, token, password, AUTH, MAIL FROM, RCPT TO or DATA ever enters this diagnostic.
- Requires explicit server-controlled `enabled:true`; false means no socket is created. There is no public endpoint or Cloudflare `cloudflare:sockets` import in the current module.

## Invocation plan after review
1. Finish offline tests first.
2. Review actual Cloudflare Pages/Workers runtime support and build a private, single-use diagnostics handler in an isolated preview environment if approved.
3. Gate execution with a server-only authorization value. A public 'diagnose' route would permit unauthenticated callers to open outbound TCP sockets; never deploy one.
4. Explicitly approve a one-time TLS+EHLO probe and verify the result without storing remote greetings or secrets.
5. A successful handshake does NOT establish verified sender ownership, SMTP AUTH success, DNS SPF/DKIM/DMARC, sending quota, rate limiting or email deliverability.
6. Actual SMTP AUTH with `noreply@rmpworks.com` and a controlled test message require a separate user approval and a Cloudflare secret injected via approved configuration. Never share passwords in chat or GitHub.

## Offline tests
Ten mock tests prepared (not yet executed). Run:
```powershell
node --experimental-strip-types --test tests/creator-smtp-connection-probe.test.mjs
```

## Runtime constraints
- Cloudflare Workers TCP sockets: https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/
- Only an actual isolated Cloudflare execution establishes whether implicit TLS to Hostinger:465 succeeds from the account's Worker runtime.
- This is not a general-purpose SMTP port scanner: address, port and transport are fixed in B9.5.
- Supabase Multi verified recoverable backup remains mandatory for B8–B9 SQL in production; public release gate #28 stays closed.