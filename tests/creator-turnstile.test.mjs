import test from "node:test";
import assert from "node:assert/strict";
import {verifyCreatorTurnstile} from "../functions/_lib/creator-turnstile.ts";
const base={token:"valid-token",secret:"sandbox-secret-value-123456",expectedHostname:"rmpworks.com",expectedAction:"creator_lead"};
const ok=async()=>Response.json({success:true,hostname:"rmpworks.com",action:"creator_lead"});
test("no verification without server-side secret",async()=>{
 const r=await verifyCreatorTurnstile({...base,secret:undefined,fetcher:()=>{throw Error("network not expected")}});
 assert.deepEqual(r,{ok:false,reason:"not_configured"});
});
test("missing or oversized token is rejected before network",async()=>{
 for(const token of [undefined,"","x".repeat(2049)]){
  const r=await verifyCreatorTurnstile({...base,token,fetcher:()=>{throw Error("network not expected")}});
  assert.equal(r.reason,"invalid_input");
 }
});
test("valid answer with correct hostname and action passes",async()=>{
 let called=false;
 const r=await verifyCreatorTurnstile({...base,fetcher:async(url,opts)=>{
  called=true;
  assert.equal(String(url),"https://challenges.cloudflare.com/turnstile/v0/siteverify");
  assert.equal(opts.method,"POST");
  assert.equal(new URLSearchParams(opts.body).get("secret"),base.secret);
  assert.equal(new URLSearchParams(opts.body).get("response"),base.token);
  return ok();
 }});
 assert.equal(called,true);
 assert.deepEqual(r,{ok:true,reason:"ok"});
});
test("hostname and action mismatch are never accepted",async()=>{
 for(const result of [{success:true,hostname:"attacker.example",action:"creator_lead"},{success:true,hostname:"rmpworks.com",action:"other"}]){
  const r=await verifyCreatorTurnstile({...base,fetcher:async()=>Response.json(result)});
  assert.deepEqual(r,{ok:false,reason:"invalid_context"});
 }
});
test("failed challenge and unavailable network fail closed",async()=>{
 assert.equal((await verifyCreatorTurnstile({...base,fetcher:async()=>Response.json({success:false,"error-codes":["invalid-input-response"]})})).reason,"challenge_failed");
 assert.equal((await verifyCreatorTurnstile({...base,fetcher:async()=>new Response("fail",{status:503})})).reason,"verification_unavailable");
 assert.equal((await verifyCreatorTurnstile({...base,fetcher:async()=>{throw Error("network")}})).reason,"verification_unavailable");
});
