import {type Ctx,configured,respond,options,getCreator,isTestBuyer} from "../_lib/creator-auth";
type Account={id:string;display_name:string};
type Magnet={id:string;format:string;title:string;subtitle:string;content:string;status:string};
const escapeHTML=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const uuid=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
export async function onRequestGet(ctx:Ctx){
 try{
  if(!configured(ctx.env))return respond(503,{error:"Download non disponibile."});
  const user=await getCreator(ctx.request,ctx.env);
  if(!user)return respond(401,{error:"Devi accedere al Creator Desk."});
  if(!await isTestBuyer(ctx.env,user.email))return respond(403,{error:"Accesso riservato ai creator pilota."});
  const id=new URL(ctx.request.url).searchParams.get("id")||"";
  if(!uuid(id))return respond(400,{error:"Identificativo documento non valido."},user.headers);
  const base=ctx.env.RMP_SUPABASE_URL!;
  const accountRes=await fetch(base+"/rest/v1/creator_accounts?select=id,display_name&owner_user_id=eq."+encodeURIComponent(user.id)+"&limit=1",{headers:options(ctx.env,user.accessToken)});
  if(!accountRes.ok)return respond(503,{error:"Profilo non disponibile."},user.headers);
  const accounts=await accountRes.json() as Account[];
  if(!accounts.length)return respond(404,{error:"Profilo non trovato."},user.headers);
  const magnetRes=await fetch(base+"/rest/v1/creator_lead_magnets?select=id,format,title,subtitle,content,status&id=eq."+encodeURIComponent(id)+"&creator_account_id=eq."+encodeURIComponent(accounts[0].id)+"&status=eq.approved&limit=1",{headers:options(ctx.env,user.accessToken)});
  if(!magnetRes.ok)return respond(503,{error:"Documento non disponibile."},user.headers);
  const magnets=await magnetRes.json() as Magnet[];
  if(!magnets.length)return respond(404,{error:"Nessuna risorsa approvata trovata."},user.headers);
  const m=magnets[0];
  const html=`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHTML(m.title)}</title><style>body{font:16px/1.7 system-ui,Arial,sans-serif;max-width:720px;margin:55px auto;padding:0 25px;color:#171615}h1{font-size:36px;line-height:1.15}h2{font-size:20px;font-weight:400;color:#555}main{white-space:pre-wrap;overflow-wrap:break-word}footer{border-top:1px solid #333;margin-top:45px;padding-top:12px;color:#555;font-size:13px}@media print{@page{size:A4;margin:20mm}body{margin:0;padding:0}}</style></head><body><header><small>RMP WORKS · RISORSA PRIVATA DI PROVA</small><h1>${escapeHTML(m.title)}</h1><h2>${escapeHTML(m.subtitle||"")}</h2></header><main>${escapeHTML(m.content)}</main><footer>${escapeHTML(accounts[0].display_name)} · Risorsa approvata in ambiente di prova. Nessun invio pubblico.</footer></body></html>`;
  const headers=new Headers({"content-type":"text/html; charset=utf-8","content-disposition":"attachment; filename=\"rmp-risorsa-test.html\"","cache-control":"private, no-store","x-content-type-options":"nosniff","content-security-policy":"sandbox; default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'","x-robots-tag":"noindex, nofollow"});
  user.headers.forEach((v,k)=>headers.append(k,v));
  return new Response(html,{status:200,headers});
 }catch(e){console.error("private magnet download",e instanceof Error?e.message:"unknown");return respond(503,{error:"Servizio temporaneamente non disponibile."})}
}
