/**
 * B9.2 — DORMANT confirmation mail dispatch worker.
 * This is a dependency-injected ONE-JOB workflow. No cron, route or provider
 * is wired. No real email can be sent without an explicitly enabled and
 * supplied transport, private encryption key, and server-owned DB guards.
 */
import {openOutboxMail} from "./creator-mail-outbox.ts";
import {confirmationMessage} from "./creator-confirmation-mail.ts";
import type {OutboundMessage} from "./creator-confirmation-mail.ts";
import type {OutboxClaim} from "./creator-outbox-db.ts";
import type {DispatchResult} from "./creator-mail-outbox.ts";

export type WorkerClaim = () => Promise<
  {status:"claimed";job:OutboxClaim}|{status:"closed"|"empty"|"unavailable"}
>;
export type WorkerAck = (
  job:{outboxId:string;leaseToken:string}, outcome:DispatchResult
) => Promise<"acknowledged"|"stale"|"closed"|"unavailable">;
export type WorkerRevalidate = (job:OutboxClaim) => Promise<boolean>;
export type WorkerTransport = {
  // Idempotency is a documented provider guarantee, not just a header.
  supportsIdempotency:boolean;
  send:(message:OutboundMessage,options:{eventId:string})=>Promise<DispatchResult>;
};
export type WorkerConfig = {
  enabled:boolean; // Trusted server configuration; false by default.
  keys:Readonly<Record<string,Uint8Array>>;
  claim:WorkerClaim;
  revalidate:WorkerRevalidate;
  acknowledge:WorkerAck;
  transport?:WorkerTransport;
  now?:()=>number;
};
export type WorkerResult =
  "disabled"|"empty"|"unavailable"|"deferred"|"sent"|
  "recorded"|"dead"|"ack_unavailable";

const eventIdPattern=/^[a-f0-9]{64}$/;
const validResult=(v:unknown):v is DispatchResult=>
  v==="accepted"||v==="retryable"||v==="permanent"||v==="ambiguous";
const epoch=(s:string):number=>{
  const value=Date.parse(s);
  return Number.isFinite(value)?value:NaN;
};

/**
 * One invocation attempts at most ONE delivery.
 *
 * On decrypt/validation/eligibility failure we do not call a mail provider.
 * All outcome acknowledgements are done using a DB lease token; the database
 * must reject stale tokens and apply its own DB-clock expiration policy.
 * No recipient, raw token, ciphertext or secret is ever logged here.
 */
export async function dispatchOneConfirmation(
  config:WorkerConfig
):Promise<WorkerResult>{
  if(config.enabled!==true)return "disabled";
  if(typeof config.claim!=="function"||
     typeof config.revalidate!=="function"||
     typeof config.acknowledge!=="function"||
     !config.transport||
     typeof config.transport.send!=="function"||
     typeof config.transport.supportsIdempotency!=="boolean"||
     !config.keys || typeof config.keys!=="object")return "unavailable";
  let claimed:Awaited<ReturnType<WorkerClaim>>;
  try{ claimed=await config.claim(); }
  catch{return "unavailable";}
  if(claimed.status==="empty")return "empty";
  if(claimed.status!=="claimed")return claimed.status==="closed"?"disabled":"unavailable";
  const job=claimed.job;

  const ack=async(outcome:DispatchResult):Promise<WorkerResult>=>{
    try{
      const result=await config.acknowledge(
        {outboxId:job.outboxId,leaseToken:job.leaseToken},outcome);
      if(result!=="acknowledged")return "ack_unavailable";
      if(outcome==="accepted")return "sent";
      if(outcome==="permanent")return "dead";
      // DB policy may mark dead/retry/review based on expiry and provider
      // idempotency. The boolean ACK does not reveal that final state.
      return "recorded";
    }catch{return "ack_unavailable";}
  };

  // Invalid lease metadata is never sent; DB must ultimately expire it.
  if(!eventIdPattern.test(job.eventId)||job.envelopeVersion!==1||
     !Number.isInteger(job.attempts)||job.attempts<1||job.attempts>4)
    return ack("permanent");

  const now=config.now??Date.now;
  let time:number;
  try{time=now();}
  catch{return ack("retryable");}
  if(!Number.isFinite(time)||time>=epoch(job.expiresAt))
    return ack("permanent");

  // Never rely on client assertions for provider retry safety.
  if(job.providerIdempotent===true && config.transport.supportsIdempotency!==true)
    return ack("permanent");

  const key=config.keys[job.keyId];
  if(!(key instanceof Uint8Array)||key.byteLength!==32)return ack("permanent");

  let message:OutboundMessage;
  try{
    const payload=await openOutboxMail({
      version:1,keyId:job.keyId,iv:job.iv,ciphertext:job.ciphertext
    },{key,keyId:job.keyId,associatedId:job.eventId});
    message=confirmationMessage(
      payload.recipient,payload.creatorName,payload.confirmationUrl);
  }catch{return ack("permanent");}

  // Mandatory backend-owned freshness check of current tenant, token, lease,
  // creator, resource, publication and DB time. Fail closed on failure.
  let eligible:boolean;
  try{eligible=await config.revalidate(job);}
  catch{return ack("retryable");}
  if(eligible!==true)return ack("permanent");

  try{
    time=now();
    if(!Number.isFinite(time)||time>=epoch(job.expiresAt))
      return ack("permanent");
  }catch{return ack("retryable");}

  // Outcome is unknown if transport throws: never assert "retryable" because
  // the provider may have accepted the message before the connection failed.
  let outcome:DispatchResult="ambiguous";
  try{
    const result=await config.transport.send(message,{eventId:job.eventId});
    if(validResult(result))outcome=result;
  }catch{outcome="ambiguous";}

  // The persistent DB outbox has its own idempotency policy. A future
  // provider adapter must never claim supportsIdempotency without a guarantee.
  return ack(outcome);
}
