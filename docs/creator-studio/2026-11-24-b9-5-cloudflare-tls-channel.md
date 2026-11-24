# B9.5 — Cloudflare Workers TLS socket bridge (dormant)

**No production deployment, TCP connection, SMTP login or real email has been performed.** The code is a network abstraction intended for a future trusted Worker/Pages Function event handler.

## Implementation
- `creator-cloudflare-smtp-channel.ts` accepts an injected connect function with the shape of `connect` from `cloudflare:sockets`. It forces the exact destination `smtp.hostinger.com:465` and `secureTransport:'on'` (implicit TLS). The target cannot be replaced by caller inputs.
- Waits on the socket `opened` promise with a configurable bounded timeout (100–15000 ms, 5000 ms default). An opening error or timeout is sanitized, and the socket is requested to close.
- Wraps the socket readable/writable streams as a single line-oriented `readLine` / `write` / `close` channel for the B9.4 SMTP protocol. Read responses require CRLF, ASCII status bytes, maximum 1000 characters per line, and a maximum 8192-character buffer.
- Each blocking read and write has a deadline. On error, the channel closes and tries to cancel/abort streams and release locks. It rejects use after closure.
- It does **not** negotiate SMTP, authenticate or send a message on its own; B9.4 protocol and B9.3 transport remain separate, dormant layers. A trusted handler must explicitly inject `connect` and server-only credentials.
- No SMTP port 25 or plaintext fallback. Any configured credential should reside only in a Cloudflare secret, never a NEXT_PUBLIC variable, GitHub commit, chat message or browser payload.

## Evidence and limitations
- Cloudflare Workers TCP socket documentation: https://developers.cloudflare.com/workers/runtime-apis/tcp-sockets/ . `opened` indicates connection establishment and `readable` / `writable` are streams of bytes. `secureTransport:'on'` initiates TLS for a socket. Actual TLS certificate validation and provider interoperability need a real Cloudflare egress test.
- This transport abstraction deliberately leaves `cloudflare:sockets` import out of testable core; no production route has been modified.
- A mock may emulate socket close differently from actual Workers runtime. Simulated tests do not prove Cloudflare runtime compatibility, Hostinger authentication, outbound egress or delivery.
- The `readLine` API is appropriate for SMTP status replies, not a generic binary protocol; malformed/non-ASCII responses are rejected.
- Network-level timeouts may leave an SMTP transaction **ambiguous**. B9.3 and B9.1 require safe handling of uncertain post-DATA submissions; never assume retry is safe.

## Tests
- Twelve mock socket tests authored; **not yet run** at the time of this document. Run `node --experimental-strip-types --test tests/creator-cloudflare-smtp-channel.test.mjs` in a disposable worktree.

## Next gates
1. Execute offline socket tests and B9.3/B9.4 regressions.
2. Verify `noreply@rmpworks.com` mailbox, sending quotas and DNS SPF/DKIM/DMARC after Hostinger OAuth is repaired or by explicit user-side control panel verification.
3. Audit actual Cloudflare Workers/Pages runtime socket behavior, certificate validation, binding availability, and ingress authorization; **do not activate** a public mail endpoint for testing.
4. Only upon explicit approval: configure secret in Cloudflare, test TLS connection/authentication with no message delivery, then separately authorize an email to a controlled mailbox.
5. Await independently recoverable Supabase Multi backup and PostgreSQL execution/concurrency tests before any live B8–B9 migration.