import test from "node:test";
import assert from "node:assert/strict";
import {evaluatePublicLead} from "../functions/_lib/public-lead-pipeline.ts";
import {consumeCreatorRateLimit} from "../functions/_lib/creator-rate-limit.ts";
import {verifyCreatorTurnstile} from "../functions/_lib/creator-turnstile.ts";
import {stagePublicCreatorLead} from "../functions/_lib/public-lead-inbox.ts";
import {readFileSync} from "node:fs";

const tenantId="123e4567-e89b-42d3-a456-426614174000";
const magnetId="123e4567-e89b-42d3-a456-426614174001";
const context={releaseEnabled:true,creatorPublished:true,creatorApproved:true,privacyReady:true,tenantId};
const input={email:"USER@example.com",fullName:"User",consentToDelivery:true,marketingOptIn:false,honeypot:"",turnstileToken:"valid-token"};
const secret="testing-secret-that-exceeds-32-chars-for-HMAC";

function harness({turnstile=true,inboxStatus=201,denyAt=3}={}){
 const events=[];let hits=0;
 const db={prepare(sql){
  assert.match(sql,/ON CONFLICT/);
  return {bind(...params){return {async first(){hits++;events.push("rate");return hits<=denyAt?{hits}:null}}}};
 }};
 const challenge=async()=>{events.push("turnstile");return Response.json({success:turnstile,hostname:"rmpworks.com",action:"creator_lead"})};
 const writer=async(_url,options)=>{
  events.push("write");
  const body=JSON.parse(options.body);
  assert.equal(body.creator_account_id,tenantId);
  assert.equal(body.magnet_id,magnetId);
  assert.equal(body.status,"pending_verification");
  assert.equal(body.marketing_opt_in,false);
  return new Response(null,{status:inboxStatus});
 };
 const checks={
  rateLimit:async()=> (await consumeCreatorRateLimit({db,secret,clientIp:"203.0.113.12",tenantId,action:"creator_lead",maxRequests:3,windowSeconds:60,nowMs:120000})).allowed,
  verifyTurnstile:async token=> (await verifyCreatorTurnstile({token,secret,expectedHostname:"rmpworks.com",expectedAction:"creator_lead",fetcher:challenge})).ok,
  deliver:async lead=>(await stagePublicCreatorLead({
   supabaseUrl:"https://example.supabase.co",serverSecret:secret,releaseAuthorized:true,
  },{
   tenantId:lead.tenantId,magnetId,email:lead.email,fullName:lead.fullName,marketingOptIn:lead.marketingOptIn,
   privacyVersion:"v1",deliveryConsentText:"Consento alla consegna della risorsa.",
  },writer))==="accepted",
 };
 return {events,checks};
}

test("integrated: no release means no rate, challenge or database calls",async()=>{
 const h=harness();
 const result=await evaluatePublicLead({...context,releaseEnabled:false},input,h.checks);
 assert.deepEqual(result,{ok:false,status:404});
 assert.deepEqual(h.events,[]);
});
test("integrated: verified visitor reaches only pending inbox writer",async()=>{
 const h=harness();
 const result=await evaluatePublicLead(context,input,h.checks);
 assert.deepEqual(result,{ok:true,status:202});
 assert.deepEqual(h.events,["rate","turnstile","write"]);
});
test("integrated: Turnstile failure stops before inbox write",async()=>{
 const h=harness({turnstile:false});
 const result=await evaluatePublicLead(context,input,h.checks);
 assert.deepEqual(result,{ok:false,status:404});
 assert.deepEqual(h.events,["rate","turnstile"]);
});
test("integrated: rate exhausted blocks challenge and database",async()=>{
 const h=harness({denyAt:0});
 const result=await evaluatePublicLead(context,input,h.checks);
 assert.deepEqual(result,{ok:false,status:429});
 assert.deepEqual(h.events,["rate"]);
});
test("integrated: storage denial never reports success",async()=>{
 const h=harness({inboxStatus:403});
 const result=await evaluatePublicLead(context,input,h.checks);
 assert.deepEqual(result,{ok:false,status:503});
 assert.deepEqual(h.events,["rate","turnstile","write"]);
});
test("inbox migration preserves RLS and no public table access",()=>{
 const sql=readFileSync(new URL("../docs/creator-studio/2026-11-24-b6-public-inbox-proposal.sql",import.meta.url),"utf8");
 assert.match(sql,/ALTER TABLE public\.creator_public_lead_inbox ENABLE ROW LEVEL SECURITY/i);
 assert.match(sql,/REVOKE ALL ON public\.creator_public_lead_inbox FROM PUBLIC, anon, authenticated/i);
 assert.match(sql,/BEFORE INSERT ON public\.creator_public_lead_inbox/i);
 assert.match(sql,/m\.creator_account_id = s\.creator_account_id/i);
 assert.match(sql,/m\.status = 'approved'/i);
});
