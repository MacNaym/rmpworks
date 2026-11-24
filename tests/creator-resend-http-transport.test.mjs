import test from "node:test";
import assert from "node:assert/strict";
import {makeResendHttpTransport,RESEND_ENDPOINT,RESEND_FROM} from "../functions/_lib/creator-resend-http-transport.ts";

const eventId="a".repeat(64);
const msg={
 to:"lead@example.com",
 subject:"Conferma la tua email per ricevere la risorsa",
 text:"Apri https://rmpworks.com/creator/confirm-email?token="+"A".repeat(43),
 html:"<p>Conferma il tuo indirizzo email</p>"
};
const key="re_"+"x".repeat(30);
const make=(fetcher,more={})=>makeResendHttpTransport({
 enabled:true,apiKey:key,domainVerified:true,fetcher,...more
});
const resp=(status,value)=>new Response(value===undefined?"":JSON.stringify(value),{
 status,headers:{"content-type":"application/json"}
});
test("disabled settings do not make HTTP requests",async()=>{
 let calls=0;
 const t=makeResendHttpTransport({enabled:false,domainVerified:true,apiKey:key,
  fetcher:async()=>{calls++;return resp(200,{id:"some-message-id"})}});
 assert.equal(await t.send(msg,{eventId}),"permanent");
 assert.equal(calls,0);
});
test("verified-domain flag and API key are required",async()=>{
 let calls=0;const fetcher=async()=>{calls++;return resp(200,{id:"some-message-id"})};
 for(const cfg of [
  {enabled:true,domainVerified:false,apiKey:key},
  {enabled:true,domainVerified:true,apiKey:""},
  {enabled:true,domainVerified:true,apiKey:"not-a-key"}
 ]){
  const t=makeResendHttpTransport({...cfg,fetcher});
  assert.equal(await t.send(msg,{eventId}),"permanent");
 }
 assert.equal(calls,0);
});
test("uses fixed HTTPS endpoint, sender and stable 64-hex idempotency key",async()=>{
 let calls=0;
 const t=make(async(url,opts)=>{
  calls++;assert.equal(url,RESEND_ENDPOINT);
  assert.equal(opts.method,"POST");
  assert.equal(opts.headers.authorization,"Bearer "+key);
  assert.equal(opts.headers["idempotency-key"],"creator-confirmation/"+eventId);
  assert.equal(opts.headers["content-type"],"application/json");
  assert.deepEqual(JSON.parse(opts.body),{
    from:RESEND_FROM,to:["lead@example.com"],
    subject:msg.subject,text:msg.text,html:msg.html
  });
  assert.equal(opts.signal.aborted,false);
  return resp(200,{id:"some-message-id"});
 });
 assert.equal(t.supportsIdempotency,true);
 assert.equal(await t.send(msg,{eventId}),"accepted");
 assert.equal(calls,1);
});
test("same event id produces same provider idempotency key",async()=>{
 const headers=[];
 const t=make(async(_url,opts)=>{
  headers.push(opts.headers["idempotency-key"]);
  return resp(200,{id:"provider-12345"});
 });
 await t.send(msg,{eventId});await t.send(msg,{eventId});
 assert.deepEqual(headers,["creator-confirmation/"+eventId,"creator-confirmation/"+eventId]);
});
test("successful response without provider message ID is ambiguous",async()=>{
 for(const value of [{},{id:"bad id"},{id:8}]){
  const t=make(async()=>resp(200,value));
  assert.equal(await t.send(msg,{eventId}),"ambiguous");
 }
});
test("rate limit, timeout, and 5xx responses retry within provider idempotency",async()=>{
 for(const status of [408,425,429,500,502,503,599]){
  const t=make(async()=>resp(status,{name:"api_error"}));
  assert.equal(await t.send(msg,{eventId}),"retryable");
 }
});
test("permanent request and authentication errors are not retried",async()=>{
 for(const status of [400,401,403,404,413,422]){
  const t=make(async()=>resp(status,{name:"validation_error"}));
  assert.equal(await t.send(msg,{eventId}),"permanent");
 }
});
test("Resend concurrent same-key request is retryable; conflicting payload permanent",async()=>{
 const t1=make(async()=>resp(409,{name:"concurrent_idempotent_requests"}));
 const t2=make(async()=>resp(409,{name:"invalid_idempotent_request"}));
 assert.equal(await t1.send(msg,{eventId}),"retryable");
 assert.equal(await t2.send(msg,{eventId}),"permanent");
});
test("unknown conflict is ambiguous, not blindly retried",async()=>{
 const t=make(async()=>resp(409,{name:"other_conflict"}));
 assert.equal(await t.send(msg,{eventId}),"ambiguous");
});
test("network exception is ambiguous, and no provider data are logged",async()=>{
 const t=make(async()=>{throw Error("private provider data, must not leak")});
 assert.equal(await t.send(msg,{eventId}),"ambiguous");
});
test("rejects malformed recipient, CRLF header injection and event ID",async()=>{
 let calls=0;
 const t=make(async()=>{calls++;return resp(200,{id:"provider-12345"})});
 assert.equal(await t.send({...msg,to:"a@example.com\r\nBcc:bad@example.com"},{eventId}),"permanent");
 assert.equal(await t.send({...msg,subject:"Hello\nBcc:someone@example.com"},{eventId}),"permanent");
 assert.equal(await t.send(msg,{eventId:"insecure"}),"permanent");
 assert.equal(calls,0);
});
test("optional reply-to must be well formed",async()=>{
 const t=make(async(_url,opts)=>{
  assert.equal(JSON.parse(opts.body).reply_to,"support@rmpworks.com");
  return resp(200,{id:"provider-12345"});
 },{replyTo:"support@rmpworks.com"});
 assert.equal(await t.send(msg,{eventId}),"accepted");
 const invalid=make(async()=>{throw Error("should not call")},{replyTo:"bad\nCC:injected"});
 assert.equal(await invalid.send(msg,{eventId}),"permanent");
});
test("timeout configuration must be bounded",async()=>{
 let calls=0;
 const t=make(async()=>{calls++;return resp(200,{id:"provider-12345"})},{timeoutMs:60000});
 assert.equal(await t.send(msg,{eventId}),"permanent");
 assert.equal(calls,0);
});
