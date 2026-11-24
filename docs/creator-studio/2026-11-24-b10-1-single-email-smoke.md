# B10.1 — Single authorized Resend email with CC

**Exact authorization:** one transactional test email, From `RMP Works <noreply@rmpworks.com>`, To `noreply@rmpworks.com`, Cc `luigi.pes84@gmail.com`, Subject `[RMP Works] Test invio Resend B10`. No real creator tokens, signup, payments or bulk mail.

## Architecture limitation

Cloudflare Pages stores `RESEND_API_KEY` as an encrypted production secret. Its **presence has been confirmed**, but Cloudflare intentionally does not expose its plaintext back to API clients, and a local program cannot borrow it. Reusing the key for an isolated test requires the operator's locally saved copy of the Resend key or a newly created **sending-only, domain-restricted** test key. Do **not** paste a key in ChatGPT. Neither method requires any deployment, route, Supabase access, DNS change or modification to existing Pages production secrets.

## Files

- `scripts/send-resend-b10-smoke-once.mjs`: fixed recipient, CC, sender, subject, MIME-compatible text+HTML, provider URL and stable Resend idempotency key. Writes an ignored attempt marker **before** making the POST to prevent accidentally resending on an uncertain network outcome. Status output never reveals provider response body or credentials.
- `scripts/send-resend-b10-smoke-once.ps1`: prompts for API key without echo, uses process-local environment variables while running Node, and removes them in finally. It does not write the key to files.
- The local marker `scripts/.resend-b10-smoke-attempted` is gitignored. Do not delete it and rerun without new authorization. Idempotency keys have 24-hour provider retention, not permanent replay protection.
- Resend documents `POST /emails` Idempotency-Key in https://resend.com/changelog/idempotency-keys .

## Operator steps (Windows PowerShell, in disposable worktree)

```powershell
node --check scripts/send-resend-b10-smoke-once.mjs
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\send-resend-b10-smoke-once.ps1
```

The PowerShell command will request a Resend **Sending Access** key for `rmpworks.com`, which must be pasted locally into the prompt. If the original key was not saved during creation, create a new scoped sending-only key in Resend; **do not** attempt to retrieve `RESEND_API_KEY` from Cloudflare or paste it in a chat.

## Interpretation

- `RESEND ACCEPTED`: Resend returned 2xx and a valid email ID. This means the provider accepted the message, **not** that Gmail or Hostinger delivered it; verify Gmail Inbox/Spam and Hostinger separately.
- `RESEND REJECTED: HTTP ...`: no automatic retry; check API key sender domain, verification and quota.
- `ESITO INCERTO`: avoid manual retry pending investigation; message may have been accepted.
- `INVIO BLOCCATO`: no HTTP request was made.
- Status line is intentionally sanitized; provider ID, raw response and API key are not logged.

**Production site, database, Pages secrets, release gate #28 and ShopShield are unchanged.** The test is separate from the dormant B10 outbox mail pipeline. Do not treat it as approval to enable creator email sending or SQL migrations.
