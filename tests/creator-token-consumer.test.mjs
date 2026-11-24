import test from "node:test";
import assert from "node:assert/strict";
import {createRestrictedTokenConsumer} from "../functions/_lib/creator-token-consumer.ts";
import {redeemEmailVerification,issueEmailVerification} from "../functions/_lib/creator-email-verification.ts";
const env={supabaseUrl:"https://staging-project.supabase.co",secretKey:"example-only-server-secret-32-characters-plus",stagingApproved:true};
test("missing staging authorization never calls RPC",async()=>{
 let calls=0;
 const fn=createRestrictedTokenConsumer({...env,stagingApproved:false},async()=>{calls++;return Response.json(true)});
 assert.equal(await fn({tokenDigest:"a".repeat(64),nowIso:"2026-11-24T10:00:00Z"}),"invalid");
 assert.equal(calls,0);
});
test("invalid digest and missing secret never reach RPC",async()=>{
 let calls=0;
 for(const e of [env,{...env,secretKey:undefined},{...env,supabaseUrl:"https://evil.example"}]){
  const f=createRestrictedTokenConsumer(e,async()=>{calls++;return Response.json(true)});
  assert.equal(await f({tokenDigest:"invalid",nowIso:"2026-11-24T10:00:00Z"}),"invalid");
 }
 const f=createRestrictedTokenConsumer({...env,secretKey:undefined},async()=>{calls++;return Response.json(true)});
 assert.equal(await f({tokenDigest:"a".repeat(64),nowIso:"2026-11-24T10:00:00Z"}),"invalid");
 assert.equal(calls,0);
});
test("only digest is sent to privileged RPC, never a raw token",async()=>{
 const v=await issueEmailVerification(120000);
 const fn=createRestrictedTokenConsumer(env,async(url,options)=>{
  assert.equal(url,"https://staging-project.supabase.co/rest/v1/rpc/creator_consume_email_token");
  assert.equal(options.method,"POST");
  const body=JSON.parse(options.body);
  assert.deepEqual(body,{p_digest:v.tokenDigest});
  assert.equal(options.body.includes(v.token),false);
  return Response.json(true);
 });
 assert.equal(await redeemEmailVerification(v.token,fn,121000),"verified");
});
test("expired, reused or invalid RPC result never verifies",async()=>{
 const v=await issueEmailVerification(120000);
 for(const result of [false,null,{success:true}]){
  const fn=createRestrictedTokenConsumer(env,async()=>Response.json(result));
  assert.notEqual(await redeemEmailVerification(v.token,fn,121000),"verified");
 }
});
test("network failures and non-200 responses fail closed",async()=>{
 const v=await issueEmailVerification(120000);
 const failed=createRestrictedTokenConsumer(env,async()=>{throw Error("offline")});
 assert.equal(await redeemEmailVerification(v.token,failed,121000),"unavailable");
 const status=createRestrictedTokenConsumer(env,async()=>new Response("forbidden",{status:403}));
 assert.equal(await redeemEmailVerification(v.token,status,121000),"unavailable");
});
