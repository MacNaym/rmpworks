-- B7 PROPOSAL ONLY. Neither this file nor the B6 inbox SQL is applied.
-- Prerequisite: review and install the B6 creator_public_lead_inbox proposal on STAGING ONLY.
-- DO NOT apply on live rmpworks or without transactional migration/rollback review.
ALTER TABLE public.creator_public_lead_inbox
  ADD COLUMN IF NOT EXISTS verification_token_digest text,
  ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD CONSTRAINT creator_public_lead_token_digest_format
    CHECK (verification_token_digest IS NULL OR verification_token_digest ~ '^[a-f0-9]{64}$');
-- For actual migration ensure ADD CONSTRAINT is idempotent; this proposal is NOT a reusable migration.
CREATE UNIQUE INDEX IF NOT EXISTS creator_public_lead_verify_digest_unique
  ON public.creator_public_lead_inbox(verification_token_digest)
  WHERE verification_token_digest IS NOT NULL;

-- CONCEPTUAL ATOMIC CONSUMPTION, to be executed by vetted server-only DB
-- interface with database time (NOT user-supplied time) and no anon grants:
-- UPDATE public.creator_public_lead_inbox
-- SET status='verified', verified_at=now(),
--     verification_token_digest=NULL,
--     verification_expires_at=NULL, updated_at=now()
-- WHERE verification_token_digest=:sha256_hex
--   AND verification_expires_at>now()
--   AND status='pending_verification'
--   AND EXISTS(
--     SELECT 1 FROM public.creator_site_snapshots s
--     JOIN public.creator_lead_magnets m
--       ON m.creator_account_id=s.creator_account_id
--     WHERE s.creator_account_id=creator_public_lead_inbox.creator_account_id
--       AND s.published=true AND s.published_at IS NOT NULL
--       AND m.id=creator_public_lead_inbox.magnet_id AND m.status='approved')
-- RETURNING id,creator_account_id,magnet_id;
-- 1 row updated = verified, 0 rows = expired/invalid/already used.
-- Keep the token off any GET-triggered write path: require deliberate POST
-- with CSRF/replay controls to prevent link scanners consuming the token.
-- Retention/expiry cleanup must be designed and approved before production.
