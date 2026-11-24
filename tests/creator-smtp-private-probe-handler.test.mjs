import test from "node:test";
import assert from "node:assert/strict";
import {handleProbeRequest} from "../diagnostics/_lib/smtp-probe-handler.ts";
const key="a".repeat(64);
const env={RMP_SMTP_PROBE_ENABLED:"true",RMP_SMTP_PROBE_KEY:key};
const enc=new TextEncoder();
function smtpSocket(){
 const msgs=["220 smtp.hostinger.com\r\n","250-mail\r\n250 OK\r\n","221 Bye\r\n"];
 let i=0,closed=0;const writes=[];
 const readable=new ReadableStream({
  pull(controller){if(i<msgs.length)controller.enqueue(enc.encode(msgs[i++]));else controller.close()}
 });
 const writable=new WritableStream({write(bytes){writes.push(new TextDecoder().decode(bytes))}});
 return {opened:Promise.resolve({}),readable,writable,
  close(){closed++;return Promise.resolve()},writes,get closed(){return closed}};
}
function request(method="POST",headers={}){return new Request("https://probe.example.invalid/",{method,headers})}
test("disabled flag prevents socket access, even if secret supplied",async()=>{
 let count=0;
 const res=await handleProbeRequest(request("POST",{"x-rmp-probe-key":key}),
  {...env,RMP_SMTP_PROBE_ENABLED:"false"},()=>{count++;return smtpSocket()});
 assert.equal(res.status,404);assert.equal(count,0);
});
test("GET request is rejected without opening TCP socket",async()=>{
 let count=0;
 const res=await handleProbeRequest(request("GET",{"x-rmp-probe-key":key}),env,()=>{count++;return smtpSocket()});
 assert.equal(res.status,404);assert.equal(count,0);
});
test("missing and malformed authentication secrets fail closed",async()=>{
 let count=0;const connect=()=>{count++;return smtpSocket()};
 const res=await handleProbeRequest(request(),env,connect);
 const invalid=await handleProbeRequest(request("POST",{"x-rmp-probe-key":"b".repeat(64)}),env,connect);
 assert.equal(res.status,404);assert.equal(invalid.status,404);assert.equal(count,0);
});
test("server without a valid secret cannot open SMTP",async()=>{
 let count=0;
 const res=await handleProbeRequest(request("POST",{"x-rmp-probe-key":key}),
  {...env,RMP_SMTP_PROBE_KEY:"invalid"},()=>{count++;return smtpSocket()});
 assert.equal(res.status,503);assert.equal(count,0);
});
test("approved probe emits EHLO and QUIT and returns sanitized result",async()=>{
 const sock=smtpSocket();
 let calls=0;
 const res=await handleProbeRequest(request("POST",{"x-rmp-probe-key":key}),env,(address,options)=>{
  calls++;assert.deepEqual(address,{hostname:"smtp.hostinger.com",port:465});
  assert.deepEqual(options,{secureTransport:"on",allowHalfOpen:false});
  return sock;
 });
 assert.equal(res.status,200);assert.equal(calls,1);
 const body=await res.json();
 assert.deepEqual(body,{status:"connected",phase:"complete",tlsOpened:true,greetingAccepted:true,ehloAccepted:true});
 assert.deepEqual(sock.writes,["EHLO rmpworks.com\r\n","QUIT\r\n"]);
 assert.equal(res.headers.get("cache-control"),"no-store");
 assert.equal(JSON.stringify(body).includes("smtp.hostinger.com"),false);
});
test("failed handshake never exposes remote errors or credentials",async()=>{
 const socket=smtpSocket();
 socket.opened=Promise.reject(Error("provider secret internals"));
 const res=await handleProbeRequest(request("POST",{"x-rmp-probe-key":key}),env,()=>socket);
 assert.equal(res.status,503);
 const text=await res.text();
 assert.equal(text.includes("provider secret"),false);
 assert.equal(text.includes(key),false);
});
test("request body does not choose destination or credentials",async()=>{
 const req=new Request("https://probe.example.invalid/",{
  method:"POST",headers:{"x-rmp-probe-key":key,"content-type":"application/json"},
  body:JSON.stringify({hostname:"attacker.example",port:25,password:"never-read"}),
 });
 const sock=smtpSocket();
 const res=await handleProbeRequest(req,env,()=>sock);
 assert.equal(res.status,200);
 assert.equal(sock.writes.some(s=>s.includes("never-read")),false);
});
