import {type Ctx,configured,originOk,respond,options,getCreator,isTestBuyer} from "../_lib/creator-auth";
type Account={id:string;display_name:string;topic:string;audience:string;lead_magnet_idea:string;channel_url:string};
const base=(ctx:Ctx)=>ctx.env.RMP_SUPABASE_URL!+"/rest/v1/creator_lead_magnets";
async function authorize(ctx:Ctx){
 if(!configured(ctx.env))return {error:respond(503,{error:"Generatore non configurato."})};
 const user=await getCreator(ctx.request,ctx.env);
 if(!user)return {error:respond(401,{error:"Accedi prima al Creator Desk."})};
 if(!await isTestBuyer(ctx.env,user.email))return {error:respond(403,{error:"Accesso riservato al creator autorizzato."})};
 const r=await fetch(ctx.env.RMP_SUPABASE_URL!+"/rest/v1/creator_accounts?select=id,display_name,topic,audience,lead_magnet_idea,channel_url&owner_user_id=eq."+encodeURIComponent(user.id)+"&limit=1",{headers:options(ctx.env,user.accessToken)});
 if(!r.ok)return {error:respond(503,{error:"Brief non disponibile."})};
 const rows=await r.json() as Account[];
 if(!rows.length)return {error:respond(409,{error:"Salva prima il brief del creator."})};
 return {user,account:rows[0]};
}
const uid=(id:unknown)=>typeof id==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
export async function onRequestGet(ctx:Ctx){
 try{
  const gate=await authorize(ctx);if(gate.error)return gate.error;
  const user=gate.user!,account=gate.account!;
  const r=await fetch(base(ctx)+"?select=id,format,title,subtitle,content,status,version,updated_at&creator_account_id=eq."+encodeURIComponent(account.id)+"&order=updated_at.desc&limit=30",{headers:options(ctx.env,user.accessToken)});
  if(!r.ok)return respond(503,{error:"Impossibile caricare i lead magnet."},user.headers);
  return respond(200,{account,items:await r.json()},user.headers);
 }catch(e){console.error("Magnets GET",e instanceof Error?e.message:"unknown");return respond(503,{error:"Errore temporaneo."})}
}
export async function onRequestPost(ctx:Ctx){
 try{
  if(!originOk(ctx.request))return respond(403,{error:"Origine non autorizzata."});
  const gate=await authorize(ctx);if(gate.error)return gate.error;
  const user=gate.user!,account=gate.account!;
  const raw=await ctx.request.text();if(raw.length>25000)return respond(413,{error:"Contenuto troppo lungo."});
  const x=JSON.parse(raw) as {format?:unknown;title?:unknown;subtitle?:unknown;content?:unknown};
  const format=x.format, title=typeof x.title==="string"?x.title.trim():"",subtitle=typeof x.subtitle==="string"?x.subtitle.trim():"",content=typeof x.content==="string"?x.content.trim():"";
  if(!["checklist","mini_guide"].includes(String(format))||title.length<3||title.length>180||subtitle.length>300||content.length>20000)return respond(400,{error:"Titolo, formato o contenuto non valido."});
  const r=await fetch(base(ctx),{method:"POST",headers:{...options(ctx.env,user.accessToken),prefer:"return=representation"},body:JSON.stringify({creator_account_id:account.id,format,title,subtitle,content,status:"draft",version:1})});
  if(!r.ok)return respond(400,{error:"Non è stato possibile creare la bozza."},user.headers);
  const rows=await r.json() as object[];
  return respond(201,{ok:true,item:rows[0]},user.headers);
 }catch(e){if(e instanceof SyntaxError)return respond(400,{error:"Richiesta non valida."});console.error("Magnets POST",e instanceof Error?e.message:"unknown");return respond(503,{error:"Errore temporaneo."})}
}
export async function onRequestPatch(ctx:Ctx){
 try{
  if(!originOk(ctx.request))return respond(403,{error:"Origine non autorizzata."});
  const gate=await authorize(ctx);if(gate.error)return gate.error;
  const user=gate.user!,account=gate.account!;
  const raw=await ctx.request.text();if(raw.length>25000)return respond(413,{error:"Contenuto troppo lungo."});
  const x=JSON.parse(raw) as {id?:unknown;version?:unknown;title?:unknown;subtitle?:unknown;content?:unknown;status?:unknown};
  if(!uid(x.id)||!Number.isInteger(x.version)||Number(x.version)<1)return respond(400,{error:"Bozza o versione non valida."});
  const title=typeof x.title==="string"?x.title.trim():"",subtitle=typeof x.subtitle==="string"?x.subtitle.trim():"",content=typeof x.content==="string"?x.content.trim():"";
  const status=x.status==="approved"?"approved":x.status==="draft"?"draft":null;
  if(title.length<3||title.length>180||subtitle.length>300||content.length>20000||!status||status==="approved"&&content.length<80)return respond(400,{error:"Compila e rileggi il contenuto prima di approvarlo (almeno 80 caratteri)."});
  const url=base(ctx)+"?id=eq."+encodeURIComponent(String(x.id))+"&creator_account_id=eq."+encodeURIComponent(account.id)+"&version=eq."+String(x.version);
  const r=await fetch(url,{method:"PATCH",headers:{...options(ctx.env,user.accessToken),prefer:"return=representation"},body:JSON.stringify({title,subtitle,content,status,version:Number(x.version)+1,updated_at:new Date().toISOString()})});
  if(!r.ok)return respond(503,{error:"Impossibile salvare la bozza."},user.headers);
  const rows=await r.json() as object[];
  if(!rows.length)return respond(409,{error:"La bozza è stata modificata altrove. Ricarica la pagina prima di salvare."},user.headers);
  return respond(200,{ok:true,item:rows[0]},user.headers);
 }catch(e){if(e instanceof SyntaxError)return respond(400,{error:"Richiesta non valida."});console.error("Magnets PATCH",e instanceof Error?e.message:"unknown");return respond(503,{error:"Errore temporaneo."})}
}
