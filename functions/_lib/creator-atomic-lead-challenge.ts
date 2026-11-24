/**
 * B8 dormant server-only atomic lead + challenge writer.
 * Only use after trusted release, creator, privacy, anti-spam, rate limiting
 * and Turnstile checks. Never import in a client bundle or public endpoint
 * before the release gate and database migration have been approved.
 */
export type AtomicLeadInput = {
  creatorId: string;
  magnetId: string;
  email: string;
  fullName: string;
  marketingOptIn: boolean;
  privacyVersion: string;
  deliveryConsentText: string;
  tokenDigest: string;
};
export type AtomicLeadEnvironment = {
  supabaseUrl?: string;
  backendSecret?: string;
  authorizedByServer: boolean;
};
export type AtomicLeadOutcome = "stored" | "closed" | "unavailable";
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const emailOk=(s:string)=>s.length<=254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const digest=/^[0-9a-f]{64}$/;

export async function stageAtomicLeadAndChallenge(
 env:AtomicLeadEnvironment,
 input:AtomicLeadInput,
 fetcher:typeof fetch=fetch
):Promise<AtomicLeadOutcome>{
 if(env.authorizedByServer!==true)return "closed";
 if(!input || typeof input!=="object" ||
    typeof input.creatorId!=="string" || !uuid.test(input.creatorId) ||
    typeof input.magnetId!=="string" || !uuid.test(input.magnetId) ||
    typeof input.email!=="string" || !emailOk(input.email.trim()) ||
    typeof input.fullName!=="string" || input.fullName.length>120 ||
    typeof input.marketingOptIn!=="boolean" ||
    typeof input.privacyVersion!=="string" || input.privacyVersion.length<1 ||
    input.privacyVersion.length>64 ||
    typeof input.deliveryConsentText!=="string" || input.deliveryConsentText.length<10 ||
    input.deliveryConsentText.length>500 ||
    typeof input.tokenDigest!=="string" || !digest.test(input.tokenDigest))return "closed";
 if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(env.supabaseUrl||"") ||
    !env.backendSecret || env.backendSecret.length<32)return "unavailable";
 const payload={
   p_creator_id:input.creatorId,
   p_magnet_id:input.magnetId,
   p_email:input.email.trim().toLowerCase(),
   p_full_name:input.fullName.trim(),
   p_marketing_opt_in:input.marketingOptIn,
   p_privacy_version:input.privacyVersion,
   p_delivery_consent_text:input.deliveryConsentText,
   p_digest:input.tokenDigest,
 };
 try{
  const response=await fetcher(
   env.supabaseUrl!.replace(/\/$/,"")+"/rest/v1/rpc/creator_create_pending_lead_with_token",
   {
    method:"POST",
    headers:{
     apikey:env.backendSecret!,
     authorization:"Bearer "+env.backendSecret!,
     "content-type":"application/json",
     "cache-control":"no-store",
    },
    body:JSON.stringify(payload),
    signal:AbortSignal.timeout(5000),
   }
  );
  if(!response.ok)return "unavailable";
  const result=await response.json() as unknown;
  return result===true?"stored":result===false?"closed":"unavailable";
 }catch{
  return "unavailable";
 }
}
