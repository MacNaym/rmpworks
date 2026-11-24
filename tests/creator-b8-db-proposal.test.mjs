import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sql=readFileSync(new URL("../docs/creator-studio/2026-11-24-b8-b6-b7-consolidated-PROPOSAL.sql",import.meta.url),"utf8");
test("migration has a single transactional boundary and refuses existing install",()=>{
 assert.match(sql,/^BEGIN;/m);
 assert.match(sql,/^COMMIT;/m);
 assert.match(sql,/to_regclass\('public\.creator_public_lead_inbox'\) IS NOT NULL/);
 assert.match(sql,/to_regprocedure\('public\.creator_consume_email_token\(text\)'\) IS NOT NULL/);
});
test("new inbox is RLS protected, with no public table access",()=>{
 assert.match(sql,/ALTER TABLE public\.creator_public_lead_inbox ENABLE ROW LEVEL SECURITY/);
 assert.match(sql,/REVOKE ALL ON TABLE public\.creator_public_lead_inbox FROM PUBLIC, anon, authenticated/);
 assert.match(sql,/GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public\.creator_public_lead_inbox TO service_role/);
 assert.doesNotMatch(sql,/CREATE POLICY\s+/i);
});
test("only an active creator with published site and approved own magnet can insert",()=>{
 assert.match(sql,/a\.status='active'/);
 assert.match(sql,/s\.published IS TRUE AND s\.published_at IS NOT NULL/);
 assert.match(sql,/m\.id=NEW\.magnet_id AND m\.status='approved'/);
 assert.match(sql,/m\.creator_account_id=a\.id/);
 assert.match(sql,/NEW\.status <> 'pending_verification'/);
});
test("exact composite duplicate constraint matches B6 writer",()=>{
 assert.match(sql,/CONSTRAINT creator_public_lead_inbox_unique_lead/);
 assert.match(sql,/UNIQUE \(creator_account_id, magnet_id, email\)/);
});
test("token can only be consumed once, before expiry using DB time",()=>{
 assert.match(sql,/li\.verification_expires_at>now\(\)/);
 assert.match(sql,/li\.status='pending_verification'/);
 assert.match(sql,/verification_token_digest=NULL/);
 assert.match(sql,/GET DIAGNOSTICS updated_rows=ROW_COUNT/);
 assert.match(sql,/RETURN updated_rows=1/);
});
test("RPC is restricted to backend role with hardened search path",()=>{
 assert.match(sql,/SECURITY DEFINER\s+SET search_path=''/);
 assert.match(sql,/REVOKE ALL ON FUNCTION public\.creator_consume_email_token\(text\)\s+FROM PUBLIC, anon, authenticated/);
 assert.match(sql,/GRANT EXECUTE ON FUNCTION public\.creator_consume_email_token\(text\) TO service_role/);
});
test("migration does not modify existing creator tables or grant anonymous write",()=>{
 assert.doesNotMatch(sql,/ALTER TABLE public\.(creator_accounts|creator_lead_magnets|creator_site_snapshots)/i);
 assert.doesNotMatch(sql,/GRANT (?:INSERT|UPDATE|DELETE|ALL).*\bTO\s+(?:anon|authenticated)\b/i);
 assert.doesNotMatch(sql,/\bDROP TABLE\b/i);
});

test("token issuance is backend-only and prevents replacing live challenges",()=>{
 assert.match(sql,/CREATE FUNCTION public\.creator_issue_email_token\(p_lead_id uuid,p_digest text\)/);
 assert.match(sql,/li\.status='pending_verification'/);
 assert.match(sql,/li\.verified_at IS NULL/);
 assert.match(sql,/li\.verification_token_digest IS NULL OR li\.verification_expires_at<=now\(\)/);
 assert.match(sql,/verification_expires_at=now\(\) \+ interval '15 minutes'/);
 assert.match(sql,/REVOKE ALL ON FUNCTION public\.creator_issue_email_token\(uuid,text\)\s+FROM PUBLIC, anon, authenticated/);
 assert.match(sql,/GRANT EXECUTE ON FUNCTION public\.creator_issue_email_token\(uuid,text\) TO service_role/);
});
