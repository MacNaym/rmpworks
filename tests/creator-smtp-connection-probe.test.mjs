import test from "node:test";
import assert from "node:assert/strict";
import {probeHostingerSmtp} from "../functions/_lib/creator-smtp-connection-probe.ts";

const enc=new TextEncoder();
function fake(lines,{opened=Promise.resolve({}),failWrite=false}={}){
 let n=0;
 let closes=0;
 const writes=[];
 const readable=new ReadableStream({
   pull(controller){
     if(n<lines.length)controller.enqueue(enc.encode(lines[n++]));
     else controller.close();
   }
 });
 const writable=new WritableStream({
   write(bytes){
     if(failWrite)throw Error("Connection reset");
     writes.push(new TextDecoder().decode(bytes));
   }
 });
 return {
   opened,readable,writable,
   close(){closes++;return Promise.resolve()},
   writes,
   get closes(){return closes}
 };
}
const successful=["220 smtp.hostinger.com ESMTP\r\n","250-smtp.hostinger.com\r\n250-AUTH PLAIN LOGIN\r\n250 OK\r\n","221 Bye\r\n"];
test("probe disabled by default and never connects",async()=>{
 let calls=0;
 const result=await probeHostingerSmtp({enabled:false,connect:()=>{calls++;throw Error("unexpected")}});
 assert.deepEqual(result,{status:"disabled",tlsOpened:false,greetingAccepted:false,ehloAccepted:false,phase:"disabled"});
 assert.equal(calls,0);
});
test("probe pins TLS Hostinger 465 and sends only EHLO and QUIT",async()=>{
 const s=fake(successful);
 let args;
 const r=await probeHostingerSmtp({
   enabled:true,
   connect:(address,options)=>{args={address,options};return s}
 });
 assert.deepEqual(args,{
   address:{hostname:"smtp.hostinger.com",port:465},
   options:{secureTransport:"on",allowHalfOpen:false}
 });
 assert.deepEqual(r,{status:"connected",phase:"complete",tlsOpened:true,greetingAccepted:true,ehloAccepted:true});
 assert.deepEqual(s.writes,["EHLO rmpworks.com\r\n","QUIT\r\n"]);
 assert.ok(s.closes>=1);
});
test("probe rejects non-220 greeting and sends no commands",async()=>{
 const s=fake(["421 Temporary unavailable\r\n"]);
 const r=await probeHostingerSmtp({enabled:true,connect:()=>s});
 assert.equal(r.status,"rejected");assert.equal(r.phase,"greeting");
 assert.deepEqual(s.writes,[]);
});
test("probe rejects non-250 EHLO without authentication or DATA",async()=>{
 const s=fake(["220 Ready\r\n","550 EHLO rejected\r\n"]);
 const r=await probeHostingerSmtp({enabled:true,connect:()=>s});
 assert.equal(r.status,"rejected");assert.equal(r.phase,"ehlo");
 assert.deepEqual(s.writes,["EHLO rmpworks.com\r\n"]);
});
test("failed TLS handshake is unavailable and has no SMTP commands",async()=>{
 const s=fake(successful,{opened:Promise.reject(Error("secret hostname information"))});
 const r=await probeHostingerSmtp({enabled:true,connect:()=>s});
 assert.deepEqual(r,{status:"unavailable",phase:"connect",tlsOpened:false,greetingAccepted:false,ehloAccepted:false});
 assert.deepEqual(s.writes,[]);
});
test("broken server greeting is unavailable without disclosing remote text",async()=>{
 const s=fake(["220-Hello\r\n","550 Other code\r\n"]);
 const r=await probeHostingerSmtp({enabled:true,connect:()=>s});
 assert.equal(r.status,"unavailable");assert.equal(r.phase,"greeting");
 assert.equal(JSON.stringify(r).includes("Hello"),false);
 assert.deepEqual(s.writes,[]);
});
test("EHLO disconnect fails closed and returns only sanitized phase",async()=>{
 const s=fake(["220 Ready\r\n"]);
 const r=await probeHostingerSmtp({enabled:true,connect:()=>s});
 assert.equal(r.status,"unavailable");
 assert.equal(r.greetingAccepted,true);
 assert.equal(r.ehloAccepted,false);
 assert.equal(r.phase,"ehlo");
});
test("a QUIT read failure does not conceal prior successful EHLO",async()=>{
 const s=fake(["220 Ready\r\n","250 OK\r\n"]);
 const r=await probeHostingerSmtp({enabled:true,connect:()=>s});
 assert.equal(r.status,"connected");
 assert.deepEqual(s.writes,["EHLO rmpworks.com\r\n","QUIT\r\n"]);
});
test("no connector fails closed",async()=>{
 const r=await probeHostingerSmtp({enabled:true,connect:null});
 assert.equal(r.status,"unavailable");
 assert.equal(r.phase,"connect");
});
test("invalid timeout is rejected before opening a socket",async()=>{
 let called=0;
 const r=await probeHostingerSmtp({enabled:true,connect:()=>{called++;return fake(successful)},timeoutMs:20000});
 assert.equal(r.status,"unavailable");assert.equal(r.phase,"connect");
 assert.equal(called,0);
});
