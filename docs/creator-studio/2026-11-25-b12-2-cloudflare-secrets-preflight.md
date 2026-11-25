# B12.2 — Cloudflare Pages secret inventory and build preflight

## Evidence: Cloudflare read-only inspection (25 Nov 2026)

Pages project **rmpworks**, production branch **main**, build `npm run build`, output `out`.
Production variables: `NEXT_PUBLIC_SITE_URL`, `RESEND_API_KEY` (**secret_text**), `RMP_SUPABASE_PUBLISHABLE_KEY`, `RMP_SUPABASE_URL`, `STRIPE_WEBHOOK_SECRET_TEST` (**secret_text**), `WORDPRESS_API_URL`. Preview has only `NEXT_PUBLIC_SITE_URL` and `WORDPRESS_API_URL`.

**Missing**: `RMP_CREATOR_PRIVATE_TRIAL`, `RMP_CREATOR_PRIVATE_KEY`, `RMP_CREATOR_INTAKE_ENABLED`, `RMP_CREATOR_CONFIRMATION_ENABLED`, `RMP_CONFIRMATION_DISPATCH_ENABLED`, `RMP_RESEND_DOMAIN_VERIFIED`, `RMP_SUPABASE_SERVICE_KEY`, `RMP_OUTBOX_KEY_ID`, `RMP_OUTBOX_KEY_B64URL`. **No missing secrets or toggles have been created in Cloudflare.**

The `RMP_SUPABASE_PUBLISHABLE_KEY` is not sufficient for `service_role`-restricted B11 functions. A separate server-only key on the exact Supabase project `mxgwdnnpkywzhldyyrue` is needed. NEVER copy or paste its value into chat and never use the secret in frontend code.

## Build and tests (no remote side effects)

From disposable B12.2 worktree:

```powershell
node scripts/check-b12-2-private-pages.mjs
node --experimental-strip-types --test tests/creator-private-pages-routes.test.mjs tests/creator-lead-workflow.test.mjs tests/creator-resend-outbox-dispatch.test.mjs tests/creator-resend-http-transport.test.mjs tests/creator-outbox-worker.test.mjs
npm ci
npx tsc --noEmit
npm run build
```

**None of the checks has been executed in the user's environment yet.** The TypeScript `allowImportingTsExtensions` flag is enabled for explicit `.ts` imports; `noEmit` remains true. Build/test outputs must be reviewed, including Pages Functions bundling separate from Next static `out` build.

## Local-only generation (not required for build)

After confirming no prior AES keys are in use, run:

```powershell
node scripts/generate-b12-2-private-keys.mjs
```

This generates `.dev.vars.b12-private` with independent random operator and AES-256 keys, without printing secret values, and refuses to overwrite an existing draft. All `.dev.vars*` files are gitignored. The draft does not configure Cloudflare. On Windows, local filesystem ACLs govern actual confidentiality; do not assume POSIX mode 0600 is enforced on NTFS. Store the file securely and do not upload or paste it. Keep the AES key available for any still-pending encrypted outbox jobs (rotation requires a key ring).

## Operational safety

- The Cloudflare production domain and public creator release **remain unchanged**.
- Do not add a public lead endpoint, schedule the dispatcher, or enable any trial switch before user-approved endpoint smoke test and runtime authorization checks.
- A request header containing the private operator key is for strictly controlled testing, not public/anonymous users. Add durable IP/tenant rate limits, Turnstile server validation, and abuse limits before public release.
- Never reapply the B11 database migration; it is already installed on production.
- Do not deploy directly to main or alter Pages secret variables from this branch.
- A successful `npm run build` for a Next static export does **not alone prove** that Cloudflare Pages Functions bundle and run; test the Functions separately in a compatible local runtime or isolated preview before any production cutover.

## Next gate

Review local TypeScript/tests/build results and perform a separate local Pages Functions bundling test. Only then plan scoped secret provisioning and an explicitly authorized private preview deployment. Keep all switches OFF by default.
