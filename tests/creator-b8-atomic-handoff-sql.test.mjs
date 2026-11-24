import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const sql=readFileSync(new URL("../docs/creator-studio/2026-11-24-b8-b6-b7-consolidated-PROPOSAL.sql",import.meta.url),"utf8");
const rpc=sql.slice(sql.indexOf("CREATE FUNCTION public.creator_create_pending_lead_with_token("),sql.indexOf("-- Single-use redemption"));

test("only one migration transaction and four complete SQL functions exist",()=>{
 assert.equal((sql.match(/^BEGIN;$/gm)||[]).length,1);
 assert.equal((sql.match(/^COMMIT;$/gm)||[]).length,1);
 assert.equal((sql.match(/^CREATE FUNCTION /gm)||[]).length,4);
 assert.equal((sql.match(/^\$fn\$;$/gm)||[]).length,4);
 assert.equal((sql.match(/^AS \$fn\$$/gm)||[]).length,4);
 assert.ok(sql.indexOf("COMMIT;")>sql.lastIndexOf("CREATE FUNCTION "));
});
test("atomic RPC does INSERT then digest assignment without returning contact identity",()=>{
 assert.match(rpc,/INSERT INTO public\.creator_public_lead_inbox\(/);
 assert.match(rpc,/ON CONFLICT ON CONSTRAINT creator_public_lead_inbox_unique_lead DO NOTHING/);
 assert.match(rpc,/RETURNING id INTO v_lead_id/);
 assert.match(rpc,/UPDATE public\.creator_public_lead_inbox/);
 assert.match(rpc,/verification_token_digest=p_digest/);
 assert.match(rpc,/verification_expires_at=now\(\)\+interval '15 minutes'/);
 assert.match(rpc,/RETURNS boolean/);
 assert.match(rpc,/RETURN true;/);
 assert.doesNotMatch(rpc,/RETURNS (?:uuid|jsonb|text)/);
});
test("atomic RPC validates recipient, digest and consent and enforces existing trigger",()=>{
 assert.match(rpc,/p_email<>lower\(btrim\(p_email\)\)/);
 assert.match(rpc,/p_email !~ '[^']+\$'/);
 assert.match(rpc,/p_digest !~ '\^\[a-f0-9\]\{64\}\$'/);
 assert.match(rpc,/p_delivery_consent_text IS NULL/);
 assert.match(sql,/CREATE TRIGGER check_creator_public_lead_inbox/);
 assert.match(sql,/a\.status='active'/);
 assert.match(sql,/m\.id=NEW\.magnet_id AND m\.status='approved'/);
});
test("atomic RPC has no public execution rights",()=>{
 assert.match(rpc,/SECURITY DEFINER\s+SET search_path=''/);
 assert.match(rpc,/REVOKE ALL ON FUNCTION public\.creator_create_pending_lead_with_token\([\s\S]*?\) FROM PUBLIC, anon, authenticated/);
 assert.match(rpc,/GRANT EXECUTE ON FUNCTION public\.creator_create_pending_lead_with_token\([\s\S]*?\) TO service_role/);
});
test("preflight prevents partial or existing RPC/table installations",()=>{
 assert.match(sql,/to_regclass\('public\.creator_public_lead_inbox'\) IS NOT NULL/);
 assert.match(sql,/to_regprocedure\('public\.creator_create_pending_lead_with_token\(uuid,uuid,text,text,boolean,text,text,text\)'\) IS NOT NULL/);
});
