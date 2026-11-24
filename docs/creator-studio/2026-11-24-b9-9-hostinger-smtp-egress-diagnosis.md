# B9.9 — Hostinger SMTP failure isolation

Observed B9.8 remote Worker result: `{"status":"unavailable","phase":"connect","tlsOpened":false,...}`. No SMTP credentials or mail sent. The original B9.5 bridge sanitizes connection failures, so this output **does not distinguish TLS rejection, network policy, DNS, remote service or timeouts**.

## Change

- An explicitly authorized private diagnostic now performs a **single follow-up TCP open** to the same Hostinger service on port **587** with `secureTransport:"off"` **only when port 465 implicit TLS failed before opening**.
- It sends **zero SMTP commands, usernames, passwords, email addresses or message data** to port 587 and closes the socket; it does not send plaintext SMTP credentials.
- The result reports fixed labels only: `port587:tcp_opened|tcp_failed`; an allowlisted `reason587` categorizes refusal, blocked route, timeout, DNS, TLS or unknown, without including server messages.
- `diagnostics/run-remote-smtp-probe.mjs` outputs the new fixed-label `egress` object when present. No public route, production deployment or mailbox secret is configured.

## Interpretation

- `port587:tcp_opened`: general Cloudflare → Hostinger TCP route works for SMTP submission, so the failure on 465 is more specific to that port/TLS. It does **not** prove STARTTLS or authenticated delivery.
- `port587:tcp_failed`: both paths failed. This may indicate hosting/provider egress filtering or DNS/service unavailability. It does **not** independently prove permanent Cloudflare SMTP restriction.
- Initial 465 result is still generic. More detailed low-level instrumentation should remain private and return allowlisted classifications only, never raw provider errors.

## Tests and operations

Four new offline tests created (not yet executed at authoring). Run from a disposable worktree:

```powershell
node --experimental-strip-types --test tests/creator-smtp-hostinger-egress-diagnostic.test.mjs tests/creator-smtp-private-probe-handler.test.mjs
```

Then, if offline tests pass, the **same manually authorized** remote preview diagnostic command can be run once:

```powershell
node diagnostics/run-remote-smtp-probe.mjs
```

It generates and destroys an ephemeral key. No production SQL, DNS, Hostinger changes, public creator release, real emails or credentials. RMP Works backup is created; independent restore verification remains necessary before production SQL migration.
