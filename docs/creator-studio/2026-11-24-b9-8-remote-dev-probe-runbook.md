# B9.8 — One-shot remote Cloudflare Hostinger SMTP TLS/EHLO diagnostic

**Not executed as of PR creation. No production Worker deployed. No SMTP AUTH, email, DNS, SQL, secret provisioning, or RMP site changes.**

## Why remote dev
Cloudflare documents `wrangler dev --remote` as executing a Worker in a temporary preview on Cloudflare infrastructure rather than a durable production deployment. This is necessary to test real Cloudflare outbound TCP/TLS; local Miniflare simulation cannot prove egress to Hostinger. References: https://developers.cloudflare.com/workers/local-development/ and https://developers.cloudflare.com/workers/wrangler/commands/workers/ .

## Source
- `diagnostics/wrangler.toml`: isolated diagnostic configuration, no public site route, workers_dev=false, preview_urls=false.
- `diagnostics/smtp-probe-worker.ts`: Cloudflare-specific entrypoint importing `connect` and delegating to the B9.7 authorization handler.
- `diagnostics/run-remote-smtp-probe.mjs`: single-shot local Node 24 runner. Uses a random 64-hex access key, writes `diagnostics/.dev.vars` (Git-ignored), starts `npx --yes wrangler dev --remote` on localhost 127.0.0.1:8798, waits for HTTP response without triggering SMTP, then makes one authorized POST.
- The diagnostic only performs TLS connect to smtp.hostinger.com:465, reads the 220 greeting and exchanges EHLO and optional QUIT. The runner shows only sanitized status/phase booleans; never captures or displays SMTP capabilities, credentials, contents or secrets.
- The runner terminates the Wrangler process tree and deletes .dev.vars in `finally`, including on errors. If `.dev.vars` already exists, it refuses to overwrite it.

## Safety / limits
- Remote preview infrastructure may receive and transiently retain the random test authorization secret during the session, but it is **not an email password**. Preview URLs can be publicly reachable depending on Cloudflare account settings, even if this source config disables routes and preview URLs. The handler still requires the random key; do not assume the preview is intrinsically private.
- The script cannot run without local Cloudflare Wrangler authentication and a Node/npm installation. Run `npx wrangler login` separately if authentication is required; no personal access token should be pasted in chat.
- `wrangler dev --remote` may use Cloudflare infrastructure temporarily and can incur normal Worker limits; no dedicated paid service is provisioned by this code.
- There is no automatic creation or modification of a permanent Cloudflare Workers script, domain route or Pages deployment by the runbook.
- A successful connected result verifies basic TLS + SMTP greeting + EHLO from Cloudflare remote preview **only**. It does not prove SMTP AUTH, SPF/DKIM/DMARC, permitted send quota or deliverability.
- Results other than `connected` require investigation before any real email adapter is wired.
- Do NOT commit `diagnostics/.dev.vars` or copy the random key to support threads. The `.gitignore` prevents accidental addition.

## Operator commands (Windows PowerShell, from RMP repo root)
```powershell
node --check diagnostics/run-remote-smtp-probe.mjs
node diagnostics/run-remote-smtp-probe.mjs
```

Do **not** run `wrangler deploy`; the diagnostic should use remote development only. The script is not yet tested against live Wrangler and may need a narrow follow-up compatibility fix.

## Database release
RMP production backup **created**, per operator. Supabase Multi restore execution/verification is still outstanding; do not run B8/B9 production SQL until recoverable restore and PostgreSQL concurrency tests are completed. Creator public release gate #28 closed.