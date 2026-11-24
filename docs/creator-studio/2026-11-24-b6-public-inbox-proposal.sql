-- B6 proposal. REVIEW ONLY: do NOT apply to rmpworks production.
-- Separate pending inbox: anonymous visitors NEVER get table privileges.
-- The privileged server writer is only invoked AFTER release/anti-abuse checks.
CREATE TABLE IF NOT EXISTS public.creator_public_lead_inbox (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 creator_account_id uuid NOT NULL REFERENCES public.creator_accounts(id) ON DELETE CASCADE,
 magnet_id uuid NOT NULL REFERENCES public.creator_lead_magnets(id) ON DELETE CASCADE,
 email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 254 AND email = lower(email)),
 full_name text NOT NULL DEFAULT '' CHECK (char_length(full_name) <= 120),
 marketing_opt_in boolean NOT NULL DEFAULT false,
 privacy_version text NOT NULL CHECK (char_length(privacy_version) BETWEEN 1 AND 64),
 delivery_consent_text text NOT NULL CHECK (char_length(delivery_consent_text) BETWEEN 10 AND 500),
 status text NOT NULL DEFAULT 'pending_verification'
   CHECK (status IN ('pending_verification','verified','processed','rejected','expired')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (creator_account_id, magnet_id, email)
);
ALTER TABLE public.creator_public_lead_inbox ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.creator_public_lead_inbox FROM PUBLIC, anon, authenticated;
-- No policy for anon/authenticated; no direct client SELECT/INSERT/UPDATE/DELETE.
-- service_role is a privileged backend-only identity, NEVER a browser key.
-- Defense-in-depth even when service_role bypasses RLS: trigger checks
-- approved magnet ownership and published snapshot at transaction time.
CREATE OR REPLACE FUNCTION public.validate_creator_public_lead_inbox()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
 IF NOT EXISTS (
  SELECT 1
  FROM public.creator_site_snapshots s
  JOIN public.creator_lead_magnets m ON m.creator_account_id = s.creator_account_id
  WHERE s.creator_account_id = NEW.creator_account_id
    AND s.published IS TRUE AND s.published_at IS NOT NULL
    AND m.id = NEW.magnet_id AND m.status = 'approved'
 ) THEN
   RAISE EXCEPTION 'Public lead intake not authorized' USING ERRCODE = '23514';
 END IF;
 IF NEW.status <> 'pending_verification' THEN
   RAISE EXCEPTION 'Public lead cannot skip verification' USING ERRCODE = '23514';
 END IF;
 RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.validate_creator_public_lead_inbox() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS check_creator_public_lead_inbox ON public.creator_public_lead_inbox;
CREATE TRIGGER check_creator_public_lead_inbox
 BEFORE INSERT ON public.creator_public_lead_inbox
 FOR EACH ROW EXECUTE FUNCTION public.validate_creator_public_lead_inbox();
CREATE INDEX IF NOT EXISTS creator_public_lead_inbox_status_idx
 ON public.creator_public_lead_inbox(status,created_at);
-- Future tasks: server-verified email delivery, CRM promotion, retention/DSAR,
-- scoped account/service identity and policy audit.
