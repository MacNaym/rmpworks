/**
 * B10 — Dormant Resend HTTPS transactional email transport.
 *
 * Never used by a public route, queue, cron or production Worker.
 * Use only a trusted server-side API key and a previously verified sender
 * domain. No SDK, SMTP, DNS changes or outbound calls before enabled=true.
 *
 * Resend POST /emails Idempotency-Key retention is 24 hours. The current
 * confirmation outbox expires in 15 minutes, so all permitted retries must
 * stay inside that provider guarantee. Never reuse eventId with new payload.
 */
import type {OutboundMessage} from "./creator-confirmation-mail.ts";
import type {DispatchResult} from "./creator-mail-outbox.ts";
import type {WorkerTransport} from "./creator-outbox-worker.ts";

export const RESEND_ENDPOINT="https://api.resend.com/emails" as const;
export const RESEND_FROM="RMP Works <noreply@rmpworks.com>" as const;
const ID=/^[a-f0-9]{64}$/;
const EMAIL=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const CONTROL=/[\x00-\x1f\x7f]/;
const VALID_KEY=/^re_[A-Za-z0-9_-]{8,256}$/;
const MAX_TIMEOUT=12000;
type FetchLike=typeof fetch;
export type ResendSettings={
  enabled:boolean;
  apiKey?:string;
  domainVerified:boolean; // trusted server config, never a browser assertion
  fetcher?:FetchLike;
  replyTo?:string;
  timeoutMs?:number;
};
function valid(message:OutboundMessage,replyTo?:string):boolean{
  return typeof message?.to==="string"&&message.to.length<=254&&EMAIL.test(message.to)&&
    typeof message.subject==="string"&&message.subject.length>0&&message.subject.length<=200&&!CONTROL.test(message.subject)&&
    typeof message.text==="string"&&message.text.length>0&&message.text.length<=30000&&
    typeof message.html==="string"&&message.html.length>0&&message.html.length<=30000&&
    (replyTo===undefined||(replyTo.length<=254&&EMAIL.test(replyTo)));
}
async function outcome(res:Response):Promise<DispatchResult>{
  if(res.status>=200&&res.status<300){
    try{
      const body=await res.json() as {id?:unknown};
      return body&&typeof body.id==="string"&&
        /^[A-Za-z0-9_-]{8,128}$/.test(body.id)?"accepted":"ambiguous";
    }catch{return "ambiguous";}
  }
  // Concurrent retries using the same key are safe, but conflicting
  // payloads with a reused key must be treated as terminal failures.
  if(res.status===409){
    try{
      const value=await res.json() as {name?:unknown;error?:{name?:unknown}};
      const name=value?.name??value?.error?.name;
      if(name==="concurrent_idempotent_requests")return "retryable";
      if(name==="invalid_idempotent_request")return "permanent";
    }catch{}
    return "ambiguous";
  }
  if(res.status===408||res.status===425||res.status===429||
     (res.status>=500&&res.status<=599))return "retryable";
  if(res.status===400||res.status===401||res.status===403||
     res.status===404||res.status===413||res.status===422)return "permanent";
  return "ambiguous";
}
export function makeResendHttpTransport(settings:ResendSettings):WorkerTransport{
  return {
    // Provider guarantees 24h; outbox expiry is only 15m.
    supportsIdempotency:true,
    async send(message:OutboundMessage,{eventId}:{eventId:string}):Promise<DispatchResult>{
      if(settings.enabled!==true || settings.domainVerified!==true ||
         typeof settings.apiKey!=="string"||!VALID_KEY.test(settings.apiKey) ||
         !ID.test(eventId)||!valid(message,settings.replyTo))
        return "permanent";
      const ms=settings.timeoutMs??8000;
      if(!Number.isInteger(ms)||ms<100||ms>MAX_TIMEOUT)return "permanent";
      const sender=settings.fetcher??fetch;
      try{
        const body={
          from:RESEND_FROM,
          to:[message.to],
          subject:message.subject,
          text:message.text,
          html:message.html,
          ...(settings.replyTo?{reply_to:settings.replyTo}:{})
        };
        const response=await sender(RESEND_ENDPOINT,{
          method:"POST",
          headers:{
            "authorization":"Bearer "+settings.apiKey,
            "content-type":"application/json",
            "idempotency-key":"creator-confirmation/"+eventId
          },
          body:JSON.stringify(body),
          signal:AbortSignal.timeout(ms)
        });
        return await outcome(response);
      }catch{
        // Fetch failure may happen after provider acceptance.
        // Existing outbox can retry only within the 15-minute TTL under
        // Resend's 24h idempotency guarantee; never claim success here.
        return "ambiguous";
      }
    }
  };
}
