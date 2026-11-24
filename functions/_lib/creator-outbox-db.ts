/**
 * B9.1 DORMANT server-only durable outbox database contract.
 * No HTTP route imports this module and no provider is configured.
 * All operations require trusted authorization and a backend-only key.
 */
import {issueEmailVerification,verificationLink} from "./creator-email-verification.ts";
import {sealOutboxMail} from "./creator-mail-outbox.ts";

export type OutboxDbEnv={
  supabaseUrl?:string;
  backendSecret?:string;
  authorizedByServer:boolean;
};
export type OutboxNewLead={
  creatorId:string;
  magnetId:string;
  email:string;
  fullName:string;
  creatorName:string;
  marketingOptIn:boolean;
  privacyVersion:string;
  deliveryConsentText:string;
};
export type OutboxEncryption={
  key:Uint8Array;
  keyId:string;
  providerSupportsIdempotency:boolean;
};
export type OutboxClaim={
  outboxId:string;
  eventId:string;
  ciphertext:string;
  iv:string;
  keyId:string;
  envelopeVersion:1;
  leaseToken:string;
  attempts:number;
  expiresAt:string;
};
export type Result="stored"|"closed"|"unavailable";
export type ClaimResult={status:"claimed";job:OutboxClaim}|{status:"empty"|"closed"|"unavailable"};
const uid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const eventPattern=/^[0-9a-f]{64}$/;
const envOk=(e:OutboxDbEnv)=>e.authorizedByServer===true&&
  /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(e.supabaseUrl||"")&&
  typeof e.backendSecret==="string"&&e.backendSecret.length>=32;
const toHex=(bytes:Uint8Array)=>Array.from(bytes,x=>x.toString(16).padStart(2,"0")).join("");
const rpc=async (env:OutboxDbEnv,method:string,payload:object,fetcher:typeof fetch)=>{
 const response=await fetcher(env.supabaseUrl!.replace(/\/$/,"")+"/rest/v1/rpc/"+method,{
  method:"POST",
  headers:{
   apikey:env.backendSecret!,
   authorization:"Bearer "+env.backendSecret!,
   "content-type":"application/json",
   "cache-control":"no-store",
  },
  body:JSON.stringify(payload),
  signal:AbortSignal.timeout(5000),
 });
 if(!response.ok)throw Error("Outbox unavailable");
 return response.json() as Promise<unknown>;
};

export async function enqueueLeadWithMail(
 env:OutboxDbEnv,lead:OutboxNewLead,cryptoOptions:OutboxEncryption,
 fetcher:typeof fetch=fetch
):Promise<Result>{
 if(!env.authorizedByServer)return "closed";
 if(!envOk(env)||!lead||!cryptoOptions||
    typeof lead.creatorId!=="string"||!uid.test(lead.creatorId)||
    typeof lead.magnetId!=="string"||!uid.test(lead.magnetId)||
    typeof lead.email!=="string"||!lead.email.trim()||
    typeof lead.fullName!=="string"||
    typeof lead.creatorName!=="string"||
    typeof lead.marketingOptIn!=="boolean"||
    typeof lead.privacyVersion!=="string"||
    typeof lead.deliveryConsentText!=="string"||
    typeof cryptoOptions.providerSupportsIdempotency!=="boolean"){
  return "closed";
 }
 try{
  const challenge=await issueEmailVerification();
  const eventId=toHex(crypto.getRandomValues(new Uint8Array(32)));
  const confirmationUrl=verificationLink("https://rmpworks.com",challenge.token);
  const envelope=await sealOutboxMail({
   recipient:lead.email.trim().toLowerCase(),
   creatorName:lead.creatorName,
   confirmationUrl,
  },{
   key:cryptoOptions.key,keyId:cryptoOptions.keyId,associatedId:eventId,
  });
  const result=await rpc(env,"creator_create_lead_with_outbox",{
   p_creator_id:lead.creatorId,
   p_magnet_id:lead.magnetId,
   p_email:lead.email.trim().toLowerCase(),
   p_full_name:lead.fullName.trim(),
   p_marketing_opt_in:lead.marketingOptIn,
   p_privacy_version:lead.privacyVersion,
   p_delivery_consent_text:lead.deliveryConsentText,
   p_digest:challenge.tokenDigest,
   p_event_id:eventId,
   p_ciphertext:envelope.ciphertext,
   p_iv:envelope.iv,
   p_key_id:envelope.keyId,
   p_provider_idempotent:cryptoOptions.providerSupportsIdempotency,
  },fetcher);
  return result===true?"stored":result===false?"closed":"unavailable";
 }catch{
  return "unavailable";
 }
}

export async function claimOneConfirmationMail(
 env:OutboxDbEnv,fetcher:typeof fetch=fetch
):Promise<ClaimResult>{
 if(!env.authorizedByServer)return {status:"closed"};
 if(!envOk(env))return {status:"unavailable"};
 try{
  const value=await rpc(env,"creator_claim_confirmation_mail",{},fetcher);
  if(!Array.isArray(value))return {status:"unavailable"};
  if(value.length===0)return {status:"empty"};
  if(value.length!==1)return {status:"unavailable"};
  const v=value[0] as Record<string,unknown>;
  if(!v||typeof v!=="object"||
     typeof v.outbox_id!=="string"||!uid.test(v.outbox_id)||
     typeof v.event_id!=="string"||!eventPattern.test(v.event_id)||
     typeof v.ciphertext!=="string"||!v.ciphertext||
     typeof v.iv!=="string"||!v.iv||
     typeof v.key_id!=="string"||!v.key_id||
     v.envelope_version!==1||
     typeof v.lease_token!=="string"||!uid.test(v.lease_token)||
     typeof v.attempts!=="number"||!Number.isInteger(v.attempts)||
     v.attempts<1||v.attempts>4||
     typeof v.expires_at!=="string"||!Number.isFinite(Date.parse(v.expires_at))){
    return {status:"unavailable"};
  }
  return {status:"claimed",job:{
   outboxId:v.outbox_id,eventId:v.event_id,ciphertext:v.ciphertext,
   iv:v.iv,keyId:v.key_id,envelopeVersion:1,leaseToken:v.lease_token,
   attempts:v.attempts,expiresAt:v.expires_at,
  }};
 }catch{return {status:"unavailable"};}
}

export async function acknowledgeConfirmationMail(
 env:OutboxDbEnv,job:{outboxId:string;leaseToken:string},
 outcome:"accepted"|"retryable"|"permanent"|"ambiguous",
 fetcher:typeof fetch=fetch
):Promise<"acknowledged"|"stale"|"closed"|"unavailable">{
 if(!env.authorizedByServer)return "closed";
 if(!envOk(env)||!job||!uid.test(job.outboxId)||!uid.test(job.leaseToken)||
    !["accepted","retryable","permanent","ambiguous"].includes(outcome))
  return "unavailable";
 try{
  const r=await rpc(env,"creator_ack_confirmation_mail",{
   p_outbox_id:job.outboxId,p_lease_token:job.leaseToken,p_outcome:outcome,
  },fetcher);
  return r===true?"acknowledged":r===false?"stale":"unavailable";
 }catch{return "unavailable";}
}
