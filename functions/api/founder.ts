// Cloudflare Pages Function: minimal Founder interest intake.
// The static Next.js export is served by Pages; only this POST executes at the edge.
// No public GET endpoint exposing stored personal information.
interface Env {
  RMP_LEADS: D1Database;
}
interface PagesContext {
  request: Request;
  env: Env;
}
const json=(data:unknown,status:number)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff"}});
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validChannel=(value:string)=>{
 try {const u=new URL(value);return u.protocol==="https:"&&u.hostname.length>3&&!u.username&&!u.password&&u.href.length<=500;}
 catch {return false;}
};
export async function onRequestPost({request,env}:PagesContext):Promise<Response>{
 try{
  const origin=request.headers.get("Origin");
  const host=new URL(request.url).origin;
  // A missing Origin is rejected; this endpoint is for browsers on the same site only.
  if(!origin||origin!==host)return json({error:"Richiesta non autorizzata."},403);
  if(!(request.headers.get("content-type")||"").toLowerCase().startsWith("application/json"))return json({error:"Formato non supportato."},415);
  if(Number(request.headers.get("content-length")||0)>8000)return json({error:"Richiesta troppo lunga."},413);
  if(!env.RMP_LEADS)return json({error:"Il servizio contatti non è configurato."},503);
  const body=await request.text();
  if(body.length>8000)return json({error:"Richiesta troppo lunga."},413);
  const data=JSON.parse(body) as Record<string,unknown>;
  const name=typeof data.name==="string"?data.name.trim():"";
  const email=typeof data.email==="string"?data.email.trim().toLowerCase():"";
  const channel=typeof data.channel==="string"?data.channel.trim():"";
  const note=typeof data.note==="string"?data.note.trim():"";
  const website=typeof data.website==="string"?data.website.trim():"";
  if(website)return json({ok:true},200); // hidden honeypot
  if(data.privacy!==true)return json({error:"È necessario prendere visione dell'informativa privacy."},400);
  if(name.length<2||name.length>100||email.length>254||!emailPattern.test(email)||!validChannel(channel)||note.length>1200)return json({error:"Controlla nome, email, link del canale e messaggio."},400);
  const id=crypto.randomUUID();
  await env.RMP_LEADS.prepare("INSERT INTO founder_leads(id,name,email,channel_url,note,source,consent_privacy_at,marketing_opt_in,status) VALUES(?,?,?,?,?,'website',CURRENT_TIMESTAMP,?,'new')")
    .bind(id,name,email,channel,note||null,data.marketing===true?1:0).run();
  return json({ok:true},201);
 }catch(error){
  if(error instanceof SyntaxError)return json({error:"Dati non validi."},400);
  console.error("Founder intake error",error instanceof Error?error.message:"unknown");
  return json({error:"Impossibile inviare la richiesta. Riprova o contattaci telefonicamente."},500);
 }
}
export async function onRequestGet(){return json({error:"Metodo non disponibile."},405);}
