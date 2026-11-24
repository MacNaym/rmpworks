# B7 — Integrated offline validation branch

This branch combines the *unmerged* code from PR #51 (one-time email verification token contract) and PR #52 (disabled mail transport and private approved resource renderer).

**No HTTP route, email provider, database migration, email sending, public download or release activation.** Source PRs #51 and #52 remain drafts.

Run on isolated worktree with Node 22+:
```powershell
node --experimental-strip-types --test tests/creator-email-verification.test.mjs tests/creator-confirmation-mail.test.mjs tests/creator-resource-delivery.test.mjs
```
Expected: **18 offline cases**, 7 email token cases + 6 mail-template/transport cases + 5 resource rendering cases. Captain executed 18/18 offline tests successfully on 24 November 2026. Real services have not been tested.

Source PRs #51 and #52 were merged individually after 18/18 offline tests. Composite #53 will be closed without merge.

Still mandatory before real B7 release:
- An independent staging Supabase database with B6 inbox and B7 token migrations validated atomically.
- Trusted backend storage and exactly-once token consumption.
- Transactional email provider and delivery account details verified, rate limits, bounces and idempotency.
- Host validation, release controls, tenant A/B isolation, grants revoked after expiry, private download tests.
- ShopShield and privacy review; explicit release authorization under issue #28.
