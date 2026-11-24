import test from "node:test";
import assert from "node:assert/strict";
import {renderVerifiedLeadMagnet} from "../functions/_lib/creator-resource-delivery.ts";
const creatorId="123e4567-e89b-42d3-a456-426614174000";
const magnetId="123e4567-e89b-42d3-a456-426614174001";
const access={releaseEnabled:true,creatorPublished:true,emailVerified:true,downloadGrantValid:true,tenantId:creatorId,magnetId};
const resource={creatorId,magnetId,creatorName:"Creator",format:"checklist",title:"La mia checklist",subtitle:"Per iniziare",content:"Questa è una checklist approvata con istruzioni dettagliate e sicure, realizzata per un test isolato. La risorsa non è pubblica.",status:"approved"};
test("private delivery rejects absent release or missing verification/grant",()=>{
 for(const k of ["releaseEnabled","creatorPublished","emailVerified","downloadGrantValid"]){
  assert.equal(renderVerifiedLeadMagnet({...access,[k]:false},resource).status,404);
 }
});
test("cross-creator and cross-magnet references never return a resource",()=>{
 const other="123e4567-e89b-42d3-a456-426614174010";
 assert.equal(renderVerifiedLeadMagnet({...access,tenantId:other},resource).status,404);
 assert.equal(renderVerifiedLeadMagnet({...access,magnetId:other},resource).status,404);
});
test("draft or invalid magnet content never gets delivered",()=>{
 assert.equal(renderVerifiedLeadMagnet(access,{...resource,status:"draft"}).status,404);
 assert.equal(renderVerifiedLeadMagnet(access,{...resource,content:"short"}).status,404);
 assert.equal(renderVerifiedLeadMagnet(access,{...resource,format:"other"}).status,404);
});
test("approved private resource is delivered with no-store and sandbox CSP",async()=>{
 const res=renderVerifiedLeadMagnet(access,resource);
 assert.equal(res.status,200);
 assert.match(res.headers.get("content-disposition"),/attachment/);
 assert.match(res.headers.get("cache-control"),/no-store/);
 assert.match(res.headers.get("content-security-policy"),/sandbox/);
 assert.match(await res.text(),/La mia checklist/);
});
test("resource body and title are HTML-escaped",async()=>{
 const res=renderVerifiedLeadMagnet(access,{...resource,title:"<script>alert(1)</script>",content:resource.content+"<img src=x onerror=alert(1)>"});
 const html=await res.text();
 assert.equal(res.status,200);
 assert.ok(!html.includes("<script>"));
 assert.ok(!html.includes("<img src=x"));
 assert.match(html,/&lt;script&gt;/);
 assert.match(html,/&lt;img/);
});
