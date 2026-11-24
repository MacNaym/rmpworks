import test from "node:test";
import assert from "node:assert/strict";
import {sealOutboxMail,openOutboxMail,decideMailRetry} from "../functions/_lib/creator-mail-outbox.ts";
const key=Uint8Array.from({length:32},(_,i)=>i+1);
const key2=Uint8Array.from({length:32},(_,i)=>i+3);
const context={key,keyId:"key-v1",associatedId:"a".repeat(64)};
const payload={
  recipient:"reader@example.com",creatorName:"Creator",
  confirmationUrl:"https://rmpworks.com/creator/confirm-email?token="+"A".repeat(43),
};
const base={status:"leased",attempts:1,expiresAt:"2026-11-24T10:15:00Z",
 idempotencyKey:"b".repeat(64),providerSupportsIdempotency:true};
test("AES-GCM envelope roundtrips a private confirmation email",async()=>{
 const envelope=await sealOutboxMail(payload,context);
 assert.equal(envelope.version,1);
 assert.equal(envelope.keyId,"key-v1");
 assert.deepEqual(await openOutboxMail(envelope,context),payload);
});
test("encryption uses unique random 96-bit nonces",async()=>{
 const one=await sealOutboxMail(payload,context);
 const two=await sealOutboxMail(payload,context);
 assert.notEqual(one.iv,two.iv);
 assert.notEqual(one.ciphertext,two.ciphertext);
});
test("envelope never contains plain email or verification token",async()=>{
 const envelope=await sealOutboxMail(payload,context);
 const serialized=JSON.stringify(envelope);
 assert.ok(!serialized.includes(payload.recipient));
 assert.ok(!serialized.includes("A".repeat(43)));
 assert.ok(!serialized.includes(payload.confirmationUrl));
});
test("associated context and encryption key cannot be substituted",async()=>{
 const envelope=await sealOutboxMail(payload,context);
 await assert.rejects(openOutboxMail(envelope,{...context,associatedId:"c".repeat(64)}));
 await assert.rejects(openOutboxMail(envelope,{...context,key:key2}));
 await assert.rejects(openOutboxMail(envelope,{...context,keyId:"key-v2"}));
});
test("tampering with ciphertext or iv fails authentication",async()=>{
 const envelope=await sealOutboxMail(payload,context);
 await assert.rejects(openOutboxMail({...envelope,ciphertext:(envelope.ciphertext[0]==="A"?"B":"A")+envelope.ciphertext.slice(1)},context));
 await assert.rejects(openOutboxMail({...envelope,iv:(envelope.iv[0]==="A"?"B":"A")+envelope.iv.slice(1)},context));
});
test("sealing rejects invalid AES key, unknown host and token format",async()=>{
 await assert.rejects(sealOutboxMail(payload,{...context,key:new Uint8Array(16)}));
 await assert.rejects(sealOutboxMail({...payload,confirmationUrl:"https://evil.example/creator/confirm-email?token="+"A".repeat(43)},context));
 await assert.rejects(sealOutboxMail({...payload,confirmationUrl:"https://rmpworks.com/creator/confirm-email?token=bad"},context));
});
test("successful provider acceptance is terminal sent",()=>{
 assert.deepEqual(decideMailRetry(base,"accepted","2026-11-24T10:00:00Z"),{status:"sent",nextAttemptAt:null});
});
test("retryable failure follows bounded escalating delays",()=>{
 for(const [attempts,expected] of [[1,"10:00:30"],[2,"10:02:00"],[3,"10:05:00"]]){
  const result=decideMailRetry({...base,attempts},"retryable","2026-11-24T10:00:00Z");
  assert.equal(result.status,"pending");
  assert.equal(result.nextAttemptAt,`2026-11-24T${expected}.000Z`);
 }
});
test("ambiguous transport result without idempotency support blocks retry",()=>{
 assert.deepEqual(decideMailRetry({...base,providerSupportsIdempotency:false},"ambiguous","2026-11-24T10:00:00Z"),{status:"needs_review",nextAttemptAt:null});
});
test("ambiguous transport result with stable idempotency can retry safely",()=>{
 const r=decideMailRetry(base,"ambiguous","2026-11-24T10:00:00Z");
 assert.equal(r.status,"pending");
});
test("permanent failure, exhausted attempts and expiration do not retry",()=>{
 assert.equal(decideMailRetry(base,"permanent","2026-11-24T10:00:00Z").status,"dead");
 assert.equal(decideMailRetry({...base,attempts:4},"retryable","2026-11-24T10:00:00Z").status,"dead");
 assert.equal(decideMailRetry(base,"retryable","2026-11-24T10:16:00Z").status,"dead");
 assert.equal(decideMailRetry({...base,expiresAt:"2026-11-24T10:00:20Z"},"retryable","2026-11-24T10:00:00Z").status,"dead");
});
test("unknown state and timestamps fail closed for manual review",()=>{
 assert.equal(decideMailRetry({...base,status:"pending"},"retryable","2026-11-24T10:00:00Z").status,"needs_review");
 assert.equal(decideMailRetry({...base,attempts:0},"retryable","2026-11-24T10:00:00Z").status,"needs_review");
 assert.equal(decideMailRetry(base,"retryable","garbage").status,"needs_review");
});
