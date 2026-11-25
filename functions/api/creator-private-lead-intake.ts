import {privateAuthorized,readJson,reply,decodedAES,dbReady} from "../_lib/creator-private-route-guards.ts";
import type {PrivateCtx} from "../_lib/creator-private-route-guards.ts";
import {createPendingCreatorLead} from "../_lib/creator-lead-workflow.ts";

/**
 * POST /api/creator-private-lead-intake
 * Private operator trial ONLY: no cookies, browser public access or open CORS.
 * A separate release-specific public intake route will require Turnstile
 * server-side validation, durable per-IP/tenant rate limits and abuse checks.
 */
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
export async function onRequestPost(ctx:PrivateCtx):Promise<Response>{
 if(!await privateAuthorized(ctx))return reply(404,{error:"Not found"});
 if(ctx.env.RMP_CREATOR_INTAKE_ENABLED!=="true")return reply(503,{error:"Private intake disabled"});
 if(!dbReady(ctx.env))return reply(503,{error:"Server configuration unavailable"});
 const key=decodedAES(ctx.env),keyId=ctx.env.RMP_OUTBOX_KEY_ID;
 if(!key||typeof keyId!=="string"||!/^[A-Za-z0-9_-]{1,50}$/.test(keyId))
  return reply(503,{error:"Server configuration unavailable"});
 const input=await readJson(ctx,2048);
 if(!input)return reply(400,{error:"Invalid request"});
 const creatorId=input.creator_id,magnetId=input.magnet_id;
 const email=typeof input.email==="string"?input.email.trim().toLowerCase():"";
 const fullName=typeof input.full_name==="string"?input.full_name.trim():"";
 const privacy=input.privacy_version,consent=input.delivery_consent_text;
 if(typeof creatorId!=="string"||!UUID.test(creatorId)||
    typeof magnetId!=="string"||!UUID.test(magnetId)||
    !EMAIL.test(email)||email.length>254||fullName.length>120||
    typeof privacy!=="string"||privacy.length<1||privacy.length>64||
    typeof consent!=="string"||consent.length<10||consent.length>500||
    typeof input.marketing_opt_in!=="boolean")return reply(400,{error:"Invalid request"});
 const root=ctx.env.RMP_SUPABASE_URL!.replace(/\/$/,"");
 const headers={apikey:ctx.env.RMP_SUPABASE_SERVICE_KEY!,
  authorization:"Bearer "+ctx.env.RMP_SUPABASE_SERVICE_KEY!,
  "cache-control":"no-store"};
 try{
  const [snapshot,magnet]=await Promise.all([
   fetch(root+"/rest/v1/creator_site_snapshots?select=display_name,published,published_at&creator_account_id=eq."+
    encodeURIComponent(creatorId)+"&limit=1",{headers,signal:AbortSignal.timeout(5000)}),
   fetch(root+"/rest/v1/creator_lead_magnets?select=id&creator_account_id=eq."+
    encodeURIComponent(creatorId)+"&id=eq."+encodeURIComponent(magnetId)+
    "&status=eq.approved&limit=1",{headers,signal:AbortSignal.timeout(5000)})
  ]);
  if(!snapshot.ok||!magnet.ok)return reply(503,{error:"Service unavailable"});
  const snapshots=await snapshot.json() as Array<{display_name?:string;published?:boolean;published_at?:string|null}>;
  const magnets=await magnet.json() as Array<{id:string}>;
  const site=snapshots[0];
  if(!site||!site.published||!site.published_at||!magnets.length||
     typeof site.display_name!=="string"||!site.display_name||
     site.display_name.length>100)return reply(202,{ok:true});
  const outcome=await createPendingCreatorLead({
   publicReleaseEnabled:true, // privateAuthorized above, NOT public site release
   intakeEnabled:true,
   confirmationEnabled:false,
   db:{supabaseUrl:ctx.env.RMP_SUPABASE_URL!,
    backendSecret:ctx.env.RMP_SUPABASE_SERVICE_KEY!,authorizedByServer:true},
   outbox:{key,keyId,providerSupportsIdempotency:true},
  },{
   creatorId,magnetId,email,fullName,creatorName:site.display_name,
   marketingOptIn:input.marketing_opt_in,privacyVersion:privacy,
   deliveryConsentText:consent
  });
  if(outcome==="unavailable")return reply(503,{error:"Service unavailable"});
  return reply(202,{ok:true}); // no email enumeration / lead ID disclosure
 }catch{return reply(503,{error:"Service unavailable"});}
}
