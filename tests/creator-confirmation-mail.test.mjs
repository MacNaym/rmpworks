import test from "node:test";
import assert from "node:assert/strict";
import {confirmationMessage,dispatchConfirmationMail} from "../functions/_lib/creator-confirmation-mail.ts";
const token="a".repeat(43);
const url=`https://rmpworks.com/creator/confirm-email?token=${token}`;
const base={recipient:"reader@example.com",creatorName:"Creator Test",confirmationUrl:url};
test("email delivery is disabled by default, without calling any provider",async()=>{
 let calls=0;
 assert.equal(await dispatchConfirmationMail({...base,sendEnabled:false,transport:async()=>{calls++;return true}}),"disabled");
 assert.equal(calls,0);
});
test("even enabled delivery needs explicitly supplied transport",async()=>{
 assert.equal(await dispatchConfirmationMail({...base,sendEnabled:true}),"unavailable");
});
test("verification email is transactional and keeps marketing separate",()=>{
 const m=confirmationMessage(base.recipient,base.creatorName,base.confirmationUrl);
 assert.match(m.text,/15 minuti/);
 assert.match(m.text,/Non sei iscritto a una newsletter/);
 assert.match(m.html,/Nessuna iscrizione marketing automatica/);
 assert.equal(m.subject,"Conferma la tua email per ricevere la risorsa");
});
test("creator names and confirmation links cannot inject HTML",()=>{
 const m=confirmationMessage(base.recipient,"<img src=x onerror=alert(1)>",base.confirmationUrl);
 assert.ok(!m.html.includes("<img"));
 assert.match(m.html,/&lt;img/);
 for(const bad of [
  "https://attacker.example/creator/confirm-email?token="+token,
  "http://rmpworks.com/creator/confirm-email?token="+token,
  "https://rmpworks.com:8443/creator/confirm-email?token="+token,
  "https://rmpworks.com/creator/confirm-email?token="+token+"&redirect=https://evil.example",
  "https://rmpworks.com/creator/confirm-email?token=invalid"
 ]){
  assert.throws(()=>confirmationMessage(base.recipient,base.creatorName,bad));
 }
});
test("a successful provider result does not occur without enabled dispatch",async()=>{
 let count=0;
 assert.equal(await dispatchConfirmationMail({...base,sendEnabled:true,transport:async m=>{count++;assert.equal(m.to,base.recipient);return true}}),"sent");
 assert.equal(count,1);
});
test("provider failure and invalid email fail closed without leaking details",async()=>{
 assert.equal(await dispatchConfirmationMail({...base,sendEnabled:true,transport:async()=>false}),"unavailable");
 assert.equal(await dispatchConfirmationMail({...base,sendEnabled:true,transport:async()=>{throw Error("private")}}),"unavailable");
 assert.equal(await dispatchConfirmationMail({...base,recipient:"bad",sendEnabled:true,transport:async()=>true}),"unavailable");
});
