import test from "node:test";
import assert from "node:assert/strict";
import {enqueueLeadWithMail,claimOneConfirmationMail,acknowledgeConfirmationMail} from "../functions/_lib/creator-outbox-db.ts";
const env={supabaseUrl:"https://example-project.supabase.co",backendSecret:"unit-test-server-key-with-32-plus-characters",authorizedByServer:true};
const key=Uint8Array.from({length:32},(_,i)=>i+1);
const creatorId="123e4567-e89b-42d3-a456-426614174000";
const magnetId="123e4567-e89b-42d3-a456-426614174001";
const uid="123e4567-e89b-42d3-a456-426614174002";
const lease="123e4567-e89b-42d3-a456-426614174003";
const lead={creatorId,magnetId,email:" Reader@Example.com ",fullName:"Reader",creatorName:"Creator",
 marketingOptIn:false,privacyVersion:"v1",deliveryConsentText:"Accetto la consegna della risorsa richiesta."};
const encryption={key,keyId:"mail-v1",providerSupportsIdempotency:false};
const claimData={outbox_id:uid,event_id:"a".repeat(64),ciphertext:"Abc_DEF012",
 iv:"abcdefghijklmnop",key_id:"mail-v1",envelope_version:1,
 lease_token:lease,attempts:1,expires_at:"2026-11-24T10:15:00Z"};
test("authorization false means no RPC call or token generation",async()=>{
 let called=0;
 const f=async()=>{called++;return Response.json(true)};
 assert.equal(await enqueueLeadWithMail({...env,authorizedByServer:false},lead,encryption,f),"closed");
 assert.deepEqual(await claimOneConfirmationMail({...env,authorizedByServer:false},f),{status:"closed"});
 assert.equal(await acknowledgeConfirmationMail({...env,authorizedByServer:false},{outboxId:uid,leaseToken:lease},"accepted",f),"closed");
 assert.equal(called,0);
});
test("lead and encrypted envelope are committed in one privileged RPC",async()=>{
 let called=0;
 const result=await enqueueLeadWithMail(env,lead,encryption,async(url,options)=>{
  called++;
  assert.equal(url,"https://example-project.supabase.co/rest/v1/rpc/creator_create_lead_with_outbox");
  assert.equal(options.method,"POST");
  const body=JSON.parse(options.body);
  assert.equal(body.p_email,"reader@example.com");
  assert.equal(body.p_creator_id,creatorId);
  assert.equal(body.p_magnet_id,magnetId);
  assert.match(body.p_digest,/^[0-9a-f]{64}$/);
  assert.match(body.p_event_id,/^[0-9a-f]{64}$/);
  assert.ok(body.p_ciphertext.length>24);
  assert.equal(body.p_iv.length,16);
  assert.equal(body.p_key_id,"mail-v1");
  assert.equal(body.p_provider_idempotent,false);
  assert.equal(JSON.stringify(body).includes("https://rmpworks.com/creator/confirm-email"),false);
  assert.equal(JSON.stringify(body).includes("token="),false);
  return Response.json(true);
 });
 assert.equal(result,"stored");
 assert.equal(called,1);
});
test("bad tenant or invalid cipher key prevent any database write",async()=>{
 let called=0;const f=async()=>{called++;return Response.json(true)};
 assert.equal(await enqueueLeadWithMail(env,{...lead,creatorId:"bad"},encryption,f),"closed");
 assert.equal(await enqueueLeadWithMail(env,lead,{...encryption,key:new Uint8Array(16)},f),"unavailable");
 assert.equal(called,0);
});
test("wrong server endpoint and unavailable RPC fail closed",async()=>{
 assert.equal(await enqueueLeadWithMail({...env,supabaseUrl:"https://evil.invalid"},lead,encryption),"closed");
 assert.equal(await enqueueLeadWithMail(env,lead,encryption,async()=>new Response("",{status:500})),"unavailable");
 assert.equal(await enqueueLeadWithMail(env,lead,encryption,async()=>Response.json(false)),"closed");
});
test("claim handles empty queue without fake delivery",async()=>{
 assert.deepEqual(await claimOneConfirmationMail(env,async()=>Response.json([])),{status:"empty"});
});
test("claim returns only validated lease from restricted RPC",async()=>{
 const r=await claimOneConfirmationMail(env,async(url,opts)=>{
  assert.equal(url,"https://example-project.supabase.co/rest/v1/rpc/creator_claim_confirmation_mail");
  assert.deepEqual(JSON.parse(opts.body),{});
  return Response.json([claimData]);
 });
 assert.equal(r.status,"claimed");
 if(r.status==="claimed"){
  assert.equal(r.job.leaseToken,lease);
  assert.equal(r.job.eventId,"a".repeat(64));
  assert.equal(r.job.attempts,1);
 }
});
test("unexpected number of jobs or malformed lease is denied",async()=>{
 assert.equal((await claimOneConfirmationMail(env,async()=>Response.json([claimData,claimData]))).status,"unavailable");
 assert.equal((await claimOneConfirmationMail(env,async()=>Response.json([{...claimData,lease_token:"bad"}]))).status,"unavailable");
 assert.equal((await claimOneConfirmationMail(env,async()=>Response.json(null))).status,"unavailable");
});
test("ack includes exactly the leased id, token and accepted outcome",async()=>{
 const result=await acknowledgeConfirmationMail(env,{outboxId:uid,leaseToken:lease},"accepted",async(url,opts)=>{
  assert.equal(url,"https://example-project.supabase.co/rest/v1/rpc/creator_ack_confirmation_mail");
  assert.deepEqual(JSON.parse(opts.body),{p_outbox_id:uid,p_lease_token:lease,p_outcome:"accepted"});
  return Response.json(true);
 });
 assert.equal(result,"acknowledged");
});
test("stale lease and provider errors are not counted as accepted",async()=>{
 assert.equal(await acknowledgeConfirmationMail(env,{outboxId:uid,leaseToken:lease},"accepted",async()=>Response.json(false)),"stale");
 assert.equal(await acknowledgeConfirmationMail(env,{outboxId:uid,leaseToken:lease},"retryable",async()=>new Response("",{status:500})),"unavailable");
 assert.equal(await acknowledgeConfirmationMail(env,{outboxId:uid,leaseToken:lease},"ambiguous",async()=>Response.json({ok:true})),"unavailable");
});
test("invalid lease input never calls privileged RPC",async()=>{
 let called=0;const f=async()=>{called++;return Response.json(true)};
 assert.equal(await acknowledgeConfirmationMail(env,{outboxId:uid,leaseToken:"invalid"},"accepted",f),"unavailable");
 assert.equal(called,0);
});
