/**
 * B9.9: secondary, credential-free SMTP egress diagnosis.
 *
 * The primary B9.6 probe still decides success. When it fails before TLS
 * opens, this helper opens at most one ADDITIONAL connection to the same
 * pinned Hostinger service on SMTP submission port 587.
 *
 * No commands, no AUTH, no email. No raw provider text is returned.
 */
import type {CloudflareSocketLike} from "../../functions/_lib/creator-cloudflare-smtp-channel.ts";
type Connect=(address:{hostname:string;port:number},options:{
 secureTransport:"on"|"off";allowHalfOpen:false
})=>CloudflareSocketLike;

export type ConnectivityReason="timeout"|"refused"|"blocked"|"tls"|"dns"|"unreachable"|"unknown";
export type EgressResult={
 port465:"tls_failed";
 port587:"tcp_opened"|"tcp_failed";
 reason587?:ConnectivityReason;
};

function classify(e:unknown):ConnectivityReason{
 const message=e instanceof Error?e.message:"";
 // Deliberately only a fixed-label allowlist, never return provider text.
 if(/timed?\s*out|timeout|deadline/i.test(message))return "timeout";
 if(/ECONNREFUSED|connection refused/i.test(message))return "refused";
 if(/prohibit|not allowed|disallow|proxy request failed|forbidden/i.test(message))return "blocked";
 if(/tls|certificate|handshake|ssl/i.test(message))return "tls";
 if(/ENOTFOUND|DNS|resolve host|name resolution/i.test(message))return "dns";
 if(/unreach|ECONNRESET|reset by peer|network/i.test(message))return "unreachable";
 return "unknown";
}
const DEADLINE_MS=5000;
export async function diagnoseHostingerEgress(connect:Connect):Promise<EgressResult>{
 let socket:CloudflareSocketLike|undefined;
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{
  socket=connect({hostname:"smtp.hostinger.com",port:587},{
   secureTransport:"off",allowHalfOpen:false
  });
  const opened=socket.opened;
  const timeout=new Promise<never>((_,reject)=>{
   timer=setTimeout(()=>reject(Error("timeout")),DEADLINE_MS);
  });
  await Promise.race([opened,timeout]);
  return {port465:"tls_failed",port587:"tcp_opened"};
 }catch(e){
  return {port465:"tls_failed",port587:"tcp_failed",reason587:classify(e)};
 }finally{
  if(timer!==undefined)clearTimeout(timer);
  try{await socket?.close?.();}catch{}
  // Always consume socket rejection even if a timeout won the race.
  try{void socket?.opened.catch(()=>{});}catch{}
 }
}
