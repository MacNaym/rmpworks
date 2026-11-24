-- B7 STAGING PROPOSAL ONLY -- DO NOT RUN ON RMP PRODUCTION.
-- Precondition: install/review the B6 creator_public_lead_inbox proposal first.
-- All writes in a transaction. Run against a dedicated RMP staging database.
BEGIN;

ALTER TABLE public.creator_public_lead_inbox
  ADD COLUMN IF NOT EXISTS verification_token_digest text,
  ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

DO $b7$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname='creator_public_lead_token_digest_format'
      AND conrelid='public.creator_public_lead_inbox'::regclass
  ) THEN
    ALTER TABLE public.creator_public_lead_inbox
      ADD CONSTRAINT creator_public_lead_token_digest_format
      CHECK (
        verification_token_digest IS NULL OR
        verification_token_digest ~ '^[a-f0-9]{64}$'
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname='creator_public_lead_token_expiry_pair'
      AND conrelid='public.creator_public_lead_inbox'::regclass
  ) THEN
    ALTER TABLE public.creator_public_lead_inbox
      ADD CONSTRAINT creator_public_lead_token_expiry_pair
      CHECK ((verification_token_digest IS NULL) = (verification_expires_at IS NULL));
  END IF;
END;
$b7$;

CREATE UNIQUE INDEX IF NOT EXISTS creator_public_lead_verify_digest_unique
  ON public.creator_public_lead_inbox(verification_token_digest)
  WHERE verification_token_digest IS NOT NULL;

-- Harden the pending-only insertion trigger from B6:
-- production function must not be invoked from client via RPC.
REVOKE ALL ON TABLE public.creator_public_lead_inbox FROM PUBLIC, anon, authenticated;
ALTER TABLE public.creator_public_lead_inbox ENABLE ROW LEVEL SECURITY;

-- One atomic UPDATE. The privileged backend is the ONLY intended caller:
-- a) digest must be exactly valid format
-- b) token unused and unexpired based on DB clock, not browser clock
-- c) matching published creator and currently approved resource
-- d) updates one row or none; clears digest, preventing replay
-- e) does NOT expose personal data or public lead existence
CREATE OR REPLACE FUNCTION public.creator_consume_email_token(p_digest text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  updated_rows integer;
BEGIN
  IF p_digest IS NULL OR p_digest !~ '^[a-f0-9]{64}$' THEN
    RETURN false;
  END IF;
  UPDATE public.creator_public_lead_inbox li
  SET status='verified',
      verified_at=now(),
      verification_token_digest=NULL,
      verification_expires_at=NULL,
      updated_at=now()
  WHERE li.verification_token_digest=p_digest
    AND li.verification_expires_at>now()
    AND li.status='pending_verification'
    AND EXISTS (
      SELECT 1
      FROM public.creator_site_snapshots s
      JOIN public.creator_lead_magnets m
        ON m.creator_account_id=s.creator_account_id
      WHERE s.creator_account_id=li.creator_account_id
        AND s.published IS TRUE
        AND s.published_at IS NOT NULL
        AND m.id=li.magnet_id
        AND m.status='approved'
    );
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows=1;
END;
$$;

-- PostgreSQL grants EXECUTE on new functions to PUBLIC by default.
-- Explicitly revoke PUBLIC, anon and authenticated after CREATE OR REPLACE.
REVOKE ALL ON FUNCTION public.creator_consume_email_token(text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.creator_consume_email_token(text) TO service_role;

COMMIT;

-- Separate staging-only assertions needed before merging into any deployment:
-- SELECT has_function_privilege('anon','public.creator_consume_email_token(text)','EXECUTE') = false;
-- SELECT has_function_privilege('authenticated','public.creator_consume_email_token(text)','EXECUTE') = false;
-- SELECT has_function_privilege('service_role','public.creator_consume_email_token(text)','EXECUTE') = true;
-- SELECT public.creator_consume_email_token(repeat('a',64)) = false;
-- Test: valid token, second use, expired, unpublished, cross-tenant magnet.
-- NOTE: Creation/rotation of digests and safe email delivery requires a
-- separately reviewed transactional issue method; this SQL is consume-only.
