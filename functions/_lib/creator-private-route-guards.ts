/**
 * B12.1 PRIVATE trial gates for Cloudflare Pages Functions.
 * Never trust query/body flags. No cross-origin CORS. No cookies/session auth.
 * The private bearer is server provisioned; no client code should contain it.
 * This is NOT intended as public anti-abuse protection.
 */
export type PrivateEnv={
 RMP_CREATOR_PRIVATE_TRIAL?:string;
 RMP_CREATOR_PRIVATE_KEY?:string;
 RMP_CREATOR_INTAKE_ENABLED?:string;
 RMP_CREATOR_CONFIRMATION_ENABLED?:string;
 RMP_CONFIRMATION_DISPATCH_ENABLED?:string;
 RMP_RESEND_DOMAIN_VERIFIED?:string;
 RMP_SUPABASE_URL?:string;
 RMP_SUPABASE_SERVICE_KEY?:string;
 RMP_OUTBOX_KEY_ID?:string;
 RMP_OUTBOX_KEY_B64URL?:string;
 RESEND_API_KEY?:string;
};
export type PrivateCtx={request:Request;env:PrivateEnv};
export const reply=(status:number,body:object)=>new Response(JSON.stringify(body),{
 status,headers:{"content-type":"application/json; charset=utf-8",
 "cache-control":"no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer"}
});
const allowedHost=(host:string)=>host==="rmpworks.com"||host==="www.rmpworks.com"||
 /^[a-z0-9-]+\.rmpworks\.pages\.dev$/.test(host);
function sameOrigin(request:Request):boolean{
 try{
  const url=new URL(request.url),origin=request.headers.get("origin");
  if(!origin||url.protocol!=="https:"||!allowedHost(url.hostname))return false;
  const provided=new URL(origin);
  return provided.origin===url.origin&&provided.protocol==="https:";
 }catch{return false;}
}
function bytesToHex(bytes:Uint8Array):string{
 return Array.from(bytes,b=>b.toString(16).padStart(2,"0")).join("");
}
async function fixedTimeEquals(a:string,b:string):Promise<boolean>{
 const encoder=new TextEncoder();
 // Digest length is fixed (32 bytes) independent of secret length.
 const [left,right]=await Promise.all([
  crypto.subtle.digest("SHA-256",encoder.encode(a)),
  crypto.subtle.digest("SHA-256",encoder.encode(b))
 ]);
 const x=new Uint8Array(left),y=new Uint8Array(right);
 let diff=0;
 for(let i=0;i<x.length;i++)diff|=x[i]^y[i];
 return diff===0;
}
/** Blocks by default, BEFORE any body parsing or database/provider request. */
export async function privateAuthorized(ctx:PrivateCtx):Promise<boolean>{
 if(ctx?.env?.RMP_CREATOR_PRIVATE_TRIAL!=="true"||
    ctx.request.method!=="POST"||!sameOrigin(ctx.request))return false;
 const secret=ctx.env.RMP_CREATOR_PRIVATE_KEY;
 const supplied=ctx.request.headers.get("x-rmp-private-key");
 if(typeof secret!=="string"||secret.length<32||secret.length>256||
    typeof supplied!=="string"||supplied.length<32||supplied.length>256)return false;
 return fixedTimeEquals(secret,supplied);
}
export async function readJson(ctx:PrivateCtx,maxBytes:number):Promise<Record<string,unknown>|null>{
 const ct=ctx.request.headers.get("content-type")||"";
 if(!/^application\/json(?:\s*;|$)/i.test(ct))return null;
 const length=ctx.request.headers.get("content-length");
 if(length!==null&&(+length>maxBytes||!Number.isFinite(+length)))return null;
 try{
  const body=await ctx.request.text();
  if(new TextEncoder().encode(body).length>maxBytes)return null;
  const result=JSON.parse(body);
  if(!result||typeof result!=="object"||Array.isArray(result))return null;
  return result as Record<string,unknown>;
 }catch{return null;}
}
export function decodedAES(env:PrivateEnv):Uint8Array|null{
 const v=env.RMP_OUTBOX_KEY_B64URL;
 if(typeof v!=="string"||!/^[A-Za-z0-9_-]{43}$/.test(v))return null;
 try{
  const base=v.replace(/-/g,"+").replace(/_/g,"/")+"=";
  const raw=atob(base);
  if(raw.length!==32)return null;
  return Uint8Array.from(raw,x=>x.charCodeAt(0));
 }catch{return null;}
}
export function dbReady(env:PrivateEnv):boolean{
 return typeof env.RMP_SUPABASE_URL==="string"&&
 /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(env.RMP_SUPABASE_URL)&&
 typeof env.RMP_SUPABASE_SERVICE_KEY==="string"&&
 env.RMP_SUPABASE_SERVICE_KEY.length>=32;
}
