import test from "node:test";
import assert from "node:assert/strict";
import {issueEmailVerification,sha256Token,redeemEmailVerification,verificationLink,VERIFICATION_TTL_SECONDS} from "../functions/_lib/creator-email-verification.ts";

test("cryptographically random tokens are unique and raw tokens are never their stored digests",async()=>{
 const [a,b]=await Promise.all([issueEmailVerification(100000),issueEmailVerification(100000)]);
 assert.match(a.token,/^[A-Za-z0-9_-]{43}$/);
 assert.match(a.tokenDigest,/^[a-f0-9]{64}$/);
 assert.notEqual(a.token,b.token);
 assert.notEqual(a.tokenDigest,b.tokenDigest);
 assert.equal(await sha256Token(a.token),a.tokenDigest);
 assert.notEqual(a.token,a.tokenDigest);
});
test("verification challenge expires in exactly fifteen minutes",async()=>{
 const now=Date.parse("2026-11-24T10:00:00.000Z");
 const issue=await issueEmailVerification(now);
 assert.equal(VERIFICATION_TTL_SECONDS,900);
 assert.equal(issue.expiresAt,"2026-11-24T10:15:00.000Z");
});
test("malformed tokens are denied without database calls",async()=>{
 let calls=0;const consume=async()=>{calls++;return "consumed"};
 for(const token of [null,"", "abc","x".repeat(200),"!@#$",undefined]){
  assert.equal(await redeemEmailVerification(token,consume,100000),"invalid");
 }
 assert.equal(calls,0);
});
test("a correctly formatted token is passed by digest, not raw token",async()=>{
 const issued=await issueEmailVerification(100000);
 let calls=0;
 const result=await redeemEmailVerification(issued.token,async args=>{
  calls++;
  assert.equal(args.tokenDigest,issued.tokenDigest);
  assert.equal(args.nowIso,"1970-01-01T00:01:41.000Z");
  assert.equal(Object.hasOwn(args,"token"),false);
  return "consumed";
 },101000);
 assert.equal(result,"verified");
 assert.equal(calls,1);
});
test("invalid, expired and unavailable consumption never count as verified",async()=>{
 const issued=await issueEmailVerification(100000);
 for(const status of ["invalid","expired"]){
  assert.equal(await redeemEmailVerification(issued.token,async()=>status,101000),"invalid");
 }
 assert.equal(await redeemEmailVerification(issued.token,async()=>{throw Error("storage down")},101000),"unavailable");
 assert.equal(await redeemEmailVerification(issued.token,async()=>null,101000),"unavailable");
});
test("one-time consumption must be atomic: a replay is rejected by the storage adapter",async()=>{
 const issued=await issueEmailVerification(100000);
 const consumed=new Set();
 const consume=async ({tokenDigest})=>{
  if(consumed.has(tokenDigest))return "invalid";
  consumed.add(tokenDigest);
  return "consumed";
 };
 assert.equal(await redeemEmailVerification(issued.token,consume,101000),"verified");
 assert.equal(await redeemEmailVerification(issued.token,consume,101001),"invalid");
});
test("verification links are limited to the approved HTTPS host and path",async()=>{
 const issued=await issueEmailVerification(100000);
 assert.equal(verificationLink("https://rmpworks.com",issued.token),`https://rmpworks.com/creator/confirm-email?token=${issued.token}`);
 for(const bad of ["http://rmpworks.com","https://evil.example","https://rmpworks.com.evil.example","https://rmpworks.com:8443","https://user:pass@rmpworks.com","https://rmpworks.com/other"]){
  assert.throws(()=>verificationLink(bad,issued.token));
 }
});
