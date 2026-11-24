/**
 * B9.4 dormant SMTP protocol session. The caller MUST supply a verified TLS
 * channel already connected to Hostinger SMTP port 465. No network or secrets
 * are created or stored here; provider errors and raw tokens are never logged.
 */
import type {OutboundMessage} from "./creator-confirmation-mail.ts";
import type {SmtpSubmission} from "./creator-hostinger-smtp-transport.ts";

export type SmtpSecureChannel={
  readLine:()=>Promise<string>;
  write:(data:string)=>Promise<void>;
  close:()=>Promise<void>;
};
export type SmtpSessionInput={
  channel:SmtpSecureChannel;
  username:string;
  password:string;
  from:string;
  message:OutboundMessage;
};
const address=(s:string)=>typeof s==="string"&&s.length<255&&
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/.test(s)&&!s.includes("..");
const head=(s:string)=>typeof s==="string"&&s.length>0&&s.length<=200&&
  !/[\r\n\x00-\x1f\x7f]/.test(s);
const base64=(value:string)=>{
 const bytes=new TextEncoder().encode(value);
 let data="";for(const b of bytes)data+=String.fromCharCode(b);
 return btoa(data);
};
const mime=(m:OutboundMessage,from:string)=>{
 if(!address(from)||!address(m?.to)||!head(m?.subject)||
    typeof m.text!=="string"||!m.text||m.text.length>30000||
    typeof m.html!=="string"||!m.html||m.html.length>30000)throw Error("Invalid mail input");
 const boundary="rmp-"+crypto.randomUUID().replace(/-/g,"");
 const b64=(v:string)=>(base64(v).match(/.{1,76}/g)||[]).join("\r\n");
 const subject="=?UTF-8?B?"+base64(m.subject)+"?=";
 // SMTP line limits: long encoded words/lines are not permitted.
 if(subject.length>76)throw Error("Subject too long for encoded word");
 return [
  "From: <"+from+">","To: <"+m.to+">","Subject: "+subject,
  "MIME-Version: 1.0",
  'Content-Type: multipart/alternative; boundary="'+boundary+'"',
  "Auto-Submitted: auto-generated","",
  "--"+boundary,"Content-Type: text/plain; charset=UTF-8",
  "Content-Transfer-Encoding: base64","",b64(m.text),
  "--"+boundary,"Content-Type: text/html; charset=UTF-8",
  "Content-Transfer-Encoding: base64","",b64(m.html),
  "--"+boundary+"--",""
 ].join("\r\n");
};
type Reply={code:number;lines:string[]};
async function response(ch:SmtpSecureChannel):Promise<Reply>{
 const lines:string[]=[];let code=0;
 for(let i=0;i<20;i++){
  const s=await ch.readLine();
  if(typeof s!=="string"||s.length>1000||/[\r\n]/.test(s)||
     !/^\d{3}[ -]/.test(s))throw Error("Invalid SMTP response");
  const n=Number(s.slice(0,3));
  if(n<200||n>599||(code!==0&&n!==code))throw Error("Invalid SMTP code");
  code=n;lines.push(s);
  if(s[3]===" ")return {code,lines};
 }
 throw Error("SMTP multiline overflow");
}
async function command(ch:SmtpSecureChannel,s:string){
 await ch.write(s+"\r\n");return response(ch);
}
const reject=(code:number):SmtpSubmission=>({
 state:"rejected",classification:code>=500?"permanent":"temporary"
});

/** Strict SMTP with AUTH PLAIN over an already established implicit TLS link.
 * Any exception is ambiguous, since SMTP DATA may already have been accepted.
 */
export async function submitSmtpOverSecureChannel(i:SmtpSessionInput):Promise<SmtpSubmission>{
 const ch=i.channel;
 try{
  if(!ch||typeof ch.readLine!=="function"||
     typeof ch.write!=="function"||typeof ch.close!=="function"||
     i.username!==i.from||!address(i.username)||
     typeof i.password!=="string"||!i.password||i.password.length>1024||
     /[\r\n\x00]/.test(i.password))return {state:"uncertain"};
  const message=mime(i.message,i.from);
  let r=await response(ch);
  if(r.code!==220)return reject(r.code);
  r=await command(ch,"EHLO rmpworks.com");
  if(r.code!==250)return reject(r.code);
  if(!r.lines.some(s=>/^250[ -]AUTH(?:\s|=).*PLAIN(?:\s|$)/i.test(s)))
   return {state:"uncertain"};
  r=await command(ch,"AUTH PLAIN "+base64("\0"+i.username+"\0"+i.password));
  if(r.code!==235)return reject(r.code);
  r=await command(ch,"MAIL FROM:<"+i.from+">");
  if(r.code!==250)return reject(r.code);
  r=await command(ch,"RCPT TO:<"+i.message.to+">");
  if(r.code!==250&&r.code!==251)return reject(r.code);
  r=await command(ch,"DATA");
  if(r.code!==354)return reject(r.code);
  // Base64 payload contains no lines beginning with a dot.
  await ch.write(message+"\r\n.\r\n");
  r=await response(ch);
  if(r.code===250)return {state:"accepted"};
  if(r.code>=400)return reject(r.code);
  return {state:"uncertain"};
 }catch{return {state:"uncertain"};}
 finally{try{await ch?.close?.();}catch{}}
}
