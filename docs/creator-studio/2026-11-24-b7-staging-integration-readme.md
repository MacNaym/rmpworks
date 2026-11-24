# B7 restricted one-time token redemption — production-first decision

## Environment inventory (24 Nov 2026)

Supabase Multi shows one RMP Works project `rmpworks` (ref `mxgwdnnpkywzhldyyrue`, **production**) and no separately registered RMP Works staging target. Other listed projects belong to other products and are not valid staging databases. Therefore no SQL or data writes have been executed.

Cloudflare Pages `rmpworks` retains `main` as production branch. The `RMP_CREATOR_PUBLIC_RELEASE` flag remains unset; no release authorization was changed.

The repo already holds dormant B6 inbox SQL and B7 token issuance, mail and resource components. Real SMTP/transactional email provider API, credential and verified sender have **not** been confirmed. Hostinger mailboxes do not in themselves prove API transactional delivery is available.

## Files

- `2026-11-24-b7-staging-consume-token.sql`: *proposed* transactional PostgreSQL migration, **NOT APPLIED**. Includes idempotent columns, scoped digest format/expiry checks, digest uniqueness, and `public.creator_consume_email_token(text)` RPC. Atomic UPDATE verifies current publication and approved magnet; clears digest on success. REVOKE EXECUTE for PUBLIC/anon/authenticated and GRANT only to service_role. SECURITY DEFINER has an empty search_path and schema-qualified relations; it is a privileged function and requires independent review before any real installation.
- `functions/_lib/creator-token-consumer.ts`: dormant backend-only adapter that refuses all calls unless a trusted server authorization flag is true (currently named `stagingApproved`; rename before production wiring) and server credential and URL pass configuration checks. Does not import into any public route.
- `tests/creator-token-consumer.test.mjs`: five mock tests; **not yet executed**.

## Operating decision — approved 24 Nov 2026

Captain approved **one Supabase project for RMP Works for now**, without a dedicated staging database. Reassess staging if the project gains traction, real customers, or increased production risk. This is **not approval to apply the existing SQL proposal unchanged**, and does not authorize public release. We must avoid untested destructive changes and never treat a transaction as a substitute for recoverable backups. Maintain the closed release gate #28.

## Preconditions before any production database change

1. Explicitly resolve the **rmpworks production** target/ref before every database operation; never reuse another product's project.
2. Read-only schema/RLS/security audit first; capture a recoverable backup or PITR capability and identify dependencies/restore plan.
3. Consolidate and review B6 and B7 SQL into carefully scoped, idempotent additions with no changes to existing live tables or flows beyond what has been separately approved.
4. Execute offline mock tests first, then explicitly authorize each production schema change after risk review; use transactional DDL where possible, with a written rollback.
5. Test only with clearly labeled synthetic records in the new isolated structures. Verify privileges, one-time redemption, expiry, unpublished creator, unapproved magnet and cross-tenant denial; clean up synthetic data safely.
6. Check Supabase security advisors. Never expose backend secrets in client code. Keep `RMP_CREATOR_PUBLIC_RELEASE` unset throughout.
7. Add audited token issuance/persistence separately; the current PR only implements consumption.
8. Configure transactional email provider separately after DNS/sender verification and cost review; keep no-send default until approved.
9. Review consent, privacy retention, data deletion and ShopShield. Gate #28 stays closed.
10. When real users and sales increase risk, re-evaluate whether dedicated staging is justified.

Run the five offline mock tests in an isolated worktree:

```powershell
node --experimental-strip-types --test tests/creator-token-consumer.test.mjs
```

No production database, Cloudflare env, DNS, email sending, website release or payments are modified by this PR.
