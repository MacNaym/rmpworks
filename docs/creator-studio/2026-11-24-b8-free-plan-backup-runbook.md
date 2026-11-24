# RMP Works — Supabase Free: manual backup gate (2026-11-24)

## Canonical infrastructure decision
All Supabase projects operated by RMP Works use **Free plans**. Supabase Multi was created to manage those accounts/projects without moving to paid plans. RMP Works stays on **one production Supabase database**, and a paid staging environment is deferred until meaningful traction.

Source: Supabase's official backup documentation, https://supabase.com/docs/guides/platform/backups — Free projects should export logical backups regularly with Supabase CLI; automatic daily backups are for Pro/Team/Enterprise.

**Database change gate is BLOCKED** until a manual, readable backup and a restore strategy are verified. This document does not authorize a migration.

## Safe manual procedure for Windows / PowerShell
1. Create a private backup folder **outside Git repos, Cloudflare Pages/public directories and synced public folders**. Apply restrictive NTFS permissions and use encrypted off-site storage for copies. Do not place database connection strings or passwords in script files, command history, or Git.
2. Check tools and exact installed syntax:
   ```powershell
   supabase --version
   supabase db dump --help
   docker version
   ```
   Supabase CLI v3 accepts explicit `--remote=<project_ref>`; older CLI supports `--linked` after an explicitly verified `supabase link --project-ref mxgwdnnpkywzhldyyrue`. **Do not blindly run a dump before confirming target and version.** Verify the command's `Target:` line points to `mxgwdnnpkywzhldyyrue`. In v3, `--db-url` and `--linked` still work but are deprecated; consult CLI help.
3. Create an archive folder with a timestamp in a private location, and save separate **schema**, **data**, and **role** exports, using the explicit confirmed target. The default `db dump` does *not* export data or custom roles. These exports have distinct `--data-only` and `--role-only` flags. Prefer `--use-copy` for data according to the official CLI guide. Check exit codes for every invocation.
4. Supabase CLI dumps intentionally omit managed schemas such as `auth` and `storage` unless a separately reviewed export method covers them. Database dumps also do not include actual objects stored via the Storage API. Inventory Auth users, Storage buckets and object files separately before asserting the archive can restore the whole product.
5. Verify all export files are nonempty, readable and have SHA-256 checksums. **A checksum alone proves integrity, not restorability.** A test restore to a local disposable PostgreSQL with compatible major version is recommended before approving production migrations. Never restore over the live RMP database as a test.
6. Store a second encrypted copy outside the local PC. Do not upload archives to the conversation, GitHub or unencrypted cloud storage, and never paste credentials/tokens in chat.
7. Once a verified recovery path is recorded, review and explicitly approve B8 SQL on the exact production project. Keep public release, mail and intake disabled.

## Current status
- Actual target: `rmpworks`, project ref `mxgwdnnpkywzhldyyrue` (production).
- Verified via read-only SQL: current PostgreSQL version 17.12, inbox/RPC absent; 1 creator account, 1 magnet, 0 snapshots.
- **No logical backup has been executed in this conversation**, no restore test has been performed, and no production database change has been applied.
- Do not infer a backup exists from Supabase Multi access or a successful DB connection.
