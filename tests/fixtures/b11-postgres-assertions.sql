-- B11 isolated database checks. Production execution forbidden.
DO $check$
DECLARE
 v_ok boolean;
 v_row record;
 v_id uuid;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.creator_public_lead_inbox'::regclass AND relrowsecurity)
 OR NOT EXISTS(SELECT 1 FROM pg_class WHERE oid='public.creator_confirmation_outbox'::regclass AND relrowsecurity) THEN
  RAISE EXCEPTION 'RLS missing';
 END IF;
 IF has_table_privilege('anon','public.creator_public_lead_inbox','SELECT') OR
    has_table_privilege('authenticated','public.creator_confirmation_outbox','SELECT') OR
    has_function_privilege('anon','public.creator_create_lead_with_outbox(uuid,uuid,text,text,boolean,text,text,text,text,text,text,text,boolean)','EXECUTE') OR
    has_function_privilege('authenticated','public.creator_claim_confirmation_mail()','EXECUTE') OR
    has_function_privilege('anon','public.creator_can_dispatch_confirmation_mail(uuid,uuid)','EXECUTE') THEN
  RAISE EXCEPTION 'Public privileges must not exist';
 END IF;
 SELECT public.creator_create_lead_with_outbox(
   '11111111-1111-4111-8111-111111111111',
   '22222222-2222-4222-8222-222222222222',
   'lead@example.com','Smoke',false,'v1',
   'I consent to delivery of the requested resource',
   repeat('a',64),repeat('c',64),repeat('A',32),repeat('B',16),'key-v1',true
 ) INTO v_ok;
 IF NOT v_ok THEN RAISE EXCEPTION 'Atomic insert failed'; END IF;
 IF (SELECT count(*) FROM public.creator_public_lead_inbox)<>1 OR
    (SELECT count(*) FROM public.creator_confirmation_outbox)<>1 THEN
   RAISE EXCEPTION 'Lead and outbox not both created';
 END IF;
 SELECT public.creator_create_lead_with_outbox(
   '11111111-1111-4111-8111-111111111111',
   '22222222-2222-4222-8222-222222222222',
   'lead@example.com','Smoke',false,'v1',
   'I consent to delivery of the requested resource',
   repeat('b',64),repeat('d',64),repeat('A',32),repeat('B',16),'key-v1',true
 ) INTO v_ok;
 IF v_ok OR (SELECT count(*) FROM public.creator_confirmation_outbox)<>1 THEN
   RAISE EXCEPTION 'Duplicate lead not rejected';
 END IF;
 SELECT * INTO v_row FROM public.creator_claim_confirmation_mail();
 IF NOT FOUND THEN RAISE EXCEPTION 'No outbox claimed'; END IF;
 IF v_row.attempts<>1 OR NOT v_row.provider_idempotent THEN
   RAISE EXCEPTION 'Claim metadata invalid';
 END IF;
 IF NOT public.creator_can_dispatch_confirmation_mail(v_row.outbox_id,v_row.lease_token) THEN
   RAISE EXCEPTION 'Eligibility check failed';
 END IF;
 IF public.creator_can_dispatch_confirmation_mail(v_row.outbox_id,'33333333-3333-4333-8333-333333333333') THEN
   RAISE EXCEPTION 'Wrong lease accepted';
 END IF;
 IF public.creator_ack_confirmation_mail(v_row.outbox_id,'33333333-3333-4333-8333-333333333333','accepted') THEN
   RAISE EXCEPTION 'Stale lease ack accepted';
 END IF;
 IF NOT public.creator_ack_confirmation_mail(v_row.outbox_id,v_row.lease_token,'accepted') THEN
   RAISE EXCEPTION 'Valid lease ack rejected';
 END IF;
 IF (SELECT status FROM public.creator_confirmation_outbox WHERE id=v_row.outbox_id)<>'sent'
 OR (SELECT ciphertext FROM public.creator_confirmation_outbox WHERE id=v_row.outbox_id)<>'' THEN
   RAISE EXCEPTION 'Terminal encrypted payload not erased';
 END IF;
 IF public.creator_consume_email_token(repeat('b',64)) THEN
   RAISE EXCEPTION 'Unexpected token digest consumed';
 END IF;
 RAISE NOTICE 'B11 isolated schema, RLS, atomic creation, dedupe, lease and ACK checks PASS';
END;
$check$;
