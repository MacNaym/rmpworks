import {type Ctx,configured,originOk,respond,options,getCreator,isTestBuyer,emailOk} from "../_lib/creator-auth";
type Account={id:string};
type Lead={id:string;email:string;full_name:string;source:string;status:string;consent_at:string;created_at:string};
async function authorize(ctx:Ctx){
 if(!configured(ctx.env))return {error:respond(503,{error:"Area CRM non configurata."})};
 const user=await getCreator(ctx.request,ctx.env);
 if(!user)return {error:respond(401,{error:"Accedi al Creator Desk prima di usare il CRM."})};
 if(!await isTestBuyer(ctx.env,user.email))return {error:respond(403,{error:"Accesso riservato ai creator con ordine verificato."})};
 const r=await fetch(ctx.env.RMP_SUPABASE_URL!+"/rest/v1/creator_accounts?select=id&owner_user_id=eq."+encodeURIComponent(user.id)+"&limit=1",{headers:options(ctx.env,user.accessToken)});
 if(!r.ok)return {error:respond(503,{error:"Profilo creator non disponibile."})};
 const rows=await r.json() as Account[];
 if(!rows.length)return {error:respond(409,{error:"Completa il brief creator prima di usare il CRM."})};
 return {user,account:rows[0]};
}
const endpoint=(ctx:Ctx)=>ctx.env.RMP_SUPABASE_URL!+"/rest/v1/creator_leads";
export async function onRequestGet(ctx:Ctx){
 try{
  const gate=await authorize(ctx);if(gate.error)return gate.error;
  const u=gate.user!, account=gate.account!;
  const r=await fetch(endpoint(ctx)+"?select=id,email,full_name,source,status,consent_at,created_at&creator_account_id=eq."+encodeURIComponent(account.id)+"&order=created_at.desc&limit=100",{headers:options(ctx.env,u.accessToken)});
  if(!r.ok)return respond(503,{error:"Impossibile caricare i contatti."},u.headers);
  return respond(200,{leads:await r.json()},u.headers);
 }catch(e){console.error("CRM GET",e instanceof Error?e.message:"unknown");return respond(503,{error:"Errore temporaneo."})}
}
export async function onRequestPost(ctx:Ctx){
 try{
  if(!originOk(ctx.request))return respond(403,{error:"Origine non autorizzata."});
  const gate=await authorize(ctx);if(gate.error)return gate.error;
  const u=gate.user!, account=gate.account!;
  const raw=await ctx.request.text();if(raw.length>3000)return respond(413,{error:"Richiesta troppo grande."});
  const input=JSON.parse(raw) as {email?:unknown;full_name?:unknown;consent?:unknown};
  const email=typeof input.email==="string"?input.email.trim().toLowerCase():"";
  const full_name=typeof input.full_name==="string"?input.full_name.trim():"";
  if(!emailOk(email)||full_name.length>120||input.consent!==true)return respond(400,{error:"Email valida e consenso esplicito alla registrazione del contatto di prova sono obbligatori."});
  const consent_text="Accetto che RMP Works registri questi dati per il collaudo privato del Creator CRM. Nessuna email promozionale.";
  const r=await fetch(endpoint(ctx),{method:"POST",headers:{...options(ctx.env,u.accessToken),prefer:"return=representation"},body:JSON.stringify({creator_account_id:account.id,email,full_name,source:"preview_test",status:"new",consent_text})});
  if(r.status===409)return respond(409,{error:"Questo contatto di prova esiste già."},u.headers);
  if(!r.ok)return respond(400,{error:"Impossibile registrare il contatto."},u.headers);
  const rows=await r.json() as Lead[];
  return respond(201,{ok:true,lead:rows[0]||null},u.headers);
 }catch(e){if(e instanceof SyntaxError)return respond(400,{error:"Dati non validi."});console.error("CRM POST",e instanceof Error?e.message:"unknown");return respond(503,{error:"Errore temporaneo."})}
}
export async function onRequestPatch(ctx:Ctx){
 try{
  if(!originOk(ctx.request))return respond(403,{error:"Origine non autorizzata."});
  const gate=await authorize(ctx);if(gate.error)return gate.error;
  const u=gate.user!,account=gate.account!;
  const raw=await ctx.request.text();if(raw.length>1500)return respond(413,{error:"Richiesta troppo grande."});
  const input=JSON.parse(raw) as {id?:unknown;status?:unknown};
  const id=typeof input.id==="string"?input.id:"";
  const status=typeof input.status==="string"?input.status:"";
  if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/.test(id)||!["new","contacted","qualified","converted","archived"].includes(status))return respond(400,{error:"Contatto o stato non valido."});
  const url=endpoint(ctx)+"?id=eq."+encodeURIComponent(id)+"&creator_account_id=eq."+encodeURIComponent(account.id);
  const r=await fetch(url,{method:"PATCH",headers:{...options(ctx.env,u.accessToken),prefer:"return=representation"},body:JSON.stringify({status,updated_at:new Date().toISOString()})});
  if(!r.ok)return respond(503,{error:"Impossibile aggiornare lo stato."},u.headers);
  const rows=await r.json() as Lead[];
  if(!rows.length)return respond(404,{error:"Contatto non trovato."},u.headers);
  return respond(200,{ok:true,lead:rows[0]},u.headers);
 }catch(e){if(e instanceof SyntaxError)return respond(400,{error:"Dati non validi."});console.error("CRM PATCH",e instanceof Error?e.message:"unknown");return respond(503,{error:"Errore temporaneo."})}
}
