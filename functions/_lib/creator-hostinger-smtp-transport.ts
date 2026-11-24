/**
 * B9.3 — DORMANT Hostinger Email SMTP submission contract.
 *
 * Important: Hostinger SMTP is not an HTTPS API. This adapter deliberately
 * does NOT open TCP sockets, does NOT provide SMTP credentials and cannot
 * send a message on its own. The supplied submitter must be implemented in
 * a separate trusted runtime with verified SMTP/TLS capability.
 *
 * SMTP cannot be assumed to provide an idempotent send operation. An
 * ambiguous submission must NOT be retried automatically.
 */
import type {OutboundMessage} from "./creator-confirmation-mail.ts";
import type {DispatchResult,} from "./creator-mail-outbox.ts";
import type {WorkerTransport} from "./creator-outbox-worker.ts";

export const HOSTINGER_SMTP_HOST="smtp.hostinger.com";
export const HOSTINGER_SMTP_PORT=465;
export const HOSTINGER_SMTP_TLS="implicit" as const;
export const HOSTINGER_SMTP_SENDER="noreply@rmpworks.com";
export const HOSTINGER_SMTP_IDEMPOTENT=false as const;

export type SmtpSubmission =
  | {state:"accepted"}
  | {state:"rejected";classification:"temporary"|"permanent"}
  | {state:"uncertain"};
export type SecureSmtpSubmitter=(input:{
  host:typeof HOSTINGER_SMTP_HOST;
  port:typeof HOSTINGER_SMTP_PORT;
  tls:typeof HOSTINGER_SMTP_TLS;
  from:typeof HOSTINGER_SMTP_SENDER;
  replyTo?:string;
  message:OutboundMessage;
  eventId:string; // Correlation only. NOT an SMTP idempotency guarantee.
})=>Promise<SmtpSubmission>;
export type SmtpAdapterSettings={
  enabled:boolean;
  submit?:SecureSmtpSubmitter;
  replyTo?:string;
};

const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const eventIdPattern=/^[a-f0-9]{64}$/;
const control=/[\x00-\x1f\x7f]/;

export function makeHostingerSmtpTransport(
  settings:SmtpAdapterSettings
):WorkerTransport{
  const submit=settings.submit;
  const replyTo=settings.replyTo;
  return {
    supportsIdempotency:false,
    async send(message:OutboundMessage,{eventId}:{eventId:string}):Promise<DispatchResult>{
      if(settings.enabled!==true || typeof submit!=="function")return "permanent";
      if(!eventIdPattern.test(eventId)||
         typeof message?.to!=="string"||
         !emailPattern.test(message.to)||message.to.length>254||
         typeof message.subject!=="string"||!message.subject||
         message.subject.length>200||control.test(message.subject)||
         typeof message.text!=="string"||!message.text||
         message.text.length>30000||
         typeof message.html!=="string"||!message.html||
         message.html.length>30000||
         (replyTo!==undefined && (
            typeof replyTo!=="string"||
            !emailPattern.test(replyTo)||replyTo.length>254
         ))) return "permanent";
      try{
        const result=await submit({
          host:HOSTINGER_SMTP_HOST,
          port:HOSTINGER_SMTP_PORT,
          tls:HOSTINGER_SMTP_TLS,
          from:HOSTINGER_SMTP_SENDER,
          ...(replyTo?{replyTo}:{}),
          message,
          eventId,
        });
        if(result?.state==="accepted")return "accepted";
        if(result?.state==="rejected")
          return result.classification==="temporary"?"retryable":
            result.classification==="permanent"?"permanent":"ambiguous";
        return "ambiguous";
      }catch{
        // An exception can occur after an SMTP server accepted DATA.
        // Without provider idempotency, always treat as unknown.
        return "ambiguous";
      }
    }
  };
}
