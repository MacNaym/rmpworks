-- B11 CONSOLIDATED MIGRATION CANDIDATE - NOT APPLIED TO ANY DATABASE.
-- ORIGINAL B8/B9.1/B9.2 SQL COMBINED WITHOUT CHANGING SQL LOGIC.
-- Apply ONLY to a disposable PostgreSQL database until authorized separately.
-- A backup is available, but restore tooling is being completed in Supabase Multi.

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

-- B11: companion definitions follow INSIDE the same transaction.


-- B9.1 -------------------------------------------------------------
-- B9.1 ADDITIVE SQL PROPOSAL ONLY. NEVER RUN BY ITSELF.
-- Append to the B8 consolidated fresh-install transaction BEFORE COMMIT.
-- Requires a verified recoverable Supabase Multi backup before execution.
-- Strictly backend-only: PUBLIC/anon/authenticated never receive rights.

CREATE TABLE public.creator_confirmation_outbox (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 lead_id uuid NOT NULL UNIQUE REFERENCES public.creator_public_lead_inbox(id) ON DELETE CASCADE,
 event_id text NOT NULL UNIQUE CHECK (event_id ~ '^[a-f0-9]{64}$'),
 ciphertext text NOT NULL CHECK (ciphertext='' OR (char_length(ciphertext) BETWEEN 24 AND 16384 AND ciphertext ~ '^[A-Za-z0-9_-]+$')),
 iv text NOT NULL CHECK (iv='' OR (char_length(iv)=16 AND iv ~ '^[A-Za-z0-9_-]{16}$')),
 key_id text NOT NULL CHECK (char_length(key_id) BETWEEN 1 AND 50 AND key_id ~ '^[A-Za-z0-9_-]+$'),
 envelope_version integer NOT NULL DEFAULT 1 CHECK(envelope_version=1),
 provider_idempotent boolean NOT NULL DEFAULT false,
 status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending','leased','sent','dead','needs_review')),
 attempts integer NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 4),
 expires_at timestamptz NOT NULL,
 next_attempt_at timestamptz NOT NULL DEFAULT now(),
 lease_token uuid,
 lease_until timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT creator_confirmation_outbox_lease_pair
 CHECK ((lease_token IS NULL)=(lease_until IS NULL)),
 CONSTRAINT creator_confirmation_outbox_payload_state
 CHECK ((status IN ('sent','dead') AND ciphertext='' AND iv='') OR
        (status IN ('pending','leased','needs_review') AND ciphertext<>'' AND iv<>''))
);
ALTER TABLE public.creator_confirmation_outbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.creator_confirmation_outbox FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.creator_confirmation_outbox TO service_role;
CREATE INDEX creator_confirmation_outbox_claim_idx
 ON public.creator_confirmation_outbox(next_attempt_at,created_at)
 WHERE status='pending';
CREATE INDEX creator_confirmation_outbox_leases_idx
 ON public.creator_confirmation_outbox(lease_until) WHERE status='leased';

-- Revoke older non-outbox intake and standalone issue paths so an active
-- backend cannot accidentally create stranded pending verification tokens.
REVOKE EXECUTE ON FUNCTION public.creator_create_pending_lead_with_token(
 uuid,uuid,text,text,boolean,text,text,text
) FROM service_role;
REVOKE EXECUTE ON FUNCTION public.creator_issue_email_token(uuid,text) FROM service_role;

-- New preferred creation RPC: lead, digest and sealed message appear in the
-- SAME PostgreSQL transaction. The caller generates event_id with 32 random
-- bytes, uses it as AES-GCM associated data, and stores ONLY the sealed data.
-- This function returns a boolean only, never lead ID or email existence.
CREATE FUNCTION public.creator_create_lead_with_outbox(
 p_creator_id uuid,p_magnet_id uuid,p_email text,p_full_name text,
 p_marketing_opt_in boolean,p_privacy_version text,
 p_delivery_consent_text text,p_digest text,
 p_event_id text,p_ciphertext text,p_iv text,p_key_id text,
 p_provider_idempotent boolean
)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $fn$
DECLARE v_lead_id uuid;
BEGIN
 IF p_creator_id IS NULL OR p_magnet_id IS NULL OR
    p_email IS NULL OR p_email<>lower(btrim(p_email)) OR
    char_length(p_email) NOT BETWEEN 3 AND 254 OR
    p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' OR
    p_full_name IS NULL OR char_length(p_full_name)>120 OR
    p_marketing_opt_in IS NULL OR p_provider_idempotent IS NULL OR
    p_privacy_version IS NULL OR char_length(p_privacy_version) NOT BETWEEN 1 AND 64 OR
    p_delivery_consent_text IS NULL OR char_length(p_delivery_consent_text) NOT BETWEEN 10 AND 500 OR
    p_digest IS NULL OR p_digest !~ '^[a-f0-9]{64}$' OR
    p_event_id IS NULL OR p_event_id !~ '^[a-f0-9]{64}$' OR
    p_iv IS NULL OR p_iv !~ '^[A-Za-z0-9_-]{16}$' OR
    p_key_id IS NULL OR char_length(p_key_id) NOT BETWEEN 1 AND 50 OR
    p_key_id !~ '^[A-Za-z0-9_-]+$' OR
    p_ciphertext IS NULL OR char_length(p_ciphertext) NOT BETWEEN 24 AND 16384 OR
    p_ciphertext !~ '^[A-Za-z0-9_-]+$' THEN
   RETURN false;
 END IF;

 INSERT INTO public.creator_public_lead_inbox(
   creator_account_id,magnet_id,email,full_name,marketing_opt_in,
   privacy_version,delivery_consent_text,status,
   verification_token_digest,verification_expires_at
 ) VALUES (
   p_creator_id,p_magnet_id,p_email,btrim(p_full_name),p_marketing_opt_in,
   p_privacy_version,p_delivery_consent_text,'pending_verification',
   NULL,NULL
 )
 ON CONFLICT ON CONSTRAINT creator_public_lead_inbox_unique_lead DO NOTHING
 RETURNING id INTO v_lead_id;
 IF v_lead_id IS NULL THEN RETURN false; END IF;

 UPDATE public.creator_public_lead_inbox
 SET verification_token_digest=p_digest,
     verification_expires_at=now()+interval '15 minutes',updated_at=now()
 WHERE id=v_lead_id AND verification_token_digest IS NULL;

 INSERT INTO public.creator_confirmation_outbox(
   lead_id,event_id,ciphertext,iv,key_id,provider_idempotent,expires_at
 ) VALUES (
   v_lead_id,p_event_id,p_ciphertext,p_iv,p_key_id,
   p_provider_idempotent,now()+interval '15 minutes'
 );
 RETURN true;
END;
$fn$;
REVOKE ALL ON FUNCTION public.creator_create_lead_with_outbox(
 uuid,uuid,text,text,boolean,text,text,text,text,text,text,text,boolean
) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.creator_create_lead_with_outbox(
 uuid,uuid,text,text,boolean,text,text,text,text,text,text,text,boolean
) TO service_role;

-- Crash recovery and deadline cleanup. A leased job that may have reached
-- the provider is *not automatically re-sent* without idempotency support.
-- A former lease token must NEVER be allowed to acknowledge a new lease.
CREATE FUNCTION public.creator_claim_confirmation_mail()
RETURNS TABLE(
 outbox_id uuid,event_id text,ciphertext text,iv text,key_id text,
 envelope_version integer,provider_idempotent boolean,lease_token uuid,attempts integer,expires_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $fn$
BEGIN
 -- Resolve potentially ambiguous abandoned attempts conservatively.
 UPDATE public.creator_confirmation_outbox o
 SET status=CASE
       WHEN o.provider_idempotent AND o.attempts<4 AND o.expires_at>now()
         THEN 'pending'
       ELSE 'needs_review' END,
     next_attempt_at=now(),lease_token=NULL,lease_until=NULL,updated_at=now()
 WHERE o.status='leased' AND o.lease_until<now();

 -- Never send verification messages whose token has expired, was consumed,
 -- or whose associated creator/resource is no longer eligible.
 UPDATE public.creator_confirmation_outbox o
 SET status='dead',ciphertext='',iv='',lease_token=NULL,lease_until=NULL,
     updated_at=now()
 FROM public.creator_public_lead_inbox li
 WHERE o.lead_id=li.id AND o.status='pending'
   AND (
     o.expires_at<=now() OR
     li.status<>'pending_verification' OR
     li.verification_token_digest IS NULL OR
     li.verification_expires_at<=now() OR
     NOT EXISTS (
       SELECT 1 FROM public.creator_accounts a
       JOIN public.creator_site_snapshots s ON s.creator_account_id=a.id
       JOIN public.creator_lead_magnets m ON m.creator_account_id=a.id
       WHERE a.id=li.creator_account_id AND a.status='active'
         AND s.published IS TRUE AND s.published_at IS NOT NULL
         AND m.id=li.magnet_id AND m.status='approved'
     )
   );

 RETURN QUERY
 WITH claimable AS (
  SELECT o.id FROM public.creator_confirmation_outbox o
  JOIN public.creator_public_lead_inbox li ON li.id=o.lead_id
  JOIN public.creator_accounts a ON a.id=li.creator_account_id
  JOIN public.creator_site_snapshots s ON s.creator_account_id=a.id
  JOIN public.creator_lead_magnets m
    ON m.creator_account_id=a.id AND m.id=li.magnet_id
  WHERE o.status='pending' AND o.attempts<4
    AND o.expires_at>now() AND o.next_attempt_at<=now()
    AND li.status='pending_verification'
    AND li.verification_token_digest IS NOT NULL
    AND li.verification_expires_at>now()
    AND a.status='active' AND s.published IS TRUE
    AND s.published_at IS NOT NULL AND m.status='approved'
  ORDER BY o.next_attempt_at,o.created_at
  FOR UPDATE OF o SKIP LOCKED
  LIMIT 1
 )
 UPDATE public.creator_confirmation_outbox o
 SET status='leased',attempts=o.attempts+1,
     lease_token=gen_random_uuid(),lease_until=now()+interval '60 seconds',
     updated_at=now()
 FROM claimable q
 WHERE o.id=q.id
 RETURNING o.id,o.event_id,o.ciphertext,o.iv,o.key_id,
           o.envelope_version,o.provider_idempotent,o.lease_token,o.attempts,o.expires_at;
END;
$fn$;
REVOKE ALL ON FUNCTION public.creator_claim_confirmation_mail()
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.creator_claim_confirmation_mail() TO service_role;

-- Acknowledge ONLY the matching live lease, and let the DB calculate retry
-- schedule. An ambiguous outcome is retryable only with provider idempotency.
-- Safe terminal states erase encrypted content (no reencryption needed).
CREATE FUNCTION public.creator_ack_confirmation_mail(
 p_outbox_id uuid,p_lease_token uuid,p_outcome text
)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $fn$
DECLARE v_o public.creator_confirmation_outbox%ROWTYPE;
DECLARE v_new_status text;
DECLARE v_next timestamptz;
BEGIN
 IF p_outbox_id IS NULL OR p_lease_token IS NULL OR
    p_outcome IS NULL OR
    p_outcome NOT IN ('accepted','retryable','permanent','ambiguous') THEN
   RETURN false;
 END IF;
 SELECT * INTO v_o FROM public.creator_confirmation_outbox o
 WHERE o.id=p_outbox_id AND o.lease_token=p_lease_token
   AND o.status='leased' AND o.lease_until>now()
 FOR UPDATE;
 IF NOT FOUND THEN RETURN false; END IF;

 IF p_outcome='accepted' THEN
   v_new_status:='sent';
 ELSIF p_outcome='permanent' OR v_o.attempts>=4 OR v_o.expires_at<=now() THEN
   v_new_status:='dead';
 ELSIF p_outcome='ambiguous' AND NOT v_o.provider_idempotent THEN
   v_new_status:='needs_review';
 ELSE
   v_next:=now()+(
     CASE v_o.attempts WHEN 1 THEN 30 WHEN 2 THEN 120 ELSE 300 END
   )*interval '1 second';
   IF v_next>=v_o.expires_at THEN
     v_new_status:='dead';v_next:=NULL;
   ELSE v_new_status:='pending'; END IF;
 END IF;

 UPDATE public.creator_confirmation_outbox
 SET status=v_new_status,next_attempt_at=coalesce(v_next,now()),
     lease_token=NULL,lease_until=NULL,updated_at=now(),
     ciphertext=CASE WHEN v_new_status IN ('sent','dead') THEN '' ELSE ciphertext END,
     iv=CASE WHEN v_new_status IN ('sent','dead') THEN '' ELSE iv END
 WHERE id=v_o.id;
 RETURN true;
END;
$fn$;
REVOKE ALL ON FUNCTION public.creator_ack_confirmation_mail(uuid,uuid,text)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.creator_ack_confirmation_mail(uuid,uuid,text)
 TO service_role;

-- B9.2 -------------------------------------------------------------
-- B9.2 companion SQL PROPOSAL ONLY: requires B8 + B9.1 schema.
-- NOT executable alone, NOT applied. Insert into the single reviewed transaction.
-- DB clock is authoritative. This is a freshness check, not an external send lock.
CREATE FUNCTION public.creator_can_dispatch_confirmation_mail(
 p_outbox_id uuid,p_lease_token uuid
)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $fn$
 SELECT EXISTS(
  SELECT 1 FROM public.creator_confirmation_outbox o
  JOIN public.creator_public_lead_inbox li ON li.id=o.lead_id
  JOIN public.creator_accounts a ON a.id=li.creator_account_id
  JOIN public.creator_site_snapshots s ON s.creator_account_id=a.id
  JOIN public.creator_lead_magnets m
    ON m.creator_account_id=a.id AND m.id=li.magnet_id
  WHERE o.id=p_outbox_id AND o.lease_token=p_lease_token
    AND o.status='leased' AND o.lease_until>now()
    AND o.expires_at>now()
    AND li.status='pending_verification'
    AND li.verification_token_digest IS NOT NULL
    AND li.verification_expires_at>now()
    AND a.status='active' AND s.published IS TRUE
    AND s.published_at IS NOT NULL AND m.status='approved'
 );
$fn$;
REVOKE ALL ON FUNCTION public.creator_can_dispatch_confirmation_mail(uuid,uuid)
 FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.creator_can_dispatch_confirmation_mail(uuid,uuid)
 TO service_role;

COMMIT;
