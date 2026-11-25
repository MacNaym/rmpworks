import test from "node:test";
import assert from "node:assert/strict";
import {privateAuthorized,readJson,decodedAES,dbReady} from "../functions/_lib/creator-private-route-guards.ts";
import {onRequestPost as intake} from "../functions/api/creator-private-lead-intake.ts";
import {onRequestPost as confirm,onRequestGet as confirmGet} from "../functions/api/creator-private-confirm-email.ts";
import {onRequestPost as dispatch,onRequestGet as dispatchGet} from "../functions/api/creator-private-outbox-dispatch.ts";
const privateKey="private-key-"+("Z".repeat(48));
const env={RMP_CREATOR_PRIVATE_TRIAL:"true",RMP_CREATOR_PRIVATE_KEY:privateKey,
 RMP_CREATOR_INTAKE_ENABLED:"true",RMP_CREATOR_CONFIRMATION_ENABLED:"true",
 RMP_CONFIRMATION_DISPATCH_ENABLED:"true",
 RMP_SUPABASE_URL:"https://sample.supabase.co",
 RMP_SUPABASE_SERVICE_KEY:"service-role-mock-secret-string-123456789",
 RMP_OUTBOX_KEY_B64URL:Buffer.from(new Uint8Array(32).fill(7)).toString("base64url"),
 RMP_OUTBOX_KEY_ID:"mail-v1",RESEND_API_KEY:"re_"+("a".repeat(32)),
 RMP_RESEND_DOMAIN_VERIFIED:"true"};
function ctx(data,{method="POST",origin="https://rmpworks.com",url="https://rmpworks.com/api/creator-private-lead-intake",headers={},config=env}={}){
 return {env:config,request:new Request(url,{method,headers:{
  origin,"x-rmp-private-key":privateKey,
  "content-type":"application/json",...headers},...method==="POST"?{body:JSON.stringify(data)}:{}})};
}
test("missing private trial flag blocks valid-looking request",async()=>{
 assert.equal(await privateAuthorized(ctx({}, {config:{...env,RMP_CREATOR_PRIVATE_TRIAL:"false"}})),false);
});
test("wrong operator secret blocked",async()=>{
 assert.equal(await privateAuthorized(ctx({},{headers:{"x-rmp-private-key":"X".repeat(48)}})),false);
});
test("missing Origin and other-site Origin are rejected",async()=>{
 assert.equal(await privateAuthorized(ctx({},{headers:{origin:""}})),false);
 assert.equal(await privateAuthorized(ctx({},{origin:"https://evil.example"})),false);
});
test("untrusted URL host and HTTP scheme fail closed",async()=>{
 assert.equal(await privateAuthorized(ctx({},{url:"https://fake.example/api/creator-private-lead-intake",origin:"https://fake.example"})),false);
 assert.equal(await privateAuthorized(ctx({},{url:"http://rmpworks.com/api/creator-private-lead-intake",origin:"http://rmpworks.com"})),false);
});
test("trusted production and preview host and secret pass",async()=>{
 assert.equal(await privateAuthorized(ctx({})),true);
 assert.equal(await privateAuthorized(ctx({},{url:"https://rmpworks.pages.dev/api/test",origin:"https://rmpworks.pages.dev"})),true);
});
test("JSON request input bounded and only objects allowed",async()=>{
 assert.deepEqual(await readJson(ctx({hello:"world"}),1024),{hello:"world"});
 assert.equal(await readJson(ctx({hello:"world"}),5),null);
 assert.equal(await readJson(ctx({hello:"world"},{headers:{"content-type":"text/plain"}}),1024),null);
});
test("AES and Supabase bindings fail closed without private secrets",()=>{
 assert.equal(decodedAES(env).length,32);
 assert.equal(decodedAES({...env,RMP_OUTBOX_KEY_B64URL:"bad"}),null);
 assert.equal(dbReady(env),true);
 assert.equal(dbReady({...env,RMP_SUPABASE_SERVICE_KEY:""}),false);
});
test("private intake anonymous request does no database work",async()=>{
 const response=await intake(ctx({},{headers:{"x-rmp-private-key":"wrong"}}));
 assert.equal(response.status,404);
});
test("private intake disabled flag returns 503 before body parse and Supabase",async()=>{
 const response=await intake(ctx({},{config:{...env,RMP_CREATOR_INTAKE_ENABLED:"false"}}));
 assert.equal(response.status,503);
});
test("private intake invalid body rejected before remote lookups",async()=>{
 const response=await intake(ctx({creator_id:"bad",magnet_id:"bad"}));
 assert.equal(response.status,400);
});
test("private confirm disabled and invalid token do not touch Supabase",async()=>{
 const disabled=await confirm(ctx({token:"bad"},{config:{...env,RMP_CREATOR_CONFIRMATION_ENABLED:"false"}}));
 assert.equal(disabled.status,503);
 const invalid=await confirm(ctx({token:"bad"}));
 assert.equal(invalid.status,200);
});
test("GET email redemption and GET outbox dispatch are never permitted",async()=>{
 assert.equal((await confirmGet()).status,405);
 assert.equal((await dispatchGet()).status,405);
});
test("private dispatch wrong token and disabled dispatch fail closed",async()=>{
 const unauthorized=await dispatch(ctx({},{headers:{"x-rmp-private-key":"wrong"}}));
 assert.equal(unauthorized.status,404);
 const disabled=await dispatch(ctx({},{config:{...env,RMP_CONFIRMATION_DISPATCH_ENABLED:"false"}}));
 assert.equal(disabled.status,503);
});
