# B7 staged integration: restricted one-time token redemption

## Environment inventory (24 Nov 2026)

Supabase Multi shows one RMP Works project `rmpworks` (ref `mxgwdnnpkywzhldyyrue`, **production**) and no separately registered RMP Works staging target. Other listed projects belong to other products and are not valid staging databases. Therefore no SQL or data writes have been executed.

Cloudflare Pages `rmpworks` retains `main` as production branch. The `RMP_CREATOR_PUBLIC_RELEASE` flag remains unset; no release authorization was changed.

The repo already holds dormant B6 inbox SQL and B7 token issuance, mail and resource components. Real SMTP/transactional email provider API, credential and verified sender have **not** been confirmed. Hostinger mailboxes do not in themselves prove API transactional delivery is available.

## Files

- `2026-11-24-b7-staging-consume-token.sql`: *proposed* transactional PostgreSQL migration, **NOT APPLIED**. Includes idempotent columns, scoped digest format/expiry checks, digest uniqueness, and `public.creator_consume_email_token(text)` RPC. Atomic UPDATE verifies current publication and approved magnet; clears digest on success. REVOKE EXECUTE for PUBLIC/anon/authenticated and GRANT only to service_role. SECURITY DEFINER has an empty search_path and schema-qualified relations; it is a privileged function and requires independent review before any real installation.
- `functions/_lib/creator-token-consumer.ts`: dormant backend-only adapter that refuses all calls unless `stagingApproved` is true and server credential and URL pass configuration checks. Does not import into any public route.
- `tests/creator-token-consumer.test.mjs`: five mock tests; **not yet executed**.

## Exact preconditions before any staged migration

1. Create or designate a *separate* RMP staging Supabase project, verify account/ref explicitly. New projects may involve cost and require approval.
2. Take a recoverable schema backup and understand foreign key/trigger dependencies from B6.
3. Install and test B6 inbox design in that staging target, then review and execute B7 SQL within a transaction.
4. Verify function privileges, deliberate token consumption, replay denial, expiry, unpublished creator, unapproved magnet and cross-tenant mismatches via real SQL.
5. Check Supabase security advisors, test rollback, and explicitly authorize any backend privileged secret only on staging. Never expose the key in client code.
6. Add an audited **token issuance/persistence** method; this PR only implements consumption, not delivery or issuance storage.
7. Configure transactional email provider separately after DNS/sender verification and cost review, retain no-send default until approved.
8. Review consent, privacy retention, data deletion and ShopShield. Public-release issue #28 stays closed.

Run the five offline mock tests in an isolated worktree:

```powershell
node --experimental-strip-types --test tests/creator-token-consumer.test.mjs
```

No production database, Cloudflare env, DNS, email sending, website release or payments are modified by this PR.
