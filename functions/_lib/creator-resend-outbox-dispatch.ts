/**
 * B10.2 — DORMANT composition of durable outbox DB RPCs, encryption and
 * Resend HTTPS into the existing one-job dispatcher.
 *
 * Deliberately no HTTP route/cron/queue import: merely importing this module
 * cannot send email or modify a database. Configuration is server-owned only.
 */
import {
 claimOneConfirmationMail,acknowledgeConfirmationMail,
 revalidateConfirmationMailLease
} from "./creator-outbox-db.ts";
import type {OutboxDbEnv,OutboxClaim} from "./creator-outbox-db.ts";
import {dispatchOneConfirmation} from "./creator-outbox-worker.ts";
import type {WorkerResult} from "./creator-outbox-worker.ts";
import {makeResendHttpTransport} from "./creator-resend-http-transport.ts";

const keyIdPattern=/^[A-Za-z0-9_-]{1,50}$/;
const base64UrlPattern=/^[A-Za-z0-9_-]{43}$/;
export type ResendOutboxEnv={
  // All values must be read from server-only bindings; NEVER from a request
  // body/query/header or client-side environment variables.
  RMP_CREATOR_PUBLIC_RELEASE?:string;
  RMP_CONFIRMATION_DISPATCH_ENABLED?:string;
  RMP_RESEND_DOMAIN_VERIFIED?:string;
  RMP_SUPABASE_URL?:string;
  RMP_SUPABASE_SERVICE_KEY?:string;
  RESEND_API_KEY?:string;
  RMP_OUTBOX_KEY_ID?:string;
  RMP_OUTBOX_KEY_B64URL?:string;
};
type RemoteFetch=typeof fetch;
const decodeKey=(value:string):Uint8Array|null=>{
 if(!base64UrlPattern.test(value))return null;
 try{
  const decoded=atob(value.replace(/-/g,"+").replace(/_/g,"/")+"=");
  if(decoded.length!==32)return null;
  return Uint8Array.from(decoded,x=>x.charCodeAt(0));
 }catch{return null;}
};

/**
 * Single message-attempt entrypoint, NOT an active scheduler.
 * The separate public release gate must also be enabled: a confirmation
 * email should not be sent for a non-public workflow.
 */
export async function dispatchOneResendOutbox(
 env:ResendOutboxEnv,
 dependencies:{fetcher?:RemoteFetch;now?:()=>number}={}
):Promise<WorkerResult>{
 if(env?.RMP_CREATOR_PUBLIC_RELEASE!=="true"||
    env?.RMP_CONFIRMATION_DISPATCH_ENABLED!=="true")return "disabled";
 if(env.RMP_RESEND_DOMAIN_VERIFIED!=="true")return "unavailable";
 const id=env.RMP_OUTBOX_KEY_ID;
 const encoded=env.RMP_OUTBOX_KEY_B64URL;
 const key=typeof encoded==="string"?decodeKey(encoded):null;
 if(typeof id!=="string"||!keyIdPattern.test(id)||!key||
    typeof env.RMP_SUPABASE_URL!=="string"||
    typeof env.RMP_SUPABASE_SERVICE_KEY!=="string"||
    typeof env.RESEND_API_KEY!=="string")return "unavailable";
 const db:OutboxDbEnv={
   supabaseUrl:env.RMP_SUPABASE_URL,
   backendSecret:env.RMP_SUPABASE_SERVICE_KEY,
   authorizedByServer:true
 };
 const fetcher=dependencies.fetcher??fetch;
 // Validate the provider before claiming a database lease. The main adapter
 // still fail-closes on malformed API key or requests.
 if(!/^re_[A-Za-z0-9_-]{8,256}$/.test(env.RESEND_API_KEY))
   return "unavailable";
 const transport=makeResendHttpTransport({
   enabled:true,domainVerified:true,apiKey:env.RESEND_API_KEY,
   fetcher
 });
 return dispatchOneConfirmation({
   enabled:true,
   keys:{[id]:key},
   claim:()=>claimOneConfirmationMail(db,fetcher),
   revalidate:(job:OutboxClaim)=>revalidateConfirmationMailLease(db,job,fetcher),
   acknowledge:(job,outcome)=>acknowledgeConfirmationMail(db,job,outcome,fetcher),
   transport,
   now:dependencies.now
 });
}
