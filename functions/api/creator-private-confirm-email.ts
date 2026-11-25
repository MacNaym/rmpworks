import {privateAuthorized,readJson,reply,dbReady} from "../_lib/creator-private-route-guards.ts";
import type {PrivateCtx} from "../_lib/creator-private-route-guards.ts";
import {confirmPendingCreatorLead} from "../_lib/creator-lead-workflow.ts";

/** Private trial POST only. GET must never redeem a token. */
export async function onRequestPost(ctx:PrivateCtx):Promise<Response>{
 if(!await privateAuthorized(ctx))return reply(404,{error:"Not found"});
 if(ctx.env.RMP_CREATOR_CONFIRMATION_ENABLED!=="true")return reply(503,{error:"Private confirmation disabled"});
 if(!dbReady(ctx.env))return reply(503,{error:"Server configuration unavailable"});
 const body=await readJson(ctx,512);
 if(!body)return reply(400,{error:"Invalid request"});
 const result=await confirmPendingCreatorLead({
  publicReleaseEnabled:true, // authenticated private test; NOT public release
  confirmationEnabled:true,
  db:{authorizedByServer:true,supabaseUrl:ctx.env.RMP_SUPABASE_URL!,
   backendSecret:ctx.env.RMP_SUPABASE_SERVICE_KEY!}
 },body.token);
 if(result==="unavailable")return reply(503,{error:"Service unavailable"});
 // Do not reveal if a token exists or is already redeemed.
 return reply(200,{ok:true});
}
export function onRequestGet():Response{
 return reply(405,{error:"POST required"});
}
