import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync(new URL("../docs/creator-studio/2026-11-24-b9-1-outbox-SQL-PROPOSAL.sql",import.meta.url),"utf8");
test("outbox is private and service-role only",()=>{
 assert.match(sql,/ALTER TABLE public\.creator_confirmation_outbox ENABLE ROW LEVEL SECURITY/);
 assert.match(sql,/REVOKE ALL ON TABLE public\.creator_confirmation_outbox FROM PUBLIC,anon,authenticated/);
 assert.match(sql,/GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public\.creator_confirmation_outbox TO service_role/);
 assert.doesNotMatch(sql,/CREATE POLICY /);
});
test("old two-phase token issue and intake are disabled for service-role",()=>{
 assert.match(sql,/REVOKE EXECUTE ON FUNCTION public\.creator_create_pending_lead_with_token\(/);
 assert.match(sql,/REVOKE EXECUTE ON FUNCTION public\.creator_issue_email_token\(uuid,text\) FROM service_role/);
});
test("outbox payload is encrypted, unique per lead, and state-constrained",()=>{
 assert.match(sql,/lead_id uuid NOT NULL UNIQUE REFERENCES public\.creator_public_lead_inbox\(id\) ON DELETE CASCADE/);
 assert.match(sql,/event_id text NOT NULL UNIQUE/);
 assert.match(sql,/CONSTRAINT creator_confirmation_outbox_payload_state/);
 assert.match(sql,/status IN \('sent','dead'\) AND ciphertext='' AND iv=''/);
});
test("single database function writes lead token digest and encrypted message",()=>{
 const part=sql.slice(sql.indexOf("CREATE FUNCTION public.creator_create_lead_with_outbox("),sql.indexOf("CREATE FUNCTION public.creator_claim_confirmation_mail()"));
 assert.match(part,/INSERT INTO public\.creator_public_lead_inbox\(/);
 assert.match(part,/UPDATE public\.creator_public_lead_inbox/);
 assert.match(part,/INSERT INTO public\.creator_confirmation_outbox\(/);
 assert.match(part,/RETURN true;/);
 assert.match(part,/p_digest !~ '\^\[a-f0-9\]\{64\}\$'/);
 assert.match(part,/GRANT EXECUTE ON FUNCTION public\.creator_create_lead_with_outbox\([\s\S]*?\) TO service_role/);
});
test("claim uses row locks and lease tokens and does not retry ambiguous requests blindly",()=>{
 const part=sql.slice(sql.indexOf("CREATE FUNCTION public.creator_claim_confirmation_mail()"),sql.indexOf("CREATE FUNCTION public.creator_ack_confirmation_mail("));
 assert.match(part,/FOR UPDATE OF o SKIP LOCKED/);
 assert.match(part,/lease_token=gen_random_uuid\(\)/);
 assert.match(part,/lease_until=now\(\)\+interval '60 seconds'/);
 assert.match(part,/o\.provider_idempotent AND o\.attempts<4/);
 assert.match(part,/ELSE 'needs_review' END/);
});
test("claim filters expired and revoked resources at DB time",()=>{
 assert.match(sql,/li\.verification_expires_at>now\(\)/);
 assert.match(sql,/a\.status='active'/);
 assert.match(sql,/s\.published IS TRUE/);
 assert.match(sql,/m\.status='approved'/);
 assert.match(sql,/o\.expires_at>now\(\)/);
});
test("ack rejects stale leases and only retries bounded attempts",()=>{
 const part=sql.slice(sql.indexOf("CREATE FUNCTION public.creator_ack_confirmation_mail("));
 assert.match(part,/o\.lease_token=p_lease_token/);
 assert.match(part,/o\.lease_until>now\(\)/);
 assert.match(part,/FOR UPDATE/);
 assert.match(part,/v_o\.attempts>=4/);
 assert.match(part,/p_outcome='ambiguous' AND NOT v_o\.provider_idempotent/);
 assert.match(part,/WHEN 1 THEN 30 WHEN 2 THEN 120 ELSE 300 END/);
});
test("all new privileged functions revoke PUBLIC roles",()=>{
 for(const signature of ["creator_create_lead_with_outbox","creator_claim_confirmation_mail","creator_ack_confirmation_mail"]){
  const location=sql.indexOf("CREATE FUNCTION public."+signature);
  assert.ok(location>=0);
  const next=sql.indexOf("CREATE FUNCTION public.",location+1);
  const part=sql.slice(location,next<0?undefined:next);
  assert.match(part,/SECURITY DEFINER SET search_path=''/);
  assert.match(part,/FROM PUBLIC,anon,authenticated/);
  assert.match(part,/TO service_role/);
 }
});

test("SQL has one table, exactly three functions and no trailing duplicated payload",()=>{
 assert.equal((sql.match(/^CREATE TABLE public\.creator_confirmation_outbox/gm)||[]).length,1);
 assert.equal((sql.match(/^CREATE FUNCTION public\./gm)||[]).length,3);
 assert.equal((sql.match(/^AS \$fn\$$/gm)||[]).length,3);
 assert.equal((sql.match(/^\$fn\$;$/gm)||[]).length,3);
 assert.equal((sql.match(/^ALTER TABLE public\.creator_confirmation_outbox/gm)||[]).length,1);
 assert.match(sql,/ciphertext ~ '\^\[A-Za-z0-9_-\]\+\$'/);
 assert.match(sql,/iv ~ '\^\[A-Za-z0-9_-\]\{16\}\$'/);
 assert.ok(sql.trimEnd().endsWith("TO service_role;"));
});
