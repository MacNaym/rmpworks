import {type Ctx,configured,originOk,respond,options,getCreator,isTestBuyer} from "../_lib/creator-auth";
type Payload={display_name?:unknown;channel_url?:unknown;slug?:unknown;topic?:unknown;audience?:unknown;lead_magnet_idea?:unknown;micro_product_idea?:unknown;premium_product_idea?:unknown;style_notes?:unknown};
const textField=(x:unknown,max=1000)=>typeof x==="string"?x.trim().slice(0,max+1):"";
async function authorize({request,env}:Ctx){
 if(!configured(env))return {error:respond(503,{error:"Area creator non ancora attiva."})};
 const user=await getCreator(request,env);
 if(!user)return {error:respond(401,{error:"Devi accedere con la tua email."})};
 if(!await isTestBuyer(env,user.email))return {error:respond(403,{error:"Non è presente un acquisto Founder test verificato."})};
 return {user};
}
export async function onRequestGet(ctx:Ctx){
 try{
  const gate=await authorize(ctx);if(gate.error)return gate.error;
  const u=gate.user!;
  const r=await fetch(ctx.env.RMP_SUPABASE_URL!+"/rest/v1/creator_accounts?select=id,display_name,channel_url,slug,status,onboarding_step,topic,audience,lead_magnet_idea,micro_product_idea,premium_product_idea,style_notes&owner_user_id=eq."+encodeURIComponent(u.id)+"&limit=1",{headers:options(ctx.env,u.accessToken)});
  if(!r.ok)return respond(503,{error:"Dati creator non disponibili."},u.headers);
  const rows=await r.json() as object[];
  return respond(200,{account:rows[0]||null},u.headers);
 }catch(e){console.error("creator profile GET",e instanceof Error?e.message:"unknown");return respond(503,{error:"Errore temporaneo."})}
}
export async function onRequestPost(ctx:Ctx){
 try{
  if(!originOk(ctx.request))return respond(403,{error:"Origine non autorizzata."});
  const gate=await authorize(ctx);if(gate.error)return gate.error;
  const u=gate.user!;
  const raw=await ctx.request.text();if(raw.length>9000)return respond(413,{error:"Dati troppo lunghi."});
  const x=JSON.parse(raw) as Payload;
  const display_name=textField(x.display_name,100);
  const channel_url=textField(x.channel_url,500);
  const slug=textField(x.slug,40).toLowerCase();
  const topic=textField(x.topic,200);
  const audience=textField(x.audience,500);
  const lead_magnet_idea=textField(x.lead_magnet_idea,1000);
  const micro_product_idea=textField(x.micro_product_idea,1000);
  const premium_product_idea=textField(x.premium_product_idea,1000);
  const style_notes=textField(x.style_notes,1000);
  let channel:URL;try{channel=new URL(channel_url)}catch{return respond(400,{error:"Link del canale non valido."})}
  if(display_name.length<2||display_name.length>100||channel.protocol!=="https:"||channel.username||channel.password||channel_url.length>500||!(/^[a-z0-9][a-z0-9-]{2,39}$/.test(slug))||topic.length<3||[audience,lead_magnet_idea,micro_product_idea,premium_product_idea,style_notes].some(x=>x.length>1000))return respond(400,{error:"Verifica nome, canale, sottodominio e descrizioni."});
  // Status and owner ID are server-generated; clients cannot set activation status.
  const payload={owner_user_id:u.id,display_name,channel_url,slug,topic,audience,lead_magnet_idea,micro_product_idea,premium_product_idea,style_notes,onboarding_step:5};
  const r=await fetch(ctx.env.RMP_SUPABASE_URL!+"/rest/v1/creator_accounts?on_conflict=owner_user_id",{method:"POST",headers:{...options(ctx.env,u.accessToken),"prefer":"resolution=merge-duplicates,return=representation"},body:JSON.stringify(payload)});
  if(!r.ok){const message=await r.text();return respond(r.status===409?409:400,{error:message.includes("creator_accounts_slug_key")?"Questo sottodominio è già occupato. Scegline un altro.":"Non è stato possibile salvare il profilo. Controlla i dati e riprova."},u.headers)}
  const rows=await r.json() as object[];
  return respond(200,{ok:true,account:rows[0]||null},u.headers);
 }catch(e){if(e instanceof SyntaxError)return respond(400,{error:"Dati non validi."});console.error("creator profile POST",e instanceof Error?e.message:"unknown");return respond(503,{error:"Servizio non disponibile."})}
}
