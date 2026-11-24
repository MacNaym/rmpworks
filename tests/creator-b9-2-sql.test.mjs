import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const base=readFileSync(new URL("../docs/creator-studio/2026-11-24-b9-1-outbox-SQL-PROPOSAL.sql",import.meta.url),"utf8");
const sql=readFileSync(new URL("../docs/creator-studio/2026-11-24-b9-2-dispatch-eligibility-SQL-PROPOSAL.sql",import.meta.url),"utf8");
test("B9.1 companion remains one complete table and three functions",()=>{
 assert.equal((base.match(/^CREATE TABLE public\.creator_confirmation_outbox/gm)||[]).length,1);
 assert.equal((base.match(/^CREATE FUNCTION public\./gm)||[]).length,3);
 assert.equal((base.match(/^AS \$fn\$$/gm)||[]).length,3);
 assert.equal((base.match(/^\$fn\$;$/gm)||[]).length,3);
 assert.ok(base.trimEnd().endsWith("TO service_role;"));
});
test("B9.1 claim RPC now returns provider idempotency decision explicitly",()=>{
 assert.match(base,/envelope_version integer,provider_idempotent boolean,lease_token uuid/);
 assert.match(base,/RETURNING o\.id,o\.event_id,o\.ciphertext,o\.iv,o\.key_id,\s+o\.envelope_version,o\.provider_idempotent,o\.lease_token/);
});
test("freshness RPC uses backend-only privileges and limited identity response",()=>{
 assert.match(sql,/CREATE FUNCTION public\.creator_can_dispatch_confirmation_mail\(/);
 assert.match(sql,/RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''/);
 assert.match(sql,/FROM PUBLIC,anon,authenticated/);
 assert.match(sql,/TO service_role/);
 assert.doesNotMatch(sql,/RETURNS TABLE/);
});
test("freshness RPC requires live lease, token, active creator and approved resource",()=>{
 assert.match(sql,/o\.status='leased' AND o\.lease_until>now\(\)/);
 assert.match(sql,/o\.expires_at>now\(\)/);
 assert.match(sql,/li\.verification_token_digest IS NOT NULL/);
 assert.match(sql,/li\.verification_expires_at>now\(\)/);
 assert.match(sql,/a\.status='active'/);
 assert.match(sql,/s\.published IS TRUE/);
 assert.match(sql,/m\.status='approved'/);
 assert.match(sql,/o\.lease_token=p_lease_token/);
});
test("no SQL proposal calls external providers or grants anon permissions",()=>{
 assert.doesNotMatch(sql,/GRANT EXECUTE[^;]+TO (anon|authenticated)/);
 assert.doesNotMatch(sql,/http_post|net\.http_post|pg_net|smtp_send/i);
});
