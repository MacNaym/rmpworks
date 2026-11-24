/**
 * B12: DORMANT trusted-server-only public lead workflow composition.
 *
 * This is NOT a HTTP handler. It is deliberately not imported by an active
 * Cloudflare Pages function. No database writes or provider requests occur
 * until the caller explicitly provides enabled flags and server credentials.
 * Never derive server gates or secrets from untrusted request values.
 */
import {enqueueLeadWithMail} from "./creator-outbox-db.ts";
import type {OutboxDbEnv,OutboxEncryption,OutboxNewLead} from "./creator-outbox-db.ts";
import {redeemEmailVerification} from "./creator-email-verification.ts";
import type {Redemption} from "./creator-email-verification.ts";

export type LeadWorkflowSettings={
  publicReleaseEnabled:boolean;
  intakeEnabled:boolean;
  confirmationEnabled:boolean;
  db:OutboxDbEnv;
  outbox:OutboxEncryption;
  fetcher?:typeof fetch;
};
export type LeadIntakeResult="disabled"|"stored"|"closed"|"unavailable";
const hex=/^[a-f0-9]{64}$/;
const endpoint=(url:string)=>/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url);
const validDB=(db:OutboxDbEnv)=>
 db?.authorizedByServer===true&&typeof db?.supabaseUrl==="string"&&
 endpoint(db.supabaseUrl)&&typeof db.backendSecret==="string"&&db.backendSecret.length>=32;

/**
 * Validated application entrypoint, not a public route. The existing DB RPC
 * atomically inserts pending lead, digest and encrypted outbox event.
 */
export async function createPendingCreatorLead(
 settings:LeadWorkflowSettings, lead:OutboxNewLead
):Promise<LeadIntakeResult>{
 if(settings?.publicReleaseEnabled!==true||settings.intakeEnabled!==true)return "disabled";
 if(!validDB(settings.db)||!settings.outbox||
    settings.outbox.providerSupportsIdempotency!==true||
    !(settings.outbox.key instanceof Uint8Array)||settings.outbox.key.byteLength!==32||
    typeof settings.outbox.keyId!=="string"||
    !/^[A-Za-z0-9_-]{1,50}$/.test(settings.outbox.keyId))return "unavailable";
 // User-supplied creator/magnet IDs and consent fields are still revalidated
 // within the atomic database RPC against current publication and approval.
 try{
  return await enqueueLeadWithMail(settings.db,lead,settings.outbox,settings.fetcher??fetch);
 }catch{return "unavailable";}
}

/**
 * Trusted POST-only confirmation action (NO GET redemption; no token logging).
 * The RPC consumes the SHA-256 challenge digest once, iff still eligible.
 * The caller must apply origin/CSRF/rate limits before invoking this method.
 */
export async function confirmPendingCreatorLead(
 settings:Pick<LeadWorkflowSettings,"publicReleaseEnabled"|"confirmationEnabled"|"db"|"fetcher">,
 token:unknown
):Promise<Redemption|"disabled">{
 if(settings?.publicReleaseEnabled!==true||settings.confirmationEnabled!==true)return "disabled";
 if(!validDB(settings.db))return "unavailable";
 const db=settings.db;
 const fetcher=settings.fetcher??fetch;
 return redeemEmailVerification(token,async({tokenDigest})=>{
  if(!hex.test(tokenDigest))return "invalid";
  try{
   const response=await fetcher(db.supabaseUrl!.replace(/\/$/,"")+
    "/rest/v1/rpc/creator_consume_email_token",{
     method:"POST",
     headers:{
      apikey:db.backendSecret!,
      authorization:"Bearer "+db.backendSecret!,
      "content-type":"application/json",
      "cache-control":"no-store"
     },
     body:JSON.stringify({p_digest:tokenDigest}),
     signal:AbortSignal.timeout(5000)
    });
   if(!response.ok)throw Error("Confirmation RPC unavailable");
   const data=await response.json();
   return data===true?"consumed":"invalid";
  }catch{throw Error("Confirmation RPC unavailable");}
 });
}
