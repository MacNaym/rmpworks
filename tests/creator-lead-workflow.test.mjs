import test from "node:test";
import assert from "node:assert/strict";
import {createPendingCreatorLead,confirmPendingCreatorLead}
 from "../functions/_lib/creator-lead-workflow.ts";
import {issueEmailVerification} from "../functions/_lib/creator-email-verification.ts";
const db={authorizedByServer:true,
 supabaseUrl:"https://sample.supabase.co",
 backendSecret:"server-only-key-not-a-real-secret-value-123456789"};
const key=Uint8Array.from({length:32},(_,i)=>i+1);
const outbox={key,keyId:"mail-v1",providerSupportsIdempotency:true};
const lead={
 creatorId:"11111111-1111-4111-8111-111111111111",
 magnetId:"22222222-2222-4222-8222-222222222222",
 email:"reader@example.com",
 fullName:"Reader",creatorName:"Sample Creator",
 marketingOptIn:false,privacyVersion:"v1",
 deliveryConsentText:"I consent to delivery of the requested resource"
};
const base={publicReleaseEnabled:true,intakeEnabled:true,confirmationEnabled:true,db,outbox};
test("both server gates prevent intake without any network",async()=>{
 let calls=0;const fetcher=async()=>{calls++;throw Error("unexpected request")};
 assert.equal(await createPendingCreatorLead({...base,publicReleaseEnabled:false,fetcher},lead),"disabled");
 assert.equal(await createPendingCreatorLead({...base,intakeEnabled:false,fetcher},lead),"disabled");
 assert.equal(calls,0);
});
test("missing server credentials and invalid AES key fail closed",async()=>{
 let calls=0;const fetcher=async()=>{calls++;throw Error("unexpected request")};
 assert.equal(await createPendingCreatorLead({...base,db:{...db,backendSecret:""},fetcher},lead),"unavailable");
 assert.equal(await createPendingCreatorLead({...base,outbox:{...outbox,key:new Uint8Array(8)},fetcher},lead),"unavailable");
 assert.equal(calls,0);
});
test("intake performs exactly one atomic RPC with sealed message not token plaintext",async()=>{
 let calls=0;
 const fetcher=async(url,options)=>{
  calls++;
  assert.equal(new URL(url).pathname,"/rest/v1/rpc/creator_create_lead_with_outbox");
  assert.equal(options.method,"POST");
  const payload=JSON.parse(options.body);
  assert.equal(payload.p_email,"reader@example.com");
  assert.equal(payload.p_provider_idempotent,true);
  assert.match(payload.p_event_id,/^[a-f0-9]{64}$/);
  assert.match(payload.p_digest,/^[a-f0-9]{64}$/);
  assert.equal(typeof payload.p_ciphertext,"string");
  assert.equal(payload.p_ciphertext.includes("https://rmpworks.com"),false);
  assert.equal(JSON.stringify(payload).includes("confirm-email?token="),false);
  return Response.json(true);
 };
 assert.equal(await createPendingCreatorLead({...base,fetcher},lead),"stored");
 assert.equal(calls,1);
});
test("false result rejects duplicated creator/lead without revealing existence",async()=>{
 let calls=0;const fetcher=async()=>{calls++;return Response.json(false)};
 assert.equal(await createPendingCreatorLead({...base,fetcher},lead),"closed");
 assert.equal(calls,1);
});
test("closed confirmation gate prevents fetching or hashing token",async()=>{
 const token=(await issueEmailVerification()).token;
 let calls=0;const fetcher=async()=>{calls++;throw Error("unexpected")};
 assert.equal(await confirmPendingCreatorLead({...base,publicReleaseEnabled:false,fetcher},token),"disabled");
 assert.equal(await confirmPendingCreatorLead({...base,confirmationEnabled:false,fetcher},token),"disabled");
 assert.equal(calls,0);
});
test("invalid email token never reaches privileged RPC",async()=>{
 let calls=0;const fetcher=async()=>{calls++;return Response.json(true)};
 assert.equal(await confirmPendingCreatorLead({...base,fetcher},"bad"),"invalid");
 assert.equal(calls,0);
});
test("token consumption uses only SHA-256 digest, never raw token",async()=>{
 const token=(await issueEmailVerification()).token;
 let calls=0;const fetcher=async(url,opts)=>{
  calls++;
  assert.equal(new URL(url).pathname,"/rest/v1/rpc/creator_consume_email_token");
  assert.equal(opts.method,"POST");
  assert.equal(opts.headers.authorization,"Bearer "+db.backendSecret);
  assert.equal(opts.body.includes(token),false);
  assert.match(JSON.parse(opts.body).p_digest,/^[a-f0-9]{64}$/);
  return Response.json(true);
 };
 assert.equal(await confirmPendingCreatorLead({...base,fetcher},token),"verified");
 assert.equal(calls,1);
});
test("false redemption becomes invalid, RPC or provider failure becomes unavailable",async()=>{
 const token=(await issueEmailVerification()).token;
 assert.equal(await confirmPendingCreatorLead({...base,fetcher:async()=>Response.json(false)},token),"invalid");
 assert.equal(await confirmPendingCreatorLead({...base,fetcher:async()=>new Response(null,{status:503})},token),"unavailable");
 assert.equal(await confirmPendingCreatorLead({...base,fetcher:async()=>{throw Error("network")}},token),"unavailable");
});
