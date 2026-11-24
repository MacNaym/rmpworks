# B8 — Production-first DB change runbook (24 November 2026)

**Status: PREPARED ONLY. No database changes have been executed.**

## Target and audit proof
Supabase Multi resolution: `rmpworks` / `mxgwdnnpkywzhldyyrue` / `okstyleshirts`, production.
Live read-only inspection on 24 Nov confirmed:
- Six existing `creator_*` tables with RLS enabled.
- `creator_public_lead_inbox` absent; `creator_consume_email_token(text)` absent.
- PostgreSQL server version 17.0.12.
- Account status constraint permits `active` and `paused`; magnet status permits `approved`.
- Owner-scoped lead magnet policies; anonymous snapshot SELECT only when `published=true` and timestamp present.
- All current live creator tables and policies remain untouched by proposed B8 install.

## What the consolidated proposal does
`2026-11-24-b8-b6-b7-consolidated-PROPOSAL.sql` replaces the separate B6/B7 SQL proposals for a **fresh installation** only, guarded by an exception if objects already exist. It uses one transaction, 3-second lock timeout, 15-second statement timeout; adds a new inbox table, RLS, no public policies, strict pending-only insert trigger, and an atomic verified-token RPC executable only by `service_role`. Creator status **must be active**, site published, magnet approved and belong to same creator; token is checked for expiry using DB time then erased upon consumption.

IMPORTANT: This is **not** a verified migration yet. The generated SQL has not been executed against a PostgreSQL test instance. Do not treat GitHub merge as authorization to execute it.

## Safety gates before execution
1. **Recoverable backup check:** confirm PITR/backup availability and restore process in the Supabase project; do not assume one is available on the current plan. If the restore procedure cannot be confirmed, DO NOT APPLY.
2. **Production review:** check dependency/privilege diff, SQL static tests, and security advisors. Inspect any pending maintenance / application writes.
3. **Explicit execution approval** for a precisely identified script/commit and project, separate from the earlier approval of the single-database strategy.
4. Apply exactly one transaction through an authorized SQL tool, never a bulk shell script whose target is ambiguous.
5. Independently verify, via read-only SQL, `pg_tables.rowsecurity`, `information_schema.role_table_grants`, `has_function_privilege` for anon/authenticated/service_role, table/trigger definitions and absence of policies for public roles.
6. Only then perform carefully scoped synthetic tests in the newly created table. **Never use real user PII as test fixtures.** For positive tests, the required existing creator and magnet data must be explicitly authorized for testing. Use a transaction that rolls back temporary synthetic test rows and never alter a real creator's publication or status.
7. Leave Cloudflare `RMP_CREATOR_PUBLIC_RELEASE` absent and do not configure any email/provider secrets or public routes.

## Rollback and recoverability
- If the DDL fails before `COMMIT`, PostgreSQL should roll back transactional changes.
- After commit, rollback is NOT automatically safe. Only if confirmed empty and not referenced by other tables: in a **separately approved** transaction, drop the token function, new trigger function (after the table trigger dependency is gone), and new inbox table. This is **destructive** if leads exist. Do not run a DROP command without checking record count and downstream references.
- If data has been accepted, preserve data, disable new writes and use a backup-tested forward migration instead. Never claim a reversible migration is lossless when data can exist.

## Still missing for functional B7
- Trusted atomic storage of newly issued SHA-256 token digests/expiry (not included in B8).
- Real D1 rate-limit binding and Turnstile verification in a release-gated route.
- Provider verified-domain email adapter, delivery after verified-consent, secure short-lived download grants, GDPR retention/DSAR and ShopShield.
- A single-page controlled test of creator A versus creator B, malformed tokens, replays, expired tokens and revoked approval.
- Explicit public-release approval under issue #28.

## Testing
The script contains a named unique constraint so the existing B6 server writer can classify only that PostgREST `23505` conflict as a duplicate, not a FK error. Security implementation tests are proposed as separate checks under `tests/creator-b8-db-proposal.test.mjs`. Static tests are not equivalent to real SQL execution.
