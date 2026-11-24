# B11.1 — PostgreSQL concurrency and production read-only schema audit

## Scope

B11 successfully applied its consolidated SQL and ran the synthetic fixture in an isolated local PostgreSQL 16.8 Docker container. B11.1 extends validation for simultaneous transactions by using **two independent psql connections**: one holds a row lock on the first pending outbox job while the other calls `creator_claim_confirmation_mail()`. The worker must claim the *second* job via `FOR UPDATE SKIP LOCKED`, then, after the lock is released, claim the first. It must never re-claim either leased job.

Run from the temporary B11.1 worktree:

```powershell
node --check scripts/test-b11-1-postgres-concurrency.mjs
node scripts/test-b11-1-postgres-concurrency.mjs
```

Docker uses `postgres:16.8`, `--network none`, no host ports, no host volumes, and auto-removal. Test uses synthetic creator/lead addresses and has no Supabase service key. **Tests are prepared but not executed yet.**

## Live Supabase read-only audit: blocked by access, not by migration

Target established from project configuration: `mxgwdnnpkywzhldyyrue`, RMP Works. Attempted `Supabase_Multi.resolve_project(project_ref)` and `Supabase_Multi.list_projects()`, but both returned connector execution errors. An independent `Supabase.list_projects()` returned four projects from another account and **did not list the RMP project**. Do not guess another Supabase target or substitute staging of a different product. No read-only SQL query has been executed against RMP.

Before migration to production, on the exact RMP project inspect read-only:
- `pg_class` / `pg_namespace`: presence and RLS state of `public.creator_accounts`, `creator_site_snapshots`, `creator_lead_magnets`, `creator_public_lead_inbox`, `creator_confirmation_outbox`.
- `information_schema.columns`: column types and `creator_accounts.status`, `creator_site_snapshots.published`/`published_at`, `creator_lead_magnets.status`, key foreign keys.
- `pg_proc` and `pg_get_function_identity_arguments`: conflicting preexisting creator token/outbox RPC signatures.
- `pg_roles`, `pg_class.relacl`, `pg_proc.proacl`, `pg_policies`: realistic service_role and anonymous access; check Supabase Data API exposure.
- Dependency compatibility: ensure site publication and magnet approval use exactly the status values assumed in the candidate SQL.

These steps are read-only. An isolated fixture passing cannot establish compatibility with the real deployed creator schema. No migration, backup restoration, DNS, Cloudflare settings, or public email workflow was changed.

## Operational decision

One backup/restore process only: **Supabase Multi**. The user elected to continue other testing while restore functionality is being developed there, not to implement a second recovery mechanism. Keep SQL deployment as a separate explicitly authorized change.

