/**
 * Turnstile verification for a future public creator-lead endpoint.
 * NOT wired to any route: release gate #28 remains closed.
 */
type TurnstileResult = {
  success?: boolean;
  hostname?: string;
  action?: string;
  "error-codes"?: string[];
};
export type TurnstileVerification = {
  ok: boolean;
  reason: "ok" | "invalid_input" | "not_configured" | "challenge_failed" | "invalid_context" | "verification_unavailable";
};
export type TurnstileOptions = {
  token: unknown;
  secret: string | undefined;
  expectedHostname: string;
  expectedAction: string;
  remoteIp?: string;
  fetcher?: typeof fetch;
};
/**
 * Fail closed for missing config, invalid tokens and any failed network/API reply.
 * Call only from trusted server functions; never expose the secret to browsers.
 */
export async function verifyCreatorTurnstile(options: TurnstileOptions): Promise<TurnstileVerification> {
  const {token, secret, expectedHostname, expectedAction, remoteIp} = options;
  if (!secret || secret.trim().length < 10) return {ok:false, reason:"not_configured"};
  if (typeof token !== "string" || token.length < 1 || token.length > 2048) {
    return {ok:false, reason:"invalid_input"};
  }
  if (!/^[a-z0-9.-]+$/.test(expectedHostname) || !/^[a-z0-9_-]{1,32}$/.test(expectedAction)) {
    return {ok:false, reason:"invalid_context"};
  }
  const body = new URLSearchParams({secret, response:token});
  if (remoteIp && /^(?:[a-fA-F0-9:.]+)$/.test(remoteIp)) body.set("remoteip", remoteIp);
  try {
    const result = await (options.fetcher ?? fetch)("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method:"POST",
      headers:{"content-type":"application/x-www-form-urlencoded"},
      body,
      signal:AbortSignal.timeout(5000),
    });
    if (!result.ok) return {ok:false, reason:"verification_unavailable"};
    const data = await result.json() as TurnstileResult;
    if (data.success !== true) return {ok:false, reason:"challenge_failed"};
    if (data.hostname !== expectedHostname || data.action !== expectedAction) {
      return {ok:false, reason:"invalid_context"};
    }
    return {ok:true, reason:"ok"};
  } catch {
    return {ok:false, reason:"verification_unavailable"};
  }
}
