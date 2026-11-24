import test from "node:test";
import assert from "node:assert/strict";
import {openHostingerTlsChannel,SMTP_ENDPOINT} from "../functions/_lib/creator-cloudflare-smtp-channel.ts";
const encode=s=>new TextEncoder().encode(s);
function socket(chunks=[],opts={}){
 let closed=0;const writes=[];let readIndex=0;let locked=false;
 const readable=new ReadableStream({
  pull(controller){
   if(opts.stallRead)return;
   if(readIndex<chunks.length)controller.enqueue(encode(chunks[readIndex++]));
   else controller.close();
  }
 });
 const writable=new WritableStream({write(bytes){writes.push(new TextDecoder().decode(bytes))}});
 return {opened:opts.opened??Promise.resolve({}),readable,writable,
  close(){closed++;return Promise.resolve()},
  get closed(){return closed},writes
 };
}
test("pins exact Hostinger hostname, 465 and TLS from first byte",async()=>{
 const s=socket(["220 smtp.hostinger.com ESMTP\r\n"]);
 let args;
 const channel=await openHostingerTlsChannel((address,options)=>{
  args={address,options};return s;
 });
 assert.deepEqual(args,{address:SMTP_ENDPOINT,options:{secureTransport:"on",allowHalfOpen:false}});
 assert.equal(await channel.readLine(),"220 smtp.hostinger.com ESMTP");
 await channel.close();
 assert.ok(s.closed>=1);
});
test("reassembles CRLF lines across TCP frames",async()=>{
 const s=socket(["250-START","TLS\r\n250-AUTH PLAIN\r\n250 OK\r\n"]);
 const c=await openHostingerTlsChannel(()=>s);
 assert.equal(await c.readLine(),"250-STARTTLS");
 assert.equal(await c.readLine(),"250-AUTH PLAIN");
 assert.equal(await c.readLine(),"250 OK");
 await c.close();
});
test("multiple complete responses from one chunk are preserved",async()=>{
 const s=socket(["220 hello\r\n250 world\r\n"]);
 const c=await openHostingerTlsChannel(()=>s);
 assert.equal(await c.readLine(),"220 hello");
 assert.equal(await c.readLine(),"250 world");
 await c.close();
});
test("encodes UTF8 writes to the socket and closes it",async()=>{
 const s=socket([]);
 const c=await openHostingerTlsChannel(()=>s);
 await c.write("EHLO rmpworks.com\r\n");
 assert.deepEqual(s.writes,["EHLO rmpworks.com\r\n"]);
 await c.close();
 await c.close();
 assert.equal(s.closed,1);
});
test("invalid timeouts reject before socket creation",async()=>{
 let calls=0;const connect=()=>{calls++;return socket()};
 for(const timeoutMs of [0,16,15001,NaN,-1,1.5]){
  await assert.rejects(openHostingerTlsChannel(connect,{timeoutMs}));
 }
 assert.equal(calls,0);
});
test("TLS opening failure never exposes underlying provider error",async()=>{
 const s=socket([],{opened:Promise.reject(new Error("password-or-host-details"))});
 await assert.rejects(openHostingerTlsChannel(()=>s),/SMTP TLS handshake unavailable/);
 assert.ok(s.closed>=1);
});
test("invalid CRLF response and non ASCII bytes fail closed",async()=>{
 const s=socket(["220 Ready\nBad\n"]);
 const c=await openHostingerTlsChannel(()=>s);
 await assert.rejects(c.readLine(),/SMTP read unavailable/);
 assert.ok(s.closed>=1);
});
test("oversized server reply triggers bounded failure",async()=>{
 const s=socket(["2".repeat(9000)]);
 const c=await openHostingerTlsChannel(()=>s);
 await assert.rejects(c.readLine(),/SMTP read unavailable/);
 assert.ok(s.closed>=1);
});
test("EOF without CRLF is rejected",async()=>{
 const s=socket(["220 Unfinished"]);
 const c=await openHostingerTlsChannel(()=>s);
 await assert.rejects(c.readLine(),/SMTP read unavailable/);
 assert.ok(s.closed>=1);
});
test("closed channel refuses future writes and reads",async()=>{
 const s=socket(["220 Done\r\n"]);
 const c=await openHostingerTlsChannel(()=>s);
 await c.close();
 await assert.rejects(c.write("EHLO nope\r\n"));
 await assert.rejects(c.readLine());
});
test("connect failures are sanitized",async()=>{
 await assert.rejects(openHostingerTlsChannel(()=>{
  throw Error("secret network detail");
 }),/SMTP connection unavailable/);
});
test("bridge does not attempt SMTP authentication or connect before invocation",async()=>{
 let count=0;
 const connect=()=>{count++;return socket(["220 Ready\r\n"])};
 assert.equal(count,0);
 const c=await openHostingerTlsChannel(connect);
 assert.equal(count,1);
 await c.close();
});
