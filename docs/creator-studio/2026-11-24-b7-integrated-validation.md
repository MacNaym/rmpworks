# B7 — Integrated offline validation branch

This branch combines the *unmerged* code from PR #51 (one-time email verification token contract) and PR #52 (disabled mail transport and private approved resource renderer).

**No HTTP route, email provider, database migration, email sending, public download or release activation.** Source PRs #51 and #52 remain drafts.

Run on isolated worktree with Node 22+:
```powershell
node --experimental-strip-types --test tests/creator-email-verification.test.mjs tests/creator-confirmation-mail.test.mjs tests/creator-resource-delivery.test.mjs
```
Expected: **18 offline cases**, 7 email token cases + 6 mail-template/transport cases + 5 resource rendering cases. Tests have not been run on the user's PC or real services.

After offline tests pass: code review and merge two source PRs individually, port cross-component tests if needed, close composite validation PR without merging.

Still mandatory before real B7 release:
- An independent staging Supabase database with B6 inbox and B7 token migrations validated atomically.
- Trusted backend storage and exactly-once token consumption.
- Transactional email provider and delivery account details verified, rate limits, bounces and idempotency.
- Host validation, release controls, tenant A/B isolation, grants revoked after expiry, private download tests.
- ShopShield and privacy review; explicit release authorization under issue #28.
