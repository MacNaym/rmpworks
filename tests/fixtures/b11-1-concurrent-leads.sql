-- B11.1 isolated concurrency fixture: two eligible leads and pending outbox rows.
-- UUIDs, emails, digests, event IDs and ciphertext are synthetic.
DO $test$
DECLARE v boolean;
BEGIN
 SELECT public.creator_create_lead_with_outbox(
  '11111111-1111-4111-8111-111111111111'::uuid,
  '22222222-2222-4222-8222-222222222222'::uuid,
  'worker-a@example.com','Parallel A',false,'v1',
  'I consent to delivery of the requested resource',
  repeat('a',64),repeat('1',64),repeat('A',32),repeat('B',16),'key-v1',true
 ) INTO v;
 IF v IS DISTINCT FROM true THEN RAISE EXCEPTION 'worker A creation failed'; END IF;
 SELECT public.creator_create_lead_with_outbox(
  '11111111-1111-4111-8111-111111111111'::uuid,
  '22222222-2222-4222-8222-222222222222'::uuid,
  'worker-b@example.com','Parallel B',false,'v1',
  'I consent to delivery of the requested resource',
  repeat('b',64),repeat('2',64),repeat('A',32),repeat('B',16),'key-v1',true
 ) INTO v;
 IF v IS DISTINCT FROM true THEN RAISE EXCEPTION 'worker B creation failed'; END IF;
END;
$test$;
