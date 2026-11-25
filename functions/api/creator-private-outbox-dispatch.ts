import {privateAuthorized,reply} from "../_lib/creator-private-route-guards.ts";
import type {PrivateCtx} from "../_lib/creator-private-route-guards.ts";
import {dispatchOneResendOutbox} from "../_lib/creator-resend-outbox-dispatch.ts";

/**
 * Private manual one-job dispatch; NEVER an unauthenticated route or cron.
 * The domain, AES and Supabase and Resend secrets must be bound server-side.
 */
export async function onRequestPost(ctx:PrivateCtx):Promise<Response>{
 if(!await privateAuthorized(ctx))return reply(404,{error:"Not found"});
 if(ctx.env.RMP_CONFIRMATION_DISPATCH_ENABLED!=="true")return reply(503,{error:"Dispatch disabled"});
 const result=await dispatchOneResendOutbox({
  ...ctx.env,
  RMP_CREATOR_PUBLIC_RELEASE:"true" // limited to authorized PRIVATE trial
 });
 if(result==="disabled"||result==="unavailable"||result==="ack_unavailable")
  return reply(503,{status:"unavailable"});
 return reply(200,{status:result});
}
export function onRequestGet():Response{
 return reply(405,{error:"POST required"});
}
