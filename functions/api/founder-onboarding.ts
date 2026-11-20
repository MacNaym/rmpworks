// RMP Founder onboarding — TEST ONLY. No service activation or customer email sent.
// Session ID is an opaque checkout reference. Matching checkout buyer email is also required.
// Future live flow must replace this with authenticated customer session/magic link.
type D1Result={success?:boolean;meta?:unknown};
type D1Statement={bind(...v:unknown[]):{first<T>():Promise<T|null>;run():Promise<D1Result>}};
type Env={RMP_LEADS:{prepare(sql:string):D1Statement}};
type Context={request:Request;env:Env};
type Order={status:string;buyer_email:string|null;livemode:number;stripe_payment_link_id:string};
const expectedLink="plink_1Udo6CCI5i4j9XdrhFC0m0Cy";
const headers={"content-type":"application/json; charset=utf-8","cache-control":"private, no-store","x-content-type-options":"nosniff","referrer-policy":"no-referrer"};
const answer=(status:number,data:object)=>new Response(JSON.stringify(data),{status,headers});
const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export async function onRequestPost({request,env}:Context){
 try{
  const origin=request.headers.get("origin");
  if(!origin||origin!==new URL(request.url).origin)return answer(403,{error:"Origin non autorizzata."});
  if(!(request.headers.get("content-type")||"").toLowerCase().startsWith("application/json"))return answer(415,{error:"Formato non valido."});
  if(Number(request.headers.get("content-length")||0)>6000)return answer(413,{error:"Dati troppo lunghi."});
  if(!env.RMP_LEADS)return answer(503,{error:"Servizio non disponibile."});
  const raw=await request.text();
  if(raw.length>6000)return answer(413,{error:"Dati troppo lunghi."});
  const data=JSON.parse(raw) as Record<string,unknown>;
  const id=typeof data.session_id==="string"?data.session_id:"";
  const name=typeof data.creator_name==="string"?data.creator_name.trim():"";
  const email=typeof data.creator_email==="string"?data.creator_email.trim().toLowerCase():"";
  const channel=typeof data.channel_url==="string"?data.channel_url.trim():"";
  const goal=typeof data.project_goal==="string"?data.project_goal.trim():"";
  if(!/^cs_test_[A-Za-z0-9]{15,180}$/.test(id)||name.length<2||name.length>100||!emailPattern.test(email)||email.length>254||goal.length<10||goal.length>1000||data.acknowledge!==true)return answer(400,{error:"Controlla i campi obbligatori."});
  let url:URL;try{url=new URL(channel)}catch{return answer(400,{error:"Inserisci il link completo del canale."})}
  if(url.protocol!=="https:"||url.username||url.password||channel.length>500)return answer(400,{error:"Link del canale non valido."});
  const order=await env.RMP_LEADS.prepare("SELECT status,buyer_email,livemode,stripe_payment_link_id FROM founder_orders WHERE checkout_session_id=?").bind(id).first<Order>();
  if(!order||order.status!=="paid"||order.livemode!==0||order.stripe_payment_link_id!==expectedLink||!order.buyer_email||order.buyer_email.toLowerCase()!==email)return answer(403,{error:"Ordine test non verificato o email non corrispondente al checkout."});
  const existing=await env.RMP_LEADS.prepare("SELECT checkout_session_id FROM founder_onboarding WHERE checkout_session_id=?").bind(id).first<{checkout_session_id:string}>();
  if(existing)return answer(409,{error:"Il questionario di prova è già stato registrato per questo ordine."});
  await env.RMP_LEADS.prepare("INSERT INTO founder_onboarding(checkout_session_id,creator_name,creator_email,channel_url,project_goal) VALUES(?,?,?,?,?)").bind(id,name,email,channel,goal).run();
  return answer(201,{ok:true});
 }catch(error){if(error instanceof SyntaxError)return answer(400,{error:"Dati non validi."});
  console.error("Founder onboarding error",error instanceof Error?error.message:"unknown");
  return answer(500,{error:"Non è stato possibile salvare il questionario."});
 }
}
export async function onRequestGet(){return answer(405,{error:"Metodo non disponibile."});}
