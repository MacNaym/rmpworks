-- RMP Works Creator Studio B6+B7 — reviewed PROPOSAL, NOT APPLIED.
-- Target ONLY rmpworks / mxgwdnnpkywzhldyyrue, after independent
-- production change approval, backup verification and read-only preflight.
-- Does not activate intake, mail, delivery or the Cloudflare release gate.
-- Requires PostgreSQL 15+; transactional DDL; no existing table altered.
BEGIN;
SET LOCAL lock_timeout='3s';
SET LOCAL statement_timeout='15s';

-- Refuse unexpected project/schema state; never silently overwrite a
-- partially installed/foreign table or conflicting RPC.
DO $preflight$
BEGIN
 IF to_regclass('public.creator_public_lead_inbox') IS NOT NULL THEN
   RAISE EXCEPTION 'B6+B7 fresh install expects inbox absent; review schema diff instead';
 END IF;
 IF to_regprocedure('public.creator_consume_email_token(text)') IS NOT NULL OR
    to_regprocedure('public.creator_issue_email_token(uuid,text)') IS NOT NULL OR
    to_regprocedure('public.creator_create_pending_lead_with_token(uuid,uuid,text,text,boolean,text,text,text)') IS NOT NULL THEN
   RAISE EXCEPTION 'Token RPC already exists: manual review required';
 END IF;
 IF to_regclass('public.creator_accounts') IS NULL OR
    to_regclass('public.creator_lead_magnets') IS NULL OR
    to_regclass('public.creator_site_snapshots') IS NULL THEN
   RAISE EXCEPTION 'Creator Studio dependencies are missing';
 END IF;
END;
$preflight$;

CREATE TABLE public.creator_public_lead_inbox (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 creator_account_id uuid NOT NULL REFERENCES public.creator_accounts(id) ON DELETE CASCADE,
 magnet_id uuid NOT NULL REFERENCES public.creator_lead_magnets(id) ON DELETE CASCADE,
 email text NOT NULL CHECK (
   char_length(email) BETWEEN 3 AND 254
   AND email=lower(email)
 ),
 full_name text NOT NULL DEFAULT '' CHECK (char_length(full_name) <= 120),
 marketing_opt_in boolean NOT NULL DEFAULT false,
 privacy_version text NOT NULL CHECK (char_length(privacy_version) BETWEEN 1 AND 64),
 delivery_consent_text text NOT NULL CHECK (char_length(delivery_consent_text) BETWEEN 10 AND 500),
 status text NOT NULL DEFAULT 'pending_verification'
   CHECK (status IN ('pending_verification','verified','processed','rejected','expired')),
 verification_token_digest text UNIQUE
   CHECK (verification_token_digest IS NULL OR verification_token_digest ~ '^[a-f0-9]{64}$'),
 verification_expires_at timestamptz,
 verified_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT creator_public_lead_token_expiry_pair
   CHECK ((verification_token_digest IS NULL) = (verification_expires_at IS NULL)),
 CONSTRAINT creator_public_lead_inbox_unique_lead
   UNIQUE (creator_account_id, magnet_id, email)
);
ALTER TABLE public.creator_public_lead_inbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.creator_public_lead_inbox FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.creator_public_lead_inbox TO service_role;
-- No anonymous/authenticated RLS policies exist; only server-controlled
-- service_role can access through PostgREST. No browser keys.

-- Defense in depth: even bypass-RLS service_role cannot INSERT an inbox
-- row against a suspended creator, unpublished site or unapproved magnet.
CREATE FUNCTION public.validate_creator_public_lead_inbox()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path=''
AS $fn$
BEGIN
 IF NEW.status <> 'pending_verification' OR
    NEW.verification_token_digest IS NOT NULL OR
    NEW.verification_expires_at IS NOT NULL OR
    NEW.verified_at IS NOT NULL THEN
   RAISE EXCEPTION 'Public lead must enter pending and unverified'
     USING ERRCODE='23514';
 END IF;
 IF NOT EXISTS (
   SELECT 1 FROM public.creator_accounts a
   JOIN public.creator_site_snapshots s ON s.creator_account_id=a.id
   JOIN public.creator_lead_magnets m ON m.creator_account_id=a.id
   WHERE a.id=NEW.creator_account_id
     AND a.status='active'
     AND s.published IS TRUE AND s.published_at IS NOT NULL
     AND m.id=NEW.magnet_id AND m.status='approved'
 ) THEN
   RAISE EXCEPTION 'Public lead intake not authorized'
     USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END;
$fn$;

REVOKE ALL ON FUNCTION public.validate_creator_public_lead_inbox()
  FROM PUBLIC, anon, authenticated;
CREATE TRIGGER check_creator_public_lead_inbox
 BEFORE INSERT ON public.creator_public_lead_inbox
 FOR EACH ROW EXECUTE FUNCTION public.validate_creator_public_lead_inbox();

-- Backend-only digest issuance for a pre-existing pending lead.
-- Prefer the one-shot creator_create_pending_lead_with_token RPC below for new leads.
CREATE FUNCTION public.creator_issue_email_token(p_lead_id uuid,p_digest text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $fn$
DECLARE updated_rows integer;
BEGIN
 IF p_lead_id IS NULL OR
    p_digest IS NULL OR p_digest !~ '^[a-f0-9]{64}$' THEN
   RETURN false;
 END IF;
 UPDATE public.creator_public_lead_inbox li
 SET verification_token_digest=p_digest,
     verification_expires_at=now() + interval '15 minutes',
     updated_at=now()
 WHERE li.id=p_lead_id
   AND li.status='pending_verification'
   AND li.verified_at IS NULL
   AND (li.verification_token_digest IS NULL OR li.verification_expires_at<=now())
   AND EXISTS (
     SELECT 1 FROM public.creator_accounts a
     JOIN public.creator_site_snapshots s ON s.creator_account_id=a.id
     JOIN public.creator_lead_magnets m ON m.creator_account_id=a.id
     WHERE a.id=li.creator_account_id
       AND a.status='active'
       AND s.published IS TRUE AND s.published_at IS NOT NULL
       AND m.id=li.magnet_id AND m.status='approved'
   );
 GET DIAGNOSTICS updated_rows=ROW_COUNT;
 RETURN updated_rows=1;
END;
$fn$;
REVOKE ALL ON FUNCTION public.creator_issue_email_token(uuid,text)
 FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.creator_issue_email_token(uuid,text) TO service_role;

-- Backend-only: atomic new lead INSERT and digest assignment.
-- Response is boolean, never returns lead ID or recipient details.
CREATE FUNCTION public.creator_create_pending_lead_with_token(
 p_creator_id uuid, p_magnet_id uuid, p_email text, p_full_name text,
 p_marketing_opt_in boolean, p_privacy_version text,
 p_delivery_consent_text text, p_digest text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $fn$
DECLARE v_lead_id uuid;
DECLARE v_updated integer;
BEGIN
 IF p_creator_id IS NULL OR p_magnet_id IS NULL OR
    p_email IS NULL OR p_email<>lower(btrim(p_email)) OR
    char_length(p_email) NOT BETWEEN 3 AND 254 OR
    p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR
    p_full_name IS NULL OR char_length(p_full_name) > 120 OR
    p_marketing_opt_in IS NULL OR
    p_privacy_version IS NULL OR char_length(p_privacy_version) NOT BETWEEN 1 AND 64 OR
    p_delivery_consent_text IS NULL OR char_length(p_delivery_consent_text) NOT BETWEEN 10 AND 500 OR
    p_digest IS NULL OR p_digest !~ '^[a-f0-9]{64}$' THEN
   RETURN false;
 END IF;
 INSERT INTO public.creator_public_lead_inbox(
   creator_account_id,magnet_id,email,full_name,marketing_opt_in,
   privacy_version,delivery_consent_text,status
 ) VALUES (
   p_creator_id,p_magnet_id,p_email,btrim(p_full_name),p_marketing_opt_in,
   p_privacy_version,p_delivery_consent_text,'pending_verification'
 )
 ON CONFLICT ON CONSTRAINT creator_public_lead_inbox_unique_lead DO NOTHING
 RETURNING id INTO v_lead_id;
 IF v_lead_id IS NULL THEN
   RETURN false;
 END IF;
 UPDATE public.creator_public_lead_inbox
 SET verification_token_digest=p_digest,
     verification_expires_at=now()+interval '15 minutes',
     updated_at=now()
 WHERE id=v_lead_id AND status='pending_verification'
   AND verification_token_digest IS NULL;
 GET DIAGNOSTICS v_updated=ROW_COUNT;
 IF v_updated<>1 THEN
   RAISE EXCEPTION 'Atomic lead challenge creation failed'
     USING ERRCODE='23514';
 END IF;
 RETURN true;
END;
$fn$;
REVOKE ALL ON FUNCTION public.creator_create_pending_lead_with_token(
 uuid,uuid,text,text,boolean,text,text,text
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.creator_create_pending_lead_with_token(
 uuid,uuid,text,text,boolean,text,text,text
) TO service_role;

-- Single-use redemption; must never be invoked from a GET route.
-- SECURITY DEFINER intentionally bypasses RLS and is executable ONLY by
-- service_role. Fully schema-qualified references and empty search_path.
CREATE FUNCTION public.creator_consume_email_token(p_digest text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path=''
AS $fn$
DECLARE updated_rows integer;
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
      SELECT 1 FROM public.creator_accounts a
      JOIN public.creator_site_snapshots s ON s.creator_account_id=a.id
      JOIN public.creator_lead_magnets m ON m.creator_account_id=a.id
      WHERE a.id=li.creator_account_id
        AND a.status='active'
        AND s.published IS TRUE AND s.published_at IS NOT NULL
        AND m.id=li.magnet_id AND m.status='approved'
   );
 GET DIAGNOSTICS updated_rows=ROW_COUNT;
 RETURN updated_rows=1;
END;
$fn$;
REVOKE ALL ON FUNCTION public.creator_consume_email_token(text)
 FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.creator_consume_email_token(text) TO service_role;

CREATE INDEX creator_public_lead_inbox_status_idx
 ON public.creator_public_lead_inbox(status,created_at);
CREATE INDEX creator_public_lead_inbox_creator_idx
 ON public.creator_public_lead_inbox(creator_account_id,created_at DESC);

COMMIT;
-- Migration rollback MUST be separately authorized: restoring this schema
-- after leads exist is NOT lossless. See companion rollback runbook.
