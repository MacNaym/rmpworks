/**
 * B9.7 — ISOLATED MANUAL diagnostic worker, NOT part of the RMP Pages routes.
 * Never deploy this as a public creator endpoint. Off by default.
 * Intentionally excludes SMTP authentication, credentials and mail sending.
 *
 * To test it, an operator must separately authorize deployment of this
 * isolated Worker and configure secrets through Cloudflare.
 */
import {connect} from "cloudflare:sockets";
import {probeHostingerSmtp} from "../../functions/_lib/creator-smtp-connection-probe.ts";

type Env={
  RMP_SMTP_PROBE_ENABLED?:string;
  RMP_SMTP_PROBE_KEY?:string;
};
const textEncoder=new TextEncoder();
const strictHex=/^[a-f0-9]{64}$/;

async function equalKey(expected:string,got:string):Promise<boolean>{
  // Authenticated diagnostic should not reveal key through response timing.
  // Compare constant-length SHA-256 digests with fixed-length XOR loop.
  const [a,b]=await Promise.all([
    crypto.subtle.digest("SHA-256",textEncoder.encode(expected)),
    crypto.subtle.digest("SHA-256",textEncoder.encode(got))
  ]);
  const left=new Uint8Array(a),right=new Uint8Array(b);
  let diff=0;
  for(let n=0;n<left.length;n++)diff|=left[n]^right[n];
  return diff===0;
}
const response=(value:unknown,status=200):Response=>
  new Response(JSON.stringify(value),{
    status,
    headers:{
      "content-type":"application/json; charset=utf-8",
      "cache-control":"no-store",
      "x-content-type-options":"nosniff",
      "referrer-policy":"no-referrer",
    },
  });

/**
 * Strict authorization; no traces, SMTP text, secrets or recipient addresses
 * in output. This handler must remain on an isolated manual diagnostic Worker.
 */
export async function handleProbeRequest(
  request:Request,
  env:Env,
  connector:typeof connect=connect
):Promise<Response>{
  if(env?.RMP_SMTP_PROBE_ENABLED!=="true")
    return response({status:"disabled"},404);
  if(request.method!=="POST")
    return response({status:"not_found"},404);
  const secret=env.RMP_SMTP_PROBE_KEY;
  if(typeof secret!=="string"||!strictHex.test(secret))
    return response({status:"unavailable"},503);
  const supplied=request.headers.get("x-rmp-probe-key")||"";
  if(!strictHex.test(supplied)||!await equalKey(secret,supplied))
    return response({status:"not_found"},404);
  // No request body is ever read or allowed to supply options or targets.
  const result=await probeHostingerSmtp({
    enabled:true,connect:connector,timeoutMs:4000
  });
  return response(result,result.status==="connected"?200:503);
}

export default {
  fetch(request:Request,env:Env){
    return handleProbeRequest(request,env);
  }
};
