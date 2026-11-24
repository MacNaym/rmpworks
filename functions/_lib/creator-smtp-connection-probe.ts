/**
 * B9.6 DORMANT, no-credentials SMTP connectivity diagnostic.
 * Only opens the pinned implicit-TLS Hostinger socket, receives a greeting,
 * sends EHLO and optionally QUIT. It MUST NOT transmit AUTH, MAIL FROM,
 * RCPT TO, DATA, email addresses, passwords, or tokens.
 *
 * No public endpoint, cron, Cloudflare runtime import or production caller.
 */
import {openHostingerTlsChannel} from "./creator-cloudflare-smtp-channel.ts";
import type {CloudflareConnect} from "./creator-cloudflare-smtp-channel.ts";
import type {SmtpSecureChannel} from "./creator-smtp-secure-session.ts";

export type SmtpProbeResult = {
  status:"disabled"|"connected"|"unavailable"|"rejected";
  tlsOpened:boolean;
  greetingAccepted:boolean;
  ehloAccepted:boolean;
  // No remote text is returned; upstream response could contain PII.
  phase:"disabled"|"connect"|"greeting"|"ehlo"|"complete";
};
type ProbeInput={
  enabled:boolean; // Trusted server-owned opt-in, NEVER request JSON.
  connect:CloudflareConnect;
  timeoutMs?:number;
};
type Reply={code:number;lines:string[]};
async function readResponse(ch:SmtpSecureChannel):Promise<Reply>{
  const lines:string[]=[];
  let code:number|undefined;
  for(let i=0;i<20;i++){
    const line=await ch.readLine();
    if(typeof line!=="string"||line.length>1000||
       /[\r\n\x00-\x1f\x7f]/.test(line)||!/^[0-9]{3}[ -]/.test(line))
      throw Error("Bad SMTP response");
    const next=Number(line.slice(0,3));
    if(next<200||next>599||(code!==undefined&&next!==code))
      throw Error("Bad SMTP status");
    code=next;
    lines.push(line);
    if(line[3]===" ")return {code:next,lines};
  }
  throw Error("SMTP response overflow");
}
const output=(status:SmtpProbeResult["status"],phase:SmtpProbeResult["phase"],
 tlsOpened:boolean,greetingAccepted:boolean,ehloAccepted:boolean):SmtpProbeResult=>
  ({status,phase,tlsOpened,greetingAccepted,ehloAccepted});

/** Must be invoked from a separately approved trusted Worker diagnostic,
 * and never from a public lead-submission or verification endpoint.
 */
export async function probeHostingerSmtp(
 input:ProbeInput
):Promise<SmtpProbeResult>{
 if(input?.enabled!==true)return output("disabled","disabled",false,false,false);
 if(typeof input.connect!=="function")
   return output("unavailable","connect",false,false,false);
 let ch:SmtpSecureChannel|undefined;
 let greeting=false;
 let ehlo=false;
 try{
   ch=await openHostingerTlsChannel(input.connect,{timeoutMs:input.timeoutMs});
 }catch{
   return output("unavailable","connect",false,false,false);
 }
 try{
   const banner=await readResponse(ch);
   if(banner.code!==220)
     return output("rejected","greeting",true,false,false);
   greeting=true;
   // This is the only diagnostic command required to test the SMTP session.
   await ch.write("EHLO rmpworks.com\r\n");
   const capabilities=await readResponse(ch);
   if(capabilities.code!==250)
     return output("rejected","ehlo",true,true,false);
   ehlo=true;
   // QUIT is polite but optional: failure does not invalidate earlier EHLO.
   try{
     await ch.write("QUIT\r\n");
     await readResponse(ch);
   }catch{}
   return output("connected","complete",true,true,true);
 }catch{
   return output("unavailable",greeting?"ehlo":"greeting",true,greeting,ehlo);
 }finally{
   try{await ch.close();}catch{}
 }
}
