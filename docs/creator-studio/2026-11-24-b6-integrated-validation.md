# B6 integration validation branch — offline harness, NO deployment

Branch `feature/b6-integration-validation-20261124` combines PRs #45, #46, #47 and #48 *without merging or activating them*. It adds an integration-style test harness using fakes for external dependencies.

## Validation matrix
- Release denied: zero rate-limit, CAPTCHA, or database side effects.
- Valid request: atomic D1 rate control → Cloudflare Turnstile verification → Supabase pending inbox write.
- Bad CAPTCHA: no inbox write.
- Rate exhausted: no CAPTCHA or inbox write.
- Storage errors: no success reported.
- Static schema guard: inbox RLS, revoked public grants, INSERT trigger, tenant/magnet verification.

Run offline with Node 22+:
```powershell
node --experimental-strip-types --test tests/creator-turnstile.test.mjs tests/creator-rate-limit.test.mjs tests/public-lead-pipeline.test.mjs tests/public-lead-inbox.test.mjs tests/creator-b6-integration.test.mjs
```

Expected number of cases: 5 + 6 + 6 + 5 + 7 = 29. **Tests are written, not yet executed on the Captain's PC or against actual D1/Supabase.** A passed mocked integration test does NOT prove real SQL transaction isolation or that exposed endpoints are safe.

## Release blockers
1. No Cloudflare Pages public POST route exists. None should be created during this pass.
2. SQL proposal must undergo staged migration/restore testing, privilege review and negative RLS tests on the *correct* Supabase target. Production remains unchanged.
3. D1 migration/secret and Turnstile secret remain unconfigured; needs deployed staging-only dry run.
4. Do not expose service-role secret, even through source maps, browser flags or logging. Prefer narrowly scoped backend interface.
5. Server-approved magnet and tenant lookup must be from trusted storage, not accepted IDs supplied by public form. Owner approval workflow pending.
6. Consent purpose, policy version, unsubscribe/retention/DSAR and ShopShield validation pending.
7. Confirmation email, token expiry/replay and lead magnet delivery are B7.
8. Public release issue #28 remains closed until explicit Captain approval.

## Proposed merge sequence
After successful local tests and security review, merge the smaller PRs (#45, #46, #47, #48) in dependency order. **Do not merge this validation branch** afterwards if that would duplicate files; keep it as a test harness branch or selectively port `tests/creator-b6-integration.test.mjs` to main. No auto-merge.

## Review note — HTTP 409 hardening
PostgREST uses HTTP 409 for both uniqueness (23505) and foreign-key failures (23503). PR #48 now names the triple uniqueness constraint and only recognizes the named 23505 duplicate; every other 409 fails closed. The integration harness exercises a 23503 response. This is a code review/test preparation step; neither mocks nor static regex tests prove that the SQL works on actual staging.

## Verification record — 24 Nov 2026
Using the GitHub connector, all five committed `.mjs` test source files were retrieved and parsed in a JavaScript syntax-only check (the `import` statements were removed; `import.meta` was substituted in the one module where it appears). **Syntax: PASS for 5/5 files. Test execution: NOT RUN.** The isolated runtime cannot reach this private GitHub repository, so it cannot run the actual committed suite. Do not treat this syntax check as a test pass. A true Node run on a checked-out branch is still required.
