import test from "node:test";
import assert from "node:assert/strict";
import {persistEmailChallenge} from "../functions/_lib/creator-token-issuer.ts";
const leadId="123e4567-e89b-42d3-a456-426614174000";
const tokenDigest="a".repeat(64);
const env={supabaseUrl:"https://example-project.supabase.co",serverSecret:"unit-test-only-very-long-server-secret-1234567890",intakeAuthorized:true};
test("issuance disabled means no database request",async()=>{
 let calls=0;
 const result=await persistEmailChallenge({...env,intakeAuthorized:false},leadId,tokenDigest,async()=>{calls++;return Response.json(true)});
 assert.equal(result,"closed");assert.equal(calls,0);
});
test("rejects invalid lead identifiers and digest before database",async()=>{
 let calls=0;const f=async()=>{calls++;return Response.json(true)};
 for(const [id,digest] of [["x",tokenDigest],[leadId,"bad"],[null,tokenDigest],[leadId,null]]){
  assert.equal(await persistEmailChallenge(env,id,digest,f),"closed");
 }
 assert.equal(calls,0);
});
test("missing server key and unexpected host fail closed",async()=>{
 let calls=0;const f=async()=>{calls++;return Response.json(true)};
 assert.equal(await persistEmailChallenge({...env,serverSecret:undefined},leadId,tokenDigest,f),"unavailable");
 assert.equal(await persistEmailChallenge({...env,supabaseUrl:"https://attacker.invalid"},leadId,tokenDigest,f),"unavailable");
 assert.equal(calls,0);
});
test("server sends only row id and digest; success requires boolean true",async()=>{
 let calls=0;
 const result=await persistEmailChallenge(env,leadId,tokenDigest,async(url,options)=>{
  calls++;
  assert.equal(url,"https://example-project.supabase.co/rest/v1/rpc/creator_issue_email_token");
  assert.equal(options.method,"POST");
  assert.equal(options.headers.authorization,"Bearer "+env.serverSecret);
  assert.deepEqual(JSON.parse(options.body),{p_lead_id:leadId,p_digest:tokenDigest});
  return Response.json(true);
 });
 assert.equal(result,"stored");assert.equal(calls,1);
});
test("reissued challenge refusal, network error and invalid response never count as stored",async()=>{
 assert.equal(await persistEmailChallenge(env,leadId,tokenDigest,async()=>Response.json(false)),"closed");
 assert.equal(await persistEmailChallenge(env,leadId,tokenDigest,async()=>new Response("forbidden",{status:403})),"unavailable");
 assert.equal(await persistEmailChallenge(env,leadId,tokenDigest,async()=>Response.json({ok:true})),"unavailable");
 assert.equal(await persistEmailChallenge(env,leadId,tokenDigest,async()=>{throw Error("network")}),"unavailable");
});
