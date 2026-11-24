import test from "node:test";
import assert from "node:assert/strict";
import {sealOutboxMail} from "../functions/_lib/creator-mail-outbox.ts";
import {dispatchOneConfirmation} from "../functions/_lib/creator-outbox-worker.ts";
import {revalidateConfirmationMailLease} from "../functions/_lib/creator-outbox-db.ts";
const key=Uint8Array.from({length:32},(_,i)=>i+1);
const eventId="a".repeat(64);
const outboxId="123e4567-e89b-42d3-a456-426614174002";
const leaseToken="123e4567-e89b-42d3-a456-426614174003";
const payload={recipient:"reader@example.com",creatorName:"Creator",
 confirmationUrl:"https://rmpworks.com/creator/confirm-email?token="+"B".repeat(43)};
const moment=()=>Date.parse("2026-11-24T10:00:00Z");
async function job(overrides={}){
 const envelope=await sealOutboxMail(payload,{key,keyId:"mail-v1",associatedId:eventId});
 return {outboxId,eventId,ciphertext:envelope.ciphertext,iv:envelope.iv,
  keyId:envelope.keyId,envelopeVersion:1,providerIdempotent:false,
  leaseToken,attempts:1,expiresAt:"2026-11-24T10:15:00Z",...overrides};
}
function harness(item,overrides={}){
 const calls={claim:0,revalidate:0,send:0,ack:[]};
 const cfg={
  enabled:true,keys:{"mail-v1":key},now:moment,
  claim:async()=>{calls.claim++;return {status:"claimed",job:item}},
  revalidate:async()=>{calls.revalidate++;return true},
  transport:{supportsIdempotency:false,send:async()=>{calls.send++;return "accepted"}},
  acknowledge:async(k,outcome)=>{calls.ack.push({k,outcome});return "acknowledged"},
  ...overrides,
 };
 return {cfg,calls};
}
test("disabled worker never claims, decrypts or contacts a transport",async()=>{
 const h=harness(await job(),{enabled:false});
 assert.equal(await dispatchOneConfirmation(h.cfg),"disabled");
 assert.equal(h.calls.claim,0);
 assert.equal(h.calls.send,0);
});
test("missing transport cannot claim any job",async()=>{
 const h=harness(await job(),{transport:undefined});
 assert.equal(await dispatchOneConfirmation(h.cfg),"unavailable");
 assert.equal(h.calls.claim,0);
});
test("empty queue never sends or acknowledges",async()=>{
 const h=harness(await job(),{claim:async()=>({status:"empty"})});
 assert.equal(await dispatchOneConfirmation(h.cfg),"empty");
 assert.equal(h.calls.send,0);
});
test("successful one-job flow decrypts, revalidates, sends and ACKs lease",async()=>{
 const j=await job();
 const h=harness(j,{
  transport:{supportsIdempotency:false,send:async(message,options)=>{
   h.calls.send++;
   assert.equal(message.to,"reader@example.com");
   assert.match(message.html,/Conferma il tuo indirizzo email/);
   assert.equal(options.eventId,eventId);
   return "accepted";
  }}
 });
 assert.equal(await dispatchOneConfirmation(h.cfg),"sent");
 assert.equal(h.calls.claim,1);
 assert.equal(h.calls.revalidate,1);
 assert.equal(h.calls.send,1);
 assert.deepEqual(h.calls.ack,[{k:{outboxId,leaseToken},outcome:"accepted"}]);
});
test("revoked lease or unpublished creator must prevent provider delivery",async()=>{
 const h=harness(await job(),{revalidate:async()=>false});
 assert.equal(await dispatchOneConfirmation(h.cfg),"dead");
 assert.equal(h.calls.send,0);
 assert.equal(h.calls.ack[0].outcome,"permanent");
});
test("invalid ciphertext fails closed and does not send",async()=>{
 const h=harness(await job({ciphertext:"not-valid"}));
 assert.equal(await dispatchOneConfirmation(h.cfg),"dead");
 assert.equal(h.calls.send,0);
 assert.equal(h.calls.ack[0].outcome,"permanent");
});
test("missing encryption key never sends",async()=>{
 const h=harness(await job(),{keys:{}});
 assert.equal(await dispatchOneConfirmation(h.cfg),"dead");
 assert.equal(h.calls.send,0);
});
test("expired challenge is not sent",async()=>{
 const h=harness(await job({expiresAt:"2026-11-24T09:59:59Z"}));
 assert.equal(await dispatchOneConfirmation(h.cfg),"dead");
 assert.equal(h.calls.send,0);
});
test("provider may have accepted when transport throws: mark ambiguous, not retryable",async()=>{
 const h=harness(await job(),{transport:{
  supportsIdempotency:false,send:async()=>{h.calls.send++;throw Error("unknown provider response")}
 }});
 assert.equal(await dispatchOneConfirmation(h.cfg),"recorded");
 assert.equal(h.calls.send,1);
 assert.equal(h.calls.ack[0].outcome,"ambiguous");
});
test("retryable provider response delegates database outcome without pretending it scheduled a retry",async()=>{
 const h=harness(await job(),{transport:{supportsIdempotency:false,send:async()=> "retryable"}});
 assert.equal(await dispatchOneConfirmation(h.cfg),"recorded");
 assert.equal(h.calls.ack[0].outcome,"retryable");
});
test("DB idempotency flag true requires a compatible provider",async()=>{
 const h=harness(await job({providerIdempotent:true}));
 assert.equal(await dispatchOneConfirmation(h.cfg),"dead");
 assert.equal(h.calls.send,0);
});
test("stale acknowledgments cannot be reported as sent",async()=>{
 const h=harness(await job(),{acknowledge:async()=> "stale"});
 assert.equal(await dispatchOneConfirmation(h.cfg),"ack_unavailable");
});
test("DB RPC lease verification returns true only on explicit boolean true",async()=>{
 const env={supabaseUrl:"https://demo-project.supabase.co",
  backendSecret:"example-server-secret-with-enough-characters",authorizedByServer:true};
 const keys={outboxId,leaseToken};
 let requests=0;
 const result=await revalidateConfirmationMailLease(env,keys,async(url,opts)=>{
  requests++;
  assert.equal(url,"https://demo-project.supabase.co/rest/v1/rpc/creator_can_dispatch_confirmation_mail");
  assert.deepEqual(JSON.parse(opts.body),{p_outbox_id:outboxId,p_lease_token:leaseToken});
  return Response.json(true);
 });
 assert.equal(result,true);assert.equal(requests,1);
 assert.equal(await revalidateConfirmationMailLease(env,keys,async()=>Response.json({valid:true})),false);
});
test("disabled credentials and stale lease IDs never call privileged revalidation",async()=>{
 const env={supabaseUrl:"https://demo-project.supabase.co",
  backendSecret:"example-server-secret-with-enough-characters",authorizedByServer:false};
 let calls=0;const f=async()=>{calls++;return Response.json(true)};
 assert.equal(await revalidateConfirmationMailLease(env,{outboxId,leaseToken},f),false);
 assert.equal(await revalidateConfirmationMailLease({...env,authorizedByServer:true},
  {outboxId,leaseToken:"bad"},f),false);
 assert.equal(calls,0);
});
