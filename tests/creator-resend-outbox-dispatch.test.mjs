import test from "node:test";
import assert from "node:assert/strict";
import {sealOutboxMail} from "../functions/_lib/creator-mail-outbox.ts";
import {dispatchOneResendOutbox} from "../functions/_lib/creator-resend-outbox-dispatch.ts";
const key=Uint8Array.from({length:32},(_,i)=>i+10);
const eventId="d".repeat(64);
const outboxId="123e4567-e89b-42d3-a456-426614174002";
const leaseToken="123e4567-e89b-42d3-a456-426614174003";
const apiKey="re_"+"a".repeat(32);
const good={
 RMP_CREATOR_PUBLIC_RELEASE:"true",RMP_CONFIRMATION_DISPATCH_ENABLED:"true",
 RMP_RESEND_DOMAIN_VERIFIED:"true",
 RMP_SUPABASE_URL:"https://sample.supabase.co",
 RMP_SUPABASE_SERVICE_KEY:"server-service-role-test-key-exactly-32-chars",
 RESEND_API_KEY:apiKey,
 RMP_OUTBOX_KEY_ID:"mail-v1",
 RMP_OUTBOX_KEY_B64URL:Buffer.from(key).toString("base64url")
};
const moment=()=>Date.parse("2026-11-24T10:00:00Z");
async function row(overrides={}){
 const envelope=await sealOutboxMail({
  recipient:"reader@example.com",creatorName:"Creator",
  confirmationUrl:"https://rmpworks.com/creator/confirm-email?token="+"C".repeat(43)
 },{key,keyId:"mail-v1",associatedId:eventId});
 return {outbox_id:outboxId,event_id:eventId,ciphertext:envelope.ciphertext,
  iv:envelope.iv,key_id:"mail-v1",envelope_version:1,
  provider_idempotent:true,lease_token:leaseToken,attempts:1,
  expires_at:"2026-11-24T10:15:00Z",...overrides};
}
function mockFetch(rowValue,provider="accepted"){
 const requests=[];
 const fetcher=async(url,opts)=>{
  const path=new URL(url).pathname;
  requests.push({url,path,options:opts});
  if(path.endsWith("/creator_claim_confirmation_mail"))
   return Response.json(rowValue?[rowValue]:[]);
  if(path.endsWith("/creator_can_dispatch_confirmation_mail"))
   return Response.json(true);
  if(path.endsWith("/creator_ack_confirmation_mail"))
   return Response.json(true);
  if(url==="https://api.resend.com/emails"){
   return provider==="accepted"?
    Response.json({id:"provider-msg-12345"},{status:200}):
    Response.json({name:"api_error"},{status:503});
  }
  throw Error("Unexpected request");
 };
 return {fetcher,requests};
}
test("closed public gate prevents any DB or Resend request",async()=>{
 const m=mockFetch(await row()); 
 assert.equal(await dispatchOneResendOutbox({...good,RMP_CREATOR_PUBLIC_RELEASE:"false"},
  {fetcher:m.fetcher,now:moment}),"disabled");
 assert.equal(m.requests.length,0);
});
test("email dispatch gate prevents request even when public gate open",async()=>{
 const m=mockFetch(await row());
 assert.equal(await dispatchOneResendOutbox({...good,RMP_CONFIRMATION_DISPATCH_ENABLED:"false"},
  {fetcher:m.fetcher,now:moment}),"disabled");
 assert.equal(m.requests.length,0);
});
test("missing verified domain, secret and key fail before DB claim",async()=>{
 const m=mockFetch(await row());
 for(const env of [
  {...good,RMP_RESEND_DOMAIN_VERIFIED:"false"},
  {...good,RESEND_API_KEY:""},
  {...good,RMP_OUTBOX_KEY_B64URL:"not-valid"},
  {...good,RMP_SUPABASE_SERVICE_KEY:""}
 ]){
  assert.equal(await dispatchOneResendOutbox(env,
   {fetcher:m.fetcher,now:moment}),"unavailable");
 }
 assert.equal(m.requests.length,0);
});
test("empty DB outbox does not send mail",async()=>{
 const m=mockFetch(null);
 assert.equal(await dispatchOneResendOutbox(good,{fetcher:m.fetcher,now:moment}),"empty");
 assert.equal(m.requests.length,1);
});
test("success: claim, eligibility, HTTPS send and ACK happen in strict order",async()=>{
 const m=mockFetch(await row());
 assert.equal(await dispatchOneResendOutbox(good,{fetcher:m.fetcher,now:moment}),"sent");
 assert.deepEqual(m.requests.map(r=>r.path),[
  "/rest/v1/rpc/creator_claim_confirmation_mail",
  "/rest/v1/rpc/creator_can_dispatch_confirmation_mail",
  "/emails",
  "/rest/v1/rpc/creator_ack_confirmation_mail"
 ]);
 const p=m.requests.find(r=>r.path==="/emails");
 assert.equal(p.options.headers["idempotency-key"],"creator-confirmation/"+eventId);
 assert.equal(p.options.headers.authorization,"Bearer "+apiKey);
 const body=JSON.parse(p.options.body);
 assert.equal(body.from,"RMP Works <noreply@rmpworks.com>");
 assert.deepEqual(body.to,["reader@example.com"]);
 assert.equal(body.html.includes("/creator/confirm-email?token="),true);
 const ack=JSON.parse(m.requests.at(-1).options.body);
 assert.deepEqual(ack,{p_outbox_id:outboxId,p_lease_token:leaseToken,p_outcome:"accepted"});
});
test("Resend outage records retryable outcome instead of claiming sent",async()=>{
 const m=mockFetch(await row(),"unavailable");
 assert.equal(await dispatchOneResendOutbox(good,{fetcher:m.fetcher,now:moment}),"recorded");
 assert.equal(JSON.parse(m.requests.at(-1).options.body).p_outcome,"retryable");
});
test("invalid outbox key ID fails closed without touching DB",async()=>{
 const m=mockFetch(await row());
 assert.equal(await dispatchOneResendOutbox({...good,RMP_OUTBOX_KEY_ID:"../../etc/passwd"},
  {fetcher:m.fetcher,now:moment}),"unavailable");
 assert.equal(m.requests.length,0);
});
test("wrong outbox key cannot leak token to Resend",async()=>{
 const altered={...good,RMP_OUTBOX_KEY_B64URL:Buffer.from(new Uint8Array(32)).toString("base64url")};
 const m=mockFetch(await row());
 assert.equal(await dispatchOneResendOutbox(altered,{fetcher:m.fetcher,now:moment}),"dead");
 assert.equal(m.requests.filter(r=>r.path==="/emails").length,0);
 assert.equal(JSON.parse(m.requests.at(-1).options.body).p_outcome,"permanent");
});
test("future or expired row is never sent",async()=>{
 const m=mockFetch(await row({expires_at:"2026-11-24T09:59:00Z"}));
 assert.equal(await dispatchOneResendOutbox(good,{fetcher:m.fetcher,now:moment}),"dead");
 assert.equal(m.requests.filter(r=>r.path==="/emails").length,0);
});
