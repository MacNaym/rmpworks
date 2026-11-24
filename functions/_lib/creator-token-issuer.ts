/**
 * B8 server-only, DORMANT token issuer. The caller must have independently
 * authorized release/tenant/recipient and persisted an inbox row.
 * Stores only a SHA-256 digest. Does NOT send email and does not call a route.
 */
export type IssueTokenSettings={
  supabaseUrl?:string;
  serverSecret?:string;
  intakeAuthorized:boolean;
};
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const digest=/^[0-9a-f]{64}$/;
export async function persistEmailChallenge(
  settings:IssueTokenSettings,
  leadId:unknown,
  tokenDigest:unknown,
  fetcher:typeof fetch=fetch
):Promise<"stored"|"closed"|"unavailable">{
  if(settings.intakeAuthorized!==true) return "closed";
  if(typeof leadId!=="string"||!uuid.test(leadId)||
     typeof tokenDigest!=="string"||!digest.test(tokenDigest)) return "closed";
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(settings.supabaseUrl||"")||
     !settings.serverSecret||settings.serverSecret.length<32) return "unavailable";
  try{
    const response=await fetcher(settings.supabaseUrl!.replace(/\/$/,"")+
      "/rest/v1/rpc/creator_issue_email_token",{
      method:"POST",
      headers:{
        apikey:settings.serverSecret,
        authorization:"Bearer "+settings.serverSecret,
        "content-type":"application/json",
        "cache-control":"no-store",
      },
      body:JSON.stringify({p_lead_id:leadId,p_digest:tokenDigest}),
      signal:AbortSignal.timeout(5000),
    });
    if(!response.ok) return "unavailable";
    const value=await response.json() as unknown;
    return value===true?"stored":value===false?"closed":"unavailable";
  }catch{
    return "unavailable";
  }
}
