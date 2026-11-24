/**
 * B9.7 offline-testable private SMTP probe handler.
 * No Cloudflare-specific import, deploy or network side effect here.
 */
import {probeHostingerSmtp} from "../../functions/_lib/creator-smtp-connection-probe.ts";
import {diagnoseHostingerEgress} from "./hostinger-egress-diagnostic.ts";
import type {CloudflareConnect} from "../../functions/_lib/creator-cloudflare-smtp-channel.ts";

export type DiagnosticEnv={
 RMP_SMTP_PROBE_ENABLED?:string;
 RMP_SMTP_PROBE_KEY?:string;
};
const enc=new TextEncoder();
const strictHex=/^[a-f0-9]{64}$/;
async function keysEqual(a:string,b:string):Promise<boolean>{
 const [x,y]=await Promise.all([
  crypto.subtle.digest("SHA-256",enc.encode(a)),
  crypto.subtle.digest("SHA-256",enc.encode(b))
 ]);
 const left=new Uint8Array(x),right=new Uint8Array(y);
 let diff=0;
 for(let i=0;i<32;i++)diff|=left[i]^right[i];
 return diff===0;
}
const json=(data:object,status:number)=>
 new Response(JSON.stringify(data),{status,headers:{
  "content-type":"application/json; charset=utf-8",
  "cache-control":"no-store",
  "x-content-type-options":"nosniff",
  "referrer-policy":"no-referrer",
 }});
export async function handleProbeRequest(
 request:Request,env:DiagnosticEnv,connector:CloudflareConnect
):Promise<Response>{
 if(env?.RMP_SMTP_PROBE_ENABLED!=="true")
  return json({status:"disabled"},404);
 if(request.method!=="POST")return json({status:"not_found"},404);
 const secret=env.RMP_SMTP_PROBE_KEY;
 if(typeof secret!=="string"||!strictHex.test(secret))
  return json({status:"unavailable"},503);
 const supplied=request.headers.get("x-rmp-probe-key")||"";
 if(!strictHex.test(supplied)||!await keysEqual(secret,supplied))
  return json({status:"not_found"},404);
 // The body cannot select hosts/ports or supply mail credentials.
 const result=await probeHostingerSmtp({
  enabled:true,connect:connector,timeoutMs:4000
 });
 if(result.status==="unavailable" && result.phase==="connect"){
  // Diagnostic-only, never used on public creator endpoints.
  // Secondary TCP attempt is limited to Hostinger:587 with no SMTP commands.
  const fallback=await diagnoseHostingerEgress(connector as unknown as Parameters<typeof diagnoseHostingerEgress>[0]);
  return json({...result,egress:fallback},503);
 }
 return json(result,result.status==="connected"?200:503);
}
