# B11 — PostgreSQL isolated preflight without duplicate restore service

**Decision:** RMP Works DB backup has already been created. Restore functionality is being developed in the existing Supabase Multi plugin. We do not build a second restore mechanism and do not block further offline work on its completion. We do NOT deploy to production in B11.

## Scope

- Combines B8 fresh-install SQL, B9.1 outbox SQL, and B9.2 eligibility SQL under ONE BEGIN/COMMIT into `2026-11-24-b11-consolidated-migration-CANDIDATE.sql`. Source logic intentionally unchanged; all three original proposals remain available.
- Includes disposable baseline fixture for prerequisite creator accounts/site/magnets and database roles plus an assertion script for access grants/RLS, atomic lead + outbox creation, conflict dedupe, one-job claim, stale lease refusal, accepted ACK cleanup and token safety.
- Uses PostgreSQL 16.8 in Docker, with `--network none`, no published ports, no host volumes, and `--rm` cleanup. No Supabase connection, project ref, service key or production credentials are referenced.

## Run locally

From the RMP Works repository worktree root:

```powershell
node --check scripts/test-b11-postgres-isolated.mjs
node scripts/test-b11-postgres-isolated.mjs
```

Expected: three PASS lines and final `B11 ISOLATED POSTGRESQL PASS`. No PostgreSQL tests have been run by the assistant; only source/fixture files were prepared.

## What the first test does NOT prove

- The fixture has the minimal expected creator schema, NOT a copy of the actual RMP staging or production database. Its success does NOT prove migrations will succeed against the real schema.
- Does not test simultaneous PostgreSQL transactions / row contention, real service-role API/RLS behavior, integration with actual Supabase grants, rollback of data after migration or Cloudflare deployment.
- The SQL contains SECURITY DEFINER RPCs and must undergo explicit permission audit before any live execution.
- B8 uses fresh-install guard and aborts when the inbox already exists. Re-running in any persistent database requires schema-aware migration planning; do not override this guard.

## Next steps

1. Run isolated PostgreSQL smoke tests and fix any errors.
2. Read-only audit target RMP Supabase schema, compare actual creator dependencies, and extend parallel-worker/transaction tests.
3. If the SQL is safe for the target, prepare a production change plan with preflight, a verified backup location, transaction boundaries, and an explicit operator authorization. Supabase Multi will remain the *sole* backup/restore tool, without a duplicated subsystem.
4. Keep the public release flag and email dispatch disabled until end-to-end staged verification.

Nothing in this batch accesses or modifies production data.