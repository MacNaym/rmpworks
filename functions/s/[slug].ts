type Env={RMP_CREATOR_PUBLIC_RELEASE?:string;RMP_SUPABASE_URL?:string;RMP_SUPABASE_PUBLISHABLE_KEY?:string};
type Ctx={request:Request;env:Env;params:{slug?:string}};
type Site={slug:string;display_name:string;topic:string;audience:string;channel_url:string;freebie_title:string};
const noStore={"cache-control":"no-store","x-content-type-options":"nosniff","x-robots-tag":"noindex,nofollow"};
const notFound=()=>new Response("Pagina non disponibile.",{status:404,headers:{"content-type":"text/plain; charset=utf-8",...noStore}});
const esc=(x:string)=>x.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
export async function onRequestGet({request,env,params}:Ctx){
 // Release switch is NEVER set during pilot. This route intentionally returns 404.
 if(env.RMP_CREATOR_PUBLIC_RELEASE!=="explicit-creator-release-v1")return notFound();
 const slug=params.slug||"";
 if(!/^[a-z0-9][a-z0-9-]{2,39}$/.test(slug))return notFound();
 const base=env.RMP_SUPABASE_URL||"";
 const key=env.RMP_SUPABASE_PUBLISHABLE_KEY||"";
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(base)||!key)return notFound();
 try{
  const endpoint=new URL(base+"/rest/v1/creator_site_snapshots");
  endpoint.searchParams.set("select","slug,display_name,topic,audience,channel_url,freebie_title");
  endpoint.searchParams.set("slug","eq."+slug);
  endpoint.searchParams.set("published","eq.true");
  endpoint.searchParams.set("limit","1");
  const r=await fetch(endpoint.toString(),{headers:{apikey:key,accept:"application/json"},cache:"no-store"});
  if(!r.ok)return notFound();
  const rows=await r.json() as Site[];
  if(!rows.length)return notFound();
  const s=rows[0];
  let channel="";
  try{const u=new URL(s.channel_url);if(u.protocol==="https:"&&!u.username&&!u.password)channel=u.href;}catch{}
  const page=`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(s.display_name)} · RMP Works</title><style>body{font:17px/1.65 system-ui,Arial,sans-serif;background:#f7f3ea;color:#171615;margin:0}header,main,footer{padding:35px max(24px,calc((100vw - 1050px)/2))}header{border-bottom:2px solid}main{background:#ffdf4e;padding-top:80px;padding-bottom:80px;border-bottom:2px solid}h1{font-size:clamp(2.9rem,8vw,6rem);line-height:.97;text-transform:uppercase;overflow-wrap:anywhere;margin:20px 0}p{max-width:720px}a{color:#171615;font-weight:bold}section{padding:35px 0}footer{font-size:14px}</style></head><body><header><strong>${esc(s.display_name)}</strong> · RMP Works</header><main><small>SPAZIO CREATOR</small><h1>${esc(s.display_name)}</h1><p>${esc(s.topic)}</p><p>${esc(s.audience)}</p>${channel?`<p><a href="${esc(channel)}" rel="noopener noreferrer" target="_blank">Visita il canale</a></p>`:""}</main><section style="padding:45px max(24px,calc((100vw - 1050px)/2))"><h2>Risorse gratuite</h2><p>${esc(s.freebie_title||"Materiali in preparazione")}</p><p>Iscrizioni e vendite non sono disponibili in questa versione.</p></section><footer>Una pagina RMP Works. Nessun prodotto acquistabile.</footer></body></html>`;
  return new Response(page,{status:200,headers:{"content-type":"text/html; charset=utf-8",...noStore,"content-security-policy":"default-src 'none'; style-src 'unsafe-inline'; img-src 'none'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'"}});
 }catch{return notFound()}
}
export async function onRequestPost(){return notFound()}
