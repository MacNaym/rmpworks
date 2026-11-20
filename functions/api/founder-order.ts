// Read-only sandbox order status: the opaque Stripe session ID is the lookup token.
// Never expose buyer email, Stripe customer IDs, or payment intent IDs.
type Env={RMP_LEADS:{prepare(sql:string):{bind(...args:unknown[]):{first<T>():Promise<T|null>}}}};
type Context={request:Request;env:Env};
const headers={"content-type":"application/json; charset=utf-8","cache-control":"no-store, private","x-content-type-options":"nosniff","referrer-policy":"no-referrer"};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
type Order={status:string;currency:string;amount_total:number;amount_tax:number;livemode:number;stripe_payment_link_id:string};
const testLink="plink_1Udo6CCI5i4j9XdrhFC0m0Cy";
export async function onRequestGet({request,env}:Context):Promise<Response>{
 try{
  const url=new URL(request.url);
  const session=url.searchParams.get("session_id")||"";
  if(!/^cs_test_[A-Za-z0-9]{15,180}$/.test(session))return json({status:"invalid"},400);
  if(!env.RMP_LEADS)return json({status:"unavailable"},503);
  const order=await env.RMP_LEADS.prepare("SELECT status,currency,amount_total,amount_tax,livemode,stripe_payment_link_id FROM founder_orders WHERE checkout_session_id=? LIMIT 1").bind(session).first<Order>();
  if(!order)return json({status:"processing"});
  if(order.livemode!==0||order.stripe_payment_link_id!==testLink)return json({status:"unavailable"},404);
  const valid=["paid","pending","failed","expired"].includes(order.status)?order.status:"processing";
  return json({status:valid,currency:order.currency,amount_total:order.amount_total,amount_tax:order.amount_tax});
 }catch(e){
  console.error("order status read failed",e instanceof Error?e.message:"unknown");
  return json({status:"unavailable"},503);
 }
}
export async function onRequestPost(){return json({error:"Method not allowed"},405);}
