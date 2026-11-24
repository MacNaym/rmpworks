/**
 * B9 dormant transactional confirmation mail outbox primitives.
 *
 * Critical: token, recipient and confirmation URL must NEVER be persisted
 * as plaintext. AES-GCM encrypts the entire message before durable storage.
 * This module makes no network requests, schedules no timers and sends no mail.
 * For retry workers use a tenant-scoped DB lease and a provider-supported
 * idempotency key. Ambiguous dispatch results require manual reconciliation.
 */
export const OUTBOX_MAX_ATTEMPTS = 4;
export const OUTBOX_RETRY_DELAYS_SECONDS = [30, 120, 300] as const;
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const idPattern = /^[0-9a-f]{64}$/;
const b64urlPattern = /^[A-Za-z0-9_-]+$/;

export type EncryptedMail = {
  version: 1;
  keyId: string;
  iv: string;
  ciphertext: string;
};
export type OutboxStatus = "pending" | "leased" | "sent" | "dead" | "needs_review";
export type DispatchResult = "accepted" | "retryable" | "permanent" | "ambiguous";
export type RetryDecision = {
  status: OutboxStatus;
  nextAttemptAt: string | null;
};
export type MailPayload = {
  recipient: string;
  creatorName: string;
  confirmationUrl: string;
};
export type OutboxDispatchRecord = {
  status: OutboxStatus;
  attempts: number;
  expiresAt: string;
  idempotencyKey: string;
  providerSupportsIdempotency: boolean;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8",{fatal:true});
const toBase64Url = (bytes:Uint8Array):string=>{
  let str="";
  for(const n of bytes) str+=String.fromCharCode(n);
  return btoa(str).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
};
const fromBase64Url = (s:string):Uint8Array=>{
  if(!b64urlPattern.test(s))throw Error("Invalid encrypted envelope encoding");
  const transformed=s.replace(/-/g,"+").replace(/_/g,"/");
  const raw=atob(transformed+"=".repeat((4-transformed.length%4)%4));
  return Uint8Array.from(raw,c=>c.charCodeAt(0));
};
const validSecret=(x:unknown):x is Uint8Array=>x instanceof Uint8Array&&x.byteLength===KEY_LENGTH;
const validMail=(s:string)=>s.length>=3&&s.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

export function validateOutboxPayload(payload:MailPayload):void {
  if(!payload||typeof payload.recipient!=="string"||!validMail(payload.recipient)||
     typeof payload.creatorName!=="string"||!payload.creatorName||
     payload.creatorName.length>100||/[\x00-\x1f\x7f]/.test(payload.creatorName)||
     typeof payload.confirmationUrl!=="string")throw Error("Invalid outbound message");
  const url=new URL(payload.confirmationUrl);
  if(url.protocol!=="https:"||!["rmpworks.com","www.rmpworks.com"].includes(url.hostname)||
     url.username||url.password||url.port||url.hash||url.pathname!=="/creator/confirm-email"||
     url.searchParams.size!==1||!url.searchParams.has("token")||
     !/^[A-Za-z0-9_-]{43}$/.test(url.searchParams.get("token")||"")){
       throw Error("Unapproved confirmation URL");
     }
}

export async function sealOutboxMail(
 payload:MailPayload,
 options:{key:Uint8Array;keyId:string;associatedId:string}
):Promise<EncryptedMail>{
 validateOutboxPayload(payload);
 if(!validSecret(options.key)||!options.keyId||options.keyId.length>50||
    !/^[A-Za-z0-9_-]+$/.test(options.keyId)||
    !idPattern.test(options.associatedId))throw Error("Invalid encryption configuration");
 const iv=crypto.getRandomValues(new Uint8Array(IV_LENGTH));
 const cryptoKey=await crypto.subtle.importKey("raw",options.key,"AES-GCM",false,["encrypt"]);
 const plaintext=encoder.encode(JSON.stringify(payload));
 const ciphertext=await crypto.subtle.encrypt({
   name:"AES-GCM",iv,additionalData:encoder.encode(options.associatedId),tagLength:128
 },cryptoKey,plaintext);
 return {version:1,keyId:options.keyId,iv:toBase64Url(iv),
   ciphertext:toBase64Url(new Uint8Array(ciphertext))};
}

export async function openOutboxMail(
 envelope:EncryptedMail,
 options:{key:Uint8Array;keyId:string;associatedId:string}
):Promise<MailPayload>{
 if(!validSecret(options.key)||!envelope||envelope.version!==1||
    envelope.keyId!==options.keyId||!idPattern.test(options.associatedId)){
   throw Error("Invalid encrypted envelope");
 }
 try{
  const iv=fromBase64Url(envelope.iv);
  const ciphertext=fromBase64Url(envelope.ciphertext);
  if(iv.length!==IV_LENGTH||ciphertext.length<17)throw Error("Invalid ciphertext");
  const key=await crypto.subtle.importKey("raw",options.key,"AES-GCM",false,["decrypt"]);
  const plaintext=await crypto.subtle.decrypt({
   name:"AES-GCM",iv,additionalData:encoder.encode(options.associatedId),tagLength:128
  },key,ciphertext);
  const value=JSON.parse(decoder.decode(plaintext)) as MailPayload;
  validateOutboxPayload(value);
  return value;
 }catch{
  // Never reveal ciphertext, token, recipient or provider error.
  throw Error("Encrypted outbound message unavailable");
 }
}

const validTime=(s:string):number=>{
  if(typeof s!=="string"||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(s))return NaN;
  return Date.parse(s);
};

/**
 * Pure policy used AFTER the database has atomically claimed a job.
 * attempts counts the just-completed attempt (1..4).
 * We do not retry ambiguous provider outcomes without idempotency support.
 * Expired confirmation tokens are NEVER resent.
 */
export function decideMailRetry(
 record:OutboxDispatchRecord,
 result:DispatchResult,
 nowIso:string
):RetryDecision{
 const now=validTime(nowIso),expiry=validTime(record.expiresAt);
 if(!Number.isFinite(now)||!Number.isFinite(expiry)||
    !Number.isInteger(record.attempts)||record.attempts<1||
    record.attempts>OUTBOX_MAX_ATTEMPTS||
    !idPattern.test(record.idempotencyKey)||record.status!=="leased"||
    !["accepted","retryable","permanent","ambiguous"].includes(result)){
   return {status:"needs_review",nextAttemptAt:null};
 }
 if(result==="accepted")return {status:"sent",nextAttemptAt:null};
 if(result==="permanent"||now>=expiry)return {status:"dead",nextAttemptAt:null};
 if(result==="ambiguous"&&!record.providerSupportsIdempotency)
   return {status:"needs_review",nextAttemptAt:null};
 if(record.attempts>=OUTBOX_MAX_ATTEMPTS)return {status:"dead",nextAttemptAt:null};
 const delay=OUTBOX_RETRY_DELAYS_SECONDS[record.attempts-1]*1000;
 if(now+delay>=expiry)return {status:"dead",nextAttemptAt:null};
 return {status:"pending",nextAttemptAt:new Date(now+delay).toISOString()};
}
