import test from "node:test";
import assert from "node:assert/strict";
import {stageAtomicLeadAndChallenge} from "../functions/_lib/creator-atomic-lead-challenge.ts";
const creatorId="123e4567-e89b-42d3-a456-426614174000";
const magnetId="123e4567-e89b-42d3-a456-426614174001";
const env={supabaseUrl:"https://demo-project.supabase.co",backendSecret:"unit-test-only-server-secret-1234567890",authorizedByServer:true};
const input={creatorId,magnetId,email:" Reader@Example.com ",fullName:"Reader",marketingOptIn:false,privacyVersion:"v1",deliveryConsentText:"Accetto di ricevere la risorsa richiesta.",tokenDigest:"a".repeat(64)};

test("no release authorization: no privileged request",async()=>{
 let calls=0;
 assert.equal(await stageAtomicLeadAndChallenge({...env,authorizedByServer:false},input,async()=>{calls++;return Response.json(true)}),"closed");
 assert.equal(calls,0);
});
test("invalid tenant, magnet, email or digest: reject without RPC",async()=>{
 let calls=0;const f=async()=>{calls++;return Response.json(true)};
 for(const obj of [{...input,creatorId:"bad"},{...input,magnetId:"bad"},{...input,email:"bad"},{...input,tokenDigest:"x"},{...input,marketingOptIn:"false"},{...input,deliveryConsentText:"short"}]){
  assert.equal(await stageAtomicLeadAndChallenge(env,obj,f),"closed");
 }
 assert.equal(calls,0);
});
test("missing backend secret or invalid Supabase host fails closed",async()=>{
 let calls=0;const f=async()=>{calls++;return Response.json(true)};
 assert.equal(await stageAtomicLeadAndChallenge({...env,backendSecret:undefined},input,f),"unavailable");
 assert.equal(await stageAtomicLeadAndChallenge({...env,supabaseUrl:"https://evil.example"},input,f),"unavailable");
 assert.equal(calls,0);
});
test("atomic RPC receives only normalized lead and digest without raw token",async()=>{
 let calls=0;
 const r=await stageAtomicLeadAndChallenge(env,input,async(url,options)=>{
  calls++;
  assert.equal(url,"https://demo-project.supabase.co/rest/v1/rpc/creator_create_pending_lead_with_token");
  assert.equal(options.method,"POST");
  assert.equal(options.headers.authorization,"Bearer "+env.backendSecret);
  const body=JSON.parse(options.body);
  assert.deepEqual(body,{
   p_creator_id:creatorId,p_magnet_id:magnetId,p_email:"reader@example.com",
   p_full_name:"Reader",p_marketing_opt_in:false,p_privacy_version:"v1",
   p_delivery_consent_text:input.deliveryConsentText,p_digest:input.tokenDigest,
  });
  assert.equal(Object.keys(body).includes("token"),false);
  return Response.json(true);
 });
 assert.equal(r,"stored");assert.equal(calls,1);
});
test("existing lead returns generic closed without disclosing row identity",async()=>{
 const r=await stageAtomicLeadAndChallenge(env,input,async()=>Response.json(false));
 assert.equal(r,"closed");
});
test("RPC errors and unexpected answers cannot be mistaken for successful staging",async()=>{
 assert.equal(await stageAtomicLeadAndChallenge(env,input,async()=>new Response("error",{status:403})),"unavailable");
 assert.equal(await stageAtomicLeadAndChallenge(env,input,async()=>Response.json({id:creatorId})),"unavailable");
 assert.equal(await stageAtomicLeadAndChallenge(env,input,async()=>{throw Error("offline")}),"unavailable");
});
