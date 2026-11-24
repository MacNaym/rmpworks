import test from "node:test";
import assert from "node:assert/strict";
import {
  HOSTINGER_SMTP_HOST,HOSTINGER_SMTP_PORT,HOSTINGER_SMTP_TLS,
  HOSTINGER_SMTP_SENDER,makeHostingerSmtpTransport
} from "../functions/_lib/creator-hostinger-smtp-transport.ts";
const id="a".repeat(64);
const message={
  to:"reader@example.com",
  subject:"Conferma la tua email per ricevere la risorsa",
  text:"Testo della conferma",
  html:"<p>Conferma la tua email</p>"
};
test("transport exposes Hostinger published SMTP SSL configuration",()=>{
 assert.equal(HOSTINGER_SMTP_HOST,"smtp.hostinger.com");
 assert.equal(HOSTINGER_SMTP_PORT,465);
 assert.equal(HOSTINGER_SMTP_TLS,"implicit");
 assert.equal(HOSTINGER_SMTP_SENDER,"noreply@rmpworks.com");
});
test("SMTP submission never claims idempotency",()=>{
 const t=makeHostingerSmtpTransport({enabled:false});
 assert.equal(t.supportsIdempotency,false);
});
test("disabled transport cannot call SMTP submitter",async()=>{
 let called=0;const t=makeHostingerSmtpTransport({
  enabled:false,submit:async()=>{called++;return {state:"accepted"}}
 });
 assert.equal(await t.send(message,{eventId:id}),"permanent");
 assert.equal(called,0);
});
test("missing submitter safely prevents sending",async()=>{
 const t=makeHostingerSmtpTransport({enabled:true});
 assert.equal(await t.send(message,{eventId:id}),"permanent");
});
test("valid submission uses pinned Hostinger TLS settings and exact sender",async()=>{
 let calls=0;const t=makeHostingerSmtpTransport({
  enabled:true,replyTo:"support@rmpworks.com",
  submit:async v=>{
   calls++;
   assert.deepEqual({
    host:v.host,port:v.port,tls:v.tls,from:v.from,
    replyTo:v.replyTo,eventId:v.eventId
   },{host:"smtp.hostinger.com",port:465,tls:"implicit",
       from:"noreply@rmpworks.com",replyTo:"support@rmpworks.com",eventId:id});
   assert.deepEqual(v.message,message);
   return {state:"accepted"};
  }
 });
 assert.equal(await t.send(message,{eventId:id}),"accepted");
 assert.equal(calls,1);
});
test("explicit temporary and permanent SMTP rejections are classified",async()=>{
 const temp=makeHostingerSmtpTransport({enabled:true,
  submit:async()=>({state:"rejected",classification:"temporary"})});
 const perm=makeHostingerSmtpTransport({enabled:true,
  submit:async()=>({state:"rejected",classification:"permanent"})});
 assert.equal(await temp.send(message,{eventId:id}),"retryable");
 assert.equal(await perm.send(message,{eventId:id}),"permanent");
});
test("timeout/exception is ambiguous rather than retryable",async()=>{
 const t=makeHostingerSmtpTransport({enabled:true,
  submit:async()=>{throw new Error("Timeout after DATA accepted")}});
 assert.equal(await t.send(message,{eventId:id}),"ambiguous");
});
test("uncertain or malformed SMTP results are ambiguous",async()=>{
 for(const submit of [
  async()=>({state:"uncertain"}),
  async()=>({state:"rejected",classification:"unknown"}),
  async()=>({state:"unrecognized"}),
 ]){
  const t=makeHostingerSmtpTransport({enabled:true,submit});
  assert.equal(await t.send(message,{eventId:id}),"ambiguous");
 }
});
test("invalid event ID, injection and malformed recipient are rejected pre-submission",async()=>{
 let calls=0;const t=makeHostingerSmtpTransport({enabled:true,
  submit:async()=>{calls++;return {state:"accepted"}}});
 assert.equal(await t.send(message,{eventId:"bad"}),"permanent");
 assert.equal(await t.send({...message,to:"a@example.com\nBcc:evil@example.com"},{eventId:id}),"permanent");
 assert.equal(await t.send({...message,subject:"Hi\r\nBcc: evil"},{eventId:id}),"permanent");
 assert.equal(calls,0);
});
test("invalid reply-to address is rejected",async()=>{
 let calls=0;const t=makeHostingerSmtpTransport({
  enabled:true,replyTo:"injected@rmpworks.com\nCC:bad@example.com",
  submit:async()=>{calls++;return {state:"accepted"}}
 });
 assert.equal(await t.send(message,{eventId:id}),"permanent");
 assert.equal(calls,0);
});
