import {type Ctx,configured,originOk,emailOk,respond,options,authCookies,deleteCookies,getCreator,isTestBuyer} from "../_lib/creator-auth";
type Payload={action?:string;email?:string;token?:string};
export async function onRequestGet({request,env}:Ctx){
 if(!configured(env))return respond(503,{configured:false,status:"not_ready"});
 const auth=await getCreator(request,env);
 if(!auth)return respond(200,{configured:true,authenticated:false});
 return respond(200,{configured:true,authenticated:true,email:auth.email},auth.headers);
}
export async function onRequestPost({request,env}:Ctx){
 if(!originOk(request))return respond(403,{error:"Origine non autorizzata."});
 if(!configured(env))return respond(503,{error:"L'accesso creator non è ancora attivo."});
 if(Number(request.headers.get("content-length")||0)>3000)return respond(413,{error:"Richiesta troppo grande."});
 try {
  const body=await request.text();if(body.length>3000)return respond(413,{error:"Richiesta troppo grande."});
  const data=JSON.parse(body) as Payload;
  if(data.action==="logout"){
   const access=await getCreator(request,env);
   if(access)await fetch(env.RMP_SUPABASE_URL!+"/auth/v1/logout",{method:"POST",headers:options(env,access.accessToken)}).catch(()=>null);
   return respond(200,{ok:true},deleteCookies());
  }
  const email=typeof data.email==="string"?data.email.trim().toLowerCase():"";
  if(!emailOk(email))return respond(400,{error:"Inserisci una email valida."});
  if(!await isTestBuyer(env,email))return respond(403,{error:"Non risulta un ordine Founder test pagato associato a questa email."});
  if(data.action==="request"){
   // Always request the canonical Creator Desk return URL. Supabase must separately
   // allowlist it under Authentication > URL Configuration. Never use localhost.
   const redirectTo="https://rmpworks.com/creator";
   const otpUrl=new URL(env.RMP_SUPABASE_URL!+"/auth/v1/otp");
   otpUrl.searchParams.set("redirect_to",redirectTo);
   const r=await fetch(otpUrl.toString(),{method:"POST",headers:options(env),body:JSON.stringify({email,create_user:true})});
   if(!r.ok)return respond(r.status===429?429:503,{error:r.status===429?"Troppe richieste. Riprova più tardi.":"Invio codice non riuscito. Controlla la configurazione email."});
   return respond(200,{ok:true});
  }
  if(data.action==="verify"){
   const token=typeof data.token==="string"?data.token.trim():"";
   if(!/^\d{6,8}$/.test(token))return respond(400,{error:"Inserisci il codice ricevuto via email."});
   const r=await fetch(env.RMP_SUPABASE_URL!+"/auth/v1/verify",{method:"POST",headers:options(env),body:JSON.stringify({email,token,type:"email"})});
   const auth=await r.json() as {access_token?:string;refresh_token?:string;expires_in?:number};
   if(!r.ok||!auth.access_token||!auth.refresh_token)return respond(401,{error:"Codice non valido o scaduto."});
   return respond(200,{ok:true},authCookies({access_token:auth.access_token,refresh_token:auth.refresh_token,expires_in:auth.expires_in}));
  }
  return respond(400,{error:"Operazione non supportata."});
 }catch(e){if(e instanceof SyntaxError)return respond(400,{error:"Formato errato."});console.error("Creator auth",e instanceof Error?e.message:"unknown");return respond(503,{error:"Servizio momentaneamente non disponibile."})}
}
