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
