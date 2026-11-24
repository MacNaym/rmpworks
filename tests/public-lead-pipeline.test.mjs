import test from "node:test";
import assert from "node:assert/strict";
import {evaluatePublicLead} from "../functions/_lib/public-lead-pipeline.ts";
const tenantId="123e4567-e89b-42d3-a456-426614174000";
const context={releaseEnabled:true,creatorPublished:true,creatorApproved:true,privacyReady:true,tenantId};
const input={email:"TEST@Example.com",fullName:"Creator Fan",consentToDelivery:true,marketingOptIn:false,honeypot:"",turnstileToken:"test-valid"};
function checks() {
 const calls=[];
 return {calls, deps:{
  rateLimit:async()=>{calls.push("rate");return true},
  verifyTurnstile:async()=>{calls.push("turnstile");return true},
  deliver:async lead=>{calls.push("deliver");assert.equal(lead.email,"test@example.com");return true}
 }};
}
test("public release denies every missing approval without invoking dependencies",async()=>{
 for(const flag of ["releaseEnabled","creatorPublished","creatorApproved","privacyReady"]){
  const c=checks(),out=await evaluatePublicLead({...context,[flag]:false},input,c.deps);
  assert.deepEqual(out,{ok:false,status:404});assert.deepEqual(c.calls,[]);
 }
});
test("bad tenant IDs and malformed form fields fail before any side effects",async()=>{
 const examples=[{ctx:{...context,tenantId:"wrong"},input},{ctx:context,input:{...input,consentToDelivery:false}},{ctx:context,input:{...input,honeypot:"spam"}},{ctx:context,input:{...input,email:"nope"}},{ctx:context,input:{...input,marketingOptIn:"yes"}},{ctx:context,input:{...input,turnstileToken:""}}];
 for(const e of examples){const c=checks();assert.equal((await evaluatePublicLead(e.ctx,e.input,c.deps)).status,404);assert.deepEqual(c.calls,[])}
});
test("rate limit is checked before Turnstile; rejection prevents delivery",async()=>{
 const c=checks();c.deps.rateLimit=async()=>{c.calls.push("rate");return false};
 assert.deepEqual(await evaluatePublicLead(context,input,c.deps),{ok:false,status:429});
 assert.deepEqual(c.calls,["rate"]);
});
test("Turnstile rejection prevents delivery",async()=>{
 const c=checks();c.deps.verifyTurnstile=async()=>{c.calls.push("turnstile");return false};
 assert.equal((await evaluatePublicLead(context,input,c.deps)).status,404);
 assert.deepEqual(c.calls,["rate","turnstile"]);
});
test("approved request calls dependencies in order, marketing consent remains separate",async()=>{
 const c=checks();c.deps.deliver=async lead=>{c.calls.push("deliver");assert.equal(lead.marketingOptIn,false);assert.equal(lead.email,"test@example.com");return true};
 assert.deepEqual(await evaluatePublicLead(context,input,c.deps),{ok:true,status:202});
 assert.deepEqual(c.calls,["rate","turnstile","deliver"]);
});
test("unexpected errors and failed delivery never report success",async()=>{
 const c=checks();c.deps.verifyTurnstile=async()=>{throw Error("network")};
 assert.deepEqual(await evaluatePublicLead(context,input,c.deps),{ok:false,status:503});
 const d=checks();d.deps.deliver=async()=>false;
 assert.deepEqual(await evaluatePublicLead(context,input,d.deps),{ok:false,status:503});
});
