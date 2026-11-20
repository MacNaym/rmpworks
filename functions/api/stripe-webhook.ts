// Stripe TEST webhook for RMP Creator Studio — signed, idempotent, no live payments.
// Do not add a live Stripe secret to this endpoint without a separate deployment review.
type D1Statement = {bind(...values:unknown[]): {run():Promise<unknown>;first<T>():Promise<T|null>}};
type D1 = {prepare(sql:string):D1Statement};
type Env = {RMP_LEADS:D1;STRIPE_WEBHOOK_SECRET_TEST?:string};
type Context = {request:Request;env:Env};
const testPaymentLink = "plink_1Udo6CCI5i4j9XdrhFC0m0Cy";
const noStore = {"cache-control":"no-store","content-type":"application/json; charset=utf-8","x-content-type-options":"nosniff"};
const reply=(status:number,body:object)=>new Response(JSON.stringify(body),{status,headers:noStore});
function parseSignature(header:string):{timestamp:number;signatures:string[]}|null {
 const fields=header.split(",").map(part=>part.trim().split("="));
 const t=fields.find(parts=>parts[0]==="t");
 const signatures=fields.filter(parts=>parts[0]==="v1").map(parts=>parts.slice(1).join("=")).filter(Boolean);
 const timestamp=Number(t?.[1]||"");
 if(!Number.isSafeInteger(timestamp)||timestamp<=0||signatures.length===0)return null;
 return {timestamp,signatures};
}
async function verifyStripe(body:string,header:string,secret:string):Promise<boolean>{
 const sig=parseSignature(header);
 if(!sig||Math.abs(Math.floor(Date.now()/1000)-sig.timestamp)>300)return false;
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
 const bytes=new TextEncoder().encode(sig.timestamp+"."+body);
 for(const hex of sig.signatures){
  if(!/^[0-9a-f]{64}$/i.test(hex))continue;
  const signature=new Uint8Array((hex.match(/.{2}/g)||[]).map(part=>parseInt(part,16)));
  if(await crypto.subtle.verify("HMAC",key,signature,bytes))return true;
 }
 return false;
}
type Checkout = {
 id?:string; object?:string; payment_link?:string|null;payment_status?:string;
 payment_intent?:string|null;customer?:string|null;
 customer_details?:{email?:string|null}|null;customer_email?:string|null;
 amount_total?:number|null;total_details?:{amount_tax?:number|null}|null;
 currency?:string|null;
};
type StripeEvent={id?:string;type?:string;livemode?:boolean;data?:{object?:Checkout}};
const supported=new Set(["checkout.session.completed","checkout.session.async_payment_succeeded","checkout.session.async_payment_failed","checkout.session.expired"]);
export async function onRequestPost({request,env}:Context):Promise<Response>{
 try {
  if(!env.STRIPE_WEBHOOK_SECRET_TEST||!env.RMP_LEADS)return reply(503,{error:"Webhook not configured"});
  if(Number(request.headers.get("content-length")||0)>100000)return reply(413,{error:"Too large"});
  const raw=await request.text();
  if(raw.length>100000)return reply(413,{error:"Too large"});
  const signature=request.headers.get("Stripe-Signature")||"";
  if(!await verifyStripe(raw,signature,env.STRIPE_WEBHOOK_SECRET_TEST))return reply(400,{error:"Invalid signature"});
  const event=JSON.parse(raw) as StripeEvent;
  if(!event.id||!event.type||event.livemode!==false)return reply(400,{error:"Invalid event"});
  if(!supported.has(event.type))return reply(200,{received:true,ignored:true});
  const session=event.data?.object;
  if(!session||session.object!=="checkout.session"||!session.id||session.payment_link!==testPaymentLink)return reply(200,{received:true,ignored:true});
  const previous=await env.RMP_LEADS.prepare("SELECT id FROM stripe_webhook_events WHERE id=?").bind(event.id).first<{id:string}>();
  if(previous)return reply(200,{received:true,duplicate:true});
  const status=event.type==="checkout.session.expired"?"expired":event.type==="checkout.session.async_payment_failed"?"failed":session.payment_status==="paid"?"paid":"pending";
  // UPSERT is replay-safe. Record the event only after order write succeeds, allowing Stripe retry on failure.
  await env.RMP_LEADS.prepare("INSERT INTO founder_orders(checkout_session_id,stripe_payment_intent_id,stripe_payment_link_id,stripe_customer_id,buyer_email,status,currency,amount_total,amount_tax,livemode) VALUES(?,?,?,?,?,?,?,?,?,0) ON CONFLICT(checkout_session_id) DO UPDATE SET status=excluded.status, stripe_payment_intent_id=COALESCE(excluded.stripe_payment_intent_id,founder_orders.stripe_payment_intent_id),updated_at=CURRENT_TIMESTAMP")
    .bind(session.id,session.payment_intent||null,session.payment_link,session.customer||null,session.customer_details?.email||session.customer_email||null,status,session.currency||"eur",session.amount_total||0,session.total_details?.amount_tax||0).run();
  await env.RMP_LEADS.prepare("INSERT OR IGNORE INTO stripe_webhook_events(id,event_type) VALUES(?,?)").bind(event.id,event.type).run();
  return reply(200,{received:true});
 }catch(error){
  if(error instanceof SyntaxError)return reply(400,{error:"Invalid JSON"});
  console.error("Stripe webhook processing failed",error instanceof Error?error.message:"unknown");
  return reply(500,{error:"Processing failed"});
 }
}
export async function onRequestGet():Promise<Response>{return reply(405,{error:"Method not allowed"});}
