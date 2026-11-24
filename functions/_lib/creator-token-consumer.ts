/**
 * B7 staging-only adapter contract for restricted Supabase RPC.
 * Never imported by any public Cloudflare route.
 * Needs an approved backend-only credential and a tested SQL migration first.
 */
import type {ConsumeVerification} from "./creator-email-verification";

type RpcEnv = {
  supabaseUrl: string | undefined;
  secretKey: string | undefined;
  stagingApproved: boolean;
};
const digestPattern = /^[a-f0-9]{64}$/;
export function createRestrictedTokenConsumer(
  env: RpcEnv,
  fetcher: typeof fetch = fetch
): ConsumeVerification {
  return async ({tokenDigest}) => {
    if (!env.stagingApproved || !digestPattern.test(tokenDigest) ||
        !/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(env.supabaseUrl || "") ||
        !env.secretKey || env.secretKey.length < 32) {
      return "invalid";
    }
    try {
      // All authorization, current publication, expiry and replay rules
      // are inside the one-shot atomic SQL function on the database.
      const response = await fetcher(
        env.supabaseUrl!.replace(/\/$/, "") + "/rest/v1/rpc/creator_consume_email_token",
        {
          method:"POST",
          headers:{
            apikey:env.secretKey!,
            authorization:"Bearer " + env.secretKey!,
            "content-type":"application/json",
            "cache-control":"no-store",
          },
          body:JSON.stringify({p_digest:tokenDigest}),
          signal:AbortSignal.timeout(5000),
        }
      );
      if (!response.ok) throw new Error("Token consumer unavailable");
      const data = await response.json() as unknown;
      if (data === true) return "consumed";
      if (data === false) return "invalid";
      throw new Error("Unexpected RPC result");
    } catch {
      // Never log digest, key, recipient or provider response.
      throw new Error("Token consumer unavailable");
    }
  };
}
