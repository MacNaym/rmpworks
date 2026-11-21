import {type Ctx,configured,originOk,respond,options,getCreator,isTestBuyer} from "../_lib/creator-auth";
type Account={id:string};
async function auth(ctx:Ctx){
 if(!configured(ctx.env))return {error:respond(503,{error:"Catalogo non disponibile."})};
 const user=await getCreator(ctx.request,ctx.env);
 if(!user)return {error:respond(401,{error:"Accedi al Creator Desk."})};
 if(!await isTestBuyer(ctx.env,user.email))return {error:respond(403,{error:"Accesso riservato ai creator pilota."})};
 const r=await fetch(ctx.env.RMP_SUPABASE_URL!+"/rest/v1/creator_accounts?select=id&owner_user_id=eq."+encodeURIComponent(user.id)+"&limit=1",{headers:options(ctx.env,user.accessToken)});
 if(!r.ok)return {error:respond(503,{error:"Profilo non disponibile."})};
 const rows=await r.json() as Account[];
 if(!rows.length)return {error:respond(409,{error:"Completa prima il brief."})};
 return {user,account:rows[0]};
}
const url=(ctx:Ctx)=>ctx.env.RMP_SUPABASE_URL!+"/rest/v1/creator_products";
const validId=(v:unknown)=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export async function onRequestGet(ctx:Ctx){
 try{
  const gate=await auth(ctx);if(gate.error)return gate.error;
  const u=gate.user!,a=gate.account!;
  const r=await fetch(url(ctx)+"?select=id,title,description,price_cents,currency,fulfillment_notes,status,updated_at&creator_account_id=eq."+encodeURIComponent(a.id)+"&order=created_at.desc&limit=50",{headers:options(ctx.env,u.accessToken)});
  if(!r.ok)return respond(503,{error:"Impossibile caricare i prodotti."},u.headers);
  return respond(200,{products:await r.json()},u.headers);
 }catch(e){console.error("products GET",e instanceof Error?e.message:"unknown");return respond(503,{error:"Errore temporaneo."})}
}
const parse=(x:Record<string,unknown>)=>{
 const title=typeof x.title==="string"?x.title.trim():"";
 const description=typeof x.description==="string"?x.description.trim():"";
 const fulfillment_notes=typeof x.fulfillment_notes==="string"?x.fulfillment_notes.trim():"";
 const price_cents=x.price_cents;
 const status=x.status==="ready_for_review"?"ready_for_review":"draft";
 if(title.length<3||title.length>180||description.length>3000||fulfillment_notes.length>3000||!Number.isInteger(price_cents)||Number(price_cents)<300||Number(price_cents)>9900)return null;
 return {title,description,fulfillment_notes,price_cents:Number(price_cents),status};
};
export async function onRequestPost(ctx:Ctx){
 try{
  if(!originOk(ctx.request))return respond(403,{error:"Origine non autorizzata."});
  const gate=await auth(ctx);if(gate.error)return gate.error;
  const u=gate.user!,a=gate.account!;
  const raw=await ctx.request.text();if(raw.length>9000)return respond(413,{error:"Dati troppo lunghi."});
  const v=parse(JSON.parse(raw) as Record<string,unknown>);
  if(!v)return respond(400,{error:"Compila titolo, prezzo e informazioni del prodotto."});
  const r=await fetch(url(ctx),{method:"POST",headers:{...options(ctx.env,u.accessToken),prefer:"return=representation"},body:JSON.stringify({...v,status:"draft",creator_account_id:a.id,currency:"eur"})});
  if(!r.ok)return respond(400,{error:"Impossibile creare la bozza."},u.headers);
  const rows=await r.json() as object[];
  return respond(201,{ok:true,product:rows[0]},u.headers);
 }catch(e){if(e instanceof SyntaxError)return respond(400,{error:"JSON non valido."});console.error("products POST",e instanceof Error?e.message:"unknown");return respond(503,{error:"Errore temporaneo."})}
}
export async function onRequestPatch(ctx:Ctx){
 try{
  if(!originOk(ctx.request))return respond(403,{error:"Origine non autorizzata."});
  const gate=await auth(ctx);if(gate.error)return gate.error;
  const u=gate.user!,a=gate.account!;
  const raw=await ctx.request.text();if(raw.length>9000)return respond(413,{error:"Dati troppo lunghi."});
  const x=JSON.parse(raw) as Record<string,unknown>;
  if(!validId(x.id))return respond(400,{error:"ID prodotto non valido."});
  const v=parse(x);
  if(!v)return respond(400,{error:"Dati del prodotto non validi."});
  if(v.status==="ready_for_review"&&(v.description.length<30||v.fulfillment_notes.length<20))return respond(400,{error:"Per inviare in revisione servono una descrizione e istruzioni di consegna."});
  const r=await fetch(url(ctx)+"?id=eq."+encodeURIComponent(String(x.id))+"&creator_account_id=eq."+encodeURIComponent(a.id),{method:"PATCH",headers:{...options(ctx.env,u.accessToken),prefer:"return=representation"},body:JSON.stringify({...v,updated_at:new Date().toISOString()})});
  if(!r.ok)return respond(503,{error:"Impossibile salvare il prodotto."},u.headers);
  const rows=await r.json() as object[];
  if(!rows.length)return respond(404,{error:"Prodotto non trovato."},u.headers);
  return respond(200,{ok:true,product:rows[0]},u.headers);
 }catch(e){if(e instanceof SyntaxError)return respond(400,{error:"JSON non valido."});console.error("products PATCH",e instanceof Error?e.message:"unknown");return respond(503,{error:"Errore temporaneo."})}
}
