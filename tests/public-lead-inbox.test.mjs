import test from "node:test";
import assert from "node:assert/strict";
import {stagePublicCreatorLead} from "../functions/_lib/public-lead-inbox.ts";

const tenantId="123e4567-e89b-42d3-a456-426614174000";
const magnetId="123e4567-e89b-42d3-a456-426614174001";
const env={
 supabaseUrl:"https://demo-project.supabase.co",
 serverSecret:"test-only-backend-secret-strong-1234567890",
 releaseAuthorized:true
};
const lead={
 tenantId,magnetId,email:" TEST@Example.org ",fullName:"Test User",
 marketingOptIn:false,privacyVersion:"v1",
 deliveryConsentText:"Accetto la consegna della risorsa richiesta."
};
test("does not call Supabase without server release authorization",async()=>{
 let calls=0;
 const r=await stagePublicCreatorLead({...env,releaseAuthorized:false},lead,async()=>{calls++;return new Response(null,{status:201})});
 assert.equal(r,"closed");assert.equal(calls,0);
});
test("missing secret, invalid URL and invalid IDs fail closed",async()=>{
 let calls=0;const fetcher=async()=>{calls++;return new Response(null,{status:201})};
 assert.equal(await stagePublicCreatorLead({...env,serverSecret:undefined},lead,fetcher),"unavailable");
 assert.equal(await stagePublicCreatorLead({...env,supabaseUrl:"https://attacker.example"},lead,fetcher),"unavailable");
 assert.equal(await stagePublicCreatorLead(env,{...lead,tenantId:"other"},fetcher),"closed");
 assert.equal(await stagePublicCreatorLead(env,{...lead,magnetId:"other"},fetcher),"closed");
 assert.equal(calls,0);
});
test("consent, email and privacy version are required",async()=>{
 let calls=0;const fetcher=async()=>{calls++;return new Response(null,{status:201})};
 for(const item of [
  {...lead,email:"invalid"},
  {...lead,privacyVersion:""},
  {...lead,deliveryConsentText:"short"},
  {...lead,marketingOptIn:"true"},
 ]){
  assert.equal(await stagePublicCreatorLead(env,item,fetcher),"closed");
 }
 assert.equal(calls,0);
});
test("successful write is pending only, scoped to tenant and magnet",async()=>{
 let called=false;
 const r=await stagePublicCreatorLead(env,lead,async(url,options)=>{
  called=true;
  assert.equal(url,"https://demo-project.supabase.co/rest/v1/creator_public_lead_inbox");
  assert.equal(options.method,"POST");
  assert.equal(options.headers.apikey,env.serverSecret);
  assert.equal(options.headers.authorization,"Bearer "+env.serverSecret);
  const body=JSON.parse(options.body);
  assert.deepEqual(body,{
   creator_account_id:tenantId,magnet_id:magnetId,
   email:"test@example.org",full_name:"Test User",
   marketing_opt_in:false,privacy_version:"v1",
   delivery_consent_text:lead.deliveryConsentText,
   status:"pending_verification",
  });
  return new Response(null,{status:201});
 });
 assert.equal(r,"accepted");assert.equal(called,true);
});
test("only named unique constraint counts as a duplicate; foreign key and storage failures reject",async()=>{
 const unique=()=>Response.json({
  code:"23505",message:'duplicate key value violates unique constraint "creator_public_lead_inbox_unique_lead"'
 },{status:409});
 const fk=()=>Response.json({code:"23503",message:"foreign key violation"},{status:409});
 assert.equal(await stagePublicCreatorLead(env,lead,async()=>unique()),"duplicate");
 assert.equal(await stagePublicCreatorLead(env,lead,async()=>fk()),"unavailable");
 assert.equal(await stagePublicCreatorLead(env,lead,async()=>new Response(null,{status:409})),"unavailable");
 assert.equal(await stagePublicCreatorLead(env,lead,async()=>new Response(null,{status:403})),"unavailable");
 assert.equal(await stagePublicCreatorLead(env,lead,async()=>{throw Error("network")}),"unavailable");
});
