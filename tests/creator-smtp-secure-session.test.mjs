import test from "node:test";
import assert from "node:assert/strict";
import {submitSmtpOverSecureChannel} from "../functions/_lib/creator-smtp-secure-session.ts";
const msg={to:"reader@example.com",subject:"Conferma la tua email per ricevere la risorsa",
 text:"Apri il link: https://rmpworks.com/creator/confirm-email?token="+"A".repeat(43),
 html:"<p>Conferma &amp; prova</p>"};
const login={username:"noreply@rmpworks.com",from:"noreply@rmpworks.com",password:"test-secret-only",message:msg};
function mock(responses,failWriteAt=0){
 const commands=[];let closed=0,reads=0;
 const channel={
  readLine:async()=>{reads++;if(!responses.length)throw Error("Disconnected");return responses.shift()},
  write:async s=>{commands.push(s);if(failWriteAt&&commands.length===failWriteAt)throw Error("Network lost")},
  close:async()=>{closed++},
 };
 return {channel,commands,get closed(){return closed},get reads(){return reads}};
}
const ok=()=>["220 Ready","250-localhost","250-AUTH PLAIN LOGIN","250 OK","235 Authenticated",
 "250 Sender OK","250 Recipient OK","354 End data","250 Queued"];
test("successful SMTP exchange requires auth, recipient and final DATA acceptance",async()=>{
 const m=mock(ok());
 const result=await submitSmtpOverSecureChannel({...login,channel:m.channel});
 assert.deepEqual(result,{state:"accepted"});
 assert.equal(m.commands[0],"EHLO rmpworks.com\r\n");
 assert.match(m.commands[1],/^AUTH PLAIN [A-Za-z0-9+/=]+\r\n$/);
 assert.equal(m.commands[2],"MAIL FROM:<noreply@rmpworks.com>\r\n");
 assert.equal(m.commands[3],"RCPT TO:<reader@example.com>\r\n");
 assert.equal(m.commands[4],"DATA\r\n");
 assert.match(m.commands[5],/^From: <noreply@rmpworks.com>\r\n/);
 assert.match(m.commands[5],/\r\n\.\r\n$/);
 assert.ok(!m.commands[5].includes("Apri il link:"));
 assert.equal(m.closed,1);
});
test("definitive 4xx/5xx rejections classify temporary versus permanent",async()=>{
 for(const [reply,expected] of [["450 Mailbox busy","temporary"],["550 User unknown","permanent"]]){
  const responses=ok().slice(0,6).concat([reply]);
  const m=mock(responses);
  assert.deepEqual(await submitSmtpOverSecureChannel({...login,channel:m.channel}),
   {state:"rejected",classification:expected});
 }
});
test("post-DATA disconnect is ambiguous and not automatically retryable",async()=>{
 const m=mock(ok().slice(0,-1));
 assert.deepEqual(await submitSmtpOverSecureChannel({...login,channel:m.channel}),{state:"uncertain"});
 assert.equal(m.closed,1);
});
test("post-DATA write failure is ambiguous",async()=>{
 const m=mock(ok(),6);
 assert.deepEqual(await submitSmtpOverSecureChannel({...login,channel:m.channel}),{state:"uncertain"});
});
test("does not reveal credentials through source message",async()=>{
 const m=mock(ok());
 await submitSmtpOverSecureChannel({...login,channel:m.channel});
 const auth=m.commands[1];
 assert.ok(!auth.includes("test-secret-only"));
 assert.ok(!m.commands[5].includes("test-secret-only"));
});
test("missing PLAIN authorization does not transmit credentials",async()=>{
 const m=mock(["220 Ready","250-localhost","250 AUTH LOGIN"]);
 assert.deepEqual(await submitSmtpOverSecureChannel({...login,channel:m.channel}),{state:"uncertain"});
 assert.equal(m.commands.length,1);
});
test("unsafe recipient and invalid username are rejected before any writes",async()=>{
 const m=mock(ok());
 assert.deepEqual(await submitSmtpOverSecureChannel({...login,message:{...msg,to:"evil@example.com\r\nBCC:other@example.com"},channel:m.channel}),{state:"uncertain"});
 assert.equal(m.commands.length,0);
});
test("SMTP multiline inconsistent code is refused",async()=>{
 const m=mock(["220 Ready","250-localhost","550 AUTH PLAIN"]);
 assert.deepEqual(await submitSmtpOverSecureChannel({...login,channel:m.channel}),{state:"uncertain"});
});
test("known rejection before sending DATA is not reported as accepted",async()=>{
 const m=mock(["220 Ready","250-localhost","250 AUTH PLAIN","535 Authentication rejected"]);
 assert.deepEqual(await submitSmtpOverSecureChannel({...login,channel:m.channel}),
  {state:"rejected",classification:"permanent"});
 assert.equal(m.commands.length,2);
});
test("unsupported overlong subject fails closed",async()=>{
 const m=mock(ok());
 assert.deepEqual(await submitSmtpOverSecureChannel({...login,message:{...msg,subject:"x".repeat(180)},channel:m.channel}),{state:"uncertain"});
 assert.equal(m.commands.length,0);
});
