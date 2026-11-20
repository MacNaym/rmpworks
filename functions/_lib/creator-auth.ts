// Cloudflare Pages Functions / RMP Creator Studio auth helpers.
// No service-role credentials in browser or in repository.
export type CreatorEnv = {
  RMP_LEADS: {prepare(sql:string):{bind(...args:unknown[]):{first<T>():Promise<T|null>}}};
  RMP_SUPABASE_URL?:string;
  RMP_SUPABASE_PUBLISHABLE_KEY?:string;
};
export type Ctx={request:Request;env:CreatorEnv};
export const jsonHeaders={"content-type":"application/json; charset=utf-8","cache-control":"no-store, private","x-content-type-options":"nosniff","referrer-policy":"no-referrer"};
export const respond=(status:number,data:object,extraHeaders?:Headers)=>{const h=new Headers(jsonHeaders);extraHeaders?.forEach((v,k)=>h.append(k,v));return new Response(JSON.stringify(data),{status,headers:h})};
const cookieName="rmp_creator_access";
const refreshName="rmp_creator_refresh";
export const emailOk=(s:string)=>s.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export const originOk=(r:Request)=>r.headers.get("Origin")===new URL(r.url).origin;
export const configured=(e:CreatorEnv)=>!!e.RMP_SUPABASE_URL&&!!e.RMP_SUPABASE_PUBLISHABLE_KEY&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(e.RMP_SUPABASE_URL);
export const options=(e:CreatorEnv,token?:string)=>({"apikey":e.RMP_SUPABASE_PUBLISHABLE_KEY||"","authorization":"Bearer "+(token||e.RMP_SUPABASE_PUBLISHABLE_KEY||""),"content-type":"application/json"});
export function cookieValue(request:Request,key:string):string{
 const pair=(request.headers.get("cookie")||"").split(";").map(s=>s.trim()).find(s=>s.startsWith(key+"="));
 return pair?decodeURIComponent(pair.slice(key.length+1)):"";
}
export function authCookies(tokens:{access_token:string;refresh_token:string;expires_in?:number}):Headers{
 const h=new Headers();
 const max=Math.max(60,Math.min(tokens.expires_in||3600,3600));
 h.append("set-cookie",cookieName+"="+encodeURIComponent(tokens.access_token)+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age="+max);
 h.append("set-cookie",refreshName+"="+encodeURIComponent(tokens.refresh_token)+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000");
 return h;
}
export function deleteCookies():Headers{
 const h=new Headers();
 h.append("set-cookie",cookieName+"=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
 h.append("set-cookie",refreshName+"=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
 return h;
}
export type Authed={id:string;email:string;accessToken:string;headers:Headers};
export async function getCreator(request:Request,env:CreatorEnv):Promise<Authed|null>{
 if(!configured(env))return null;
 let access=cookieValue(request,cookieName);
 const base=env.RMP_SUPABASE_URL!;
 const key=env.RMP_SUPABASE_PUBLISHABLE_KEY!;
 let h=new Headers();
 let u=access?await fetch(base+"/auth/v1/user",{headers:options(env,access)}):null;
 if(!u?.ok){
  const refresh=cookieValue(request,refreshName);
  if(!refresh)return null;
  const r=await fetch(base+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:options(env),body:JSON.stringify({refresh_token:refresh})});
  if(!r.ok)return null;
  const data=await r.json() as {access_token?:string;refresh_token?:string;expires_in?:number};
  if(!data.access_token||!data.refresh_token)return null;
  access=data.access_token;
  h=authCookies({access_token:access,refresh_token:data.refresh_token,expires_in:data.expires_in});
  u=await fetch(base+"/auth/v1/user",{headers:options(env,access)});
 }
 if(!u.ok)return null;
 const user=await u.json() as {id?:string;email?:string};
 if(!user.id||!user.email)return null;
 return {id:user.id,email:user.email.toLowerCase(),accessToken:access,headers:h};
}
export async function isTestBuyer(env:CreatorEnv,email:string):Promise<boolean>{
 const row=await env.RMP_LEADS.prepare("SELECT checkout_session_id FROM founder_orders WHERE status='paid' AND livemode=0 AND stripe_payment_link_id='plink_1Udo6CCI5i4j9XdrhFC0m0Cy' AND lower(buyer_email)=? LIMIT 1").bind(email.toLowerCase()).first<{checkout_session_id:string}>();
 return !!row;
}
