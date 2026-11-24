/**
 * Future public lead intake orchestrator. NOT connected to Pages routes.
 * Its dependencies intentionally must be supplied by the trusted server.
 * In particular, no browser-controlled flag may authorize public release.
 */
export type PublicLeadInput = {
  email: string;
  fullName: string;
  consentToDelivery: boolean;
  marketingOptIn: boolean;
  honeypot: string;
  turnstileToken: string;
};
export type PublicLeadContext = {
  // These values must be determined by server-owned configuration and DB only.
  releaseEnabled: boolean;
  creatorPublished: boolean;
  creatorApproved: boolean;
  privacyReady: boolean;
  tenantId: string;
};
export type PublicLeadChecks = {
  rateLimit: () => Promise<boolean>;
  verifyTurnstile: (token: string) => Promise<boolean>;
  deliver: (lead: {
    tenantId: string;
    email: string;
    fullName: string;
    marketingOptIn: boolean;
  }) => Promise<boolean>;
};
export type PublicLeadOutcome = {ok: boolean; status: 202 | 404 | 429 | 503};
const validEmail = (s: string) => s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const validTenant = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
/**
 * No direct SQL, no secret and no actual delivery implementation.
 * A real route will also require size limits, verified host/Origin,
 * approved lead magnet, tenant-scoped write authorization, anti-replay,
 * audit/retention and privacy notice version.
 */
export async function evaluatePublicLead(
  context: PublicLeadContext,
  input: PublicLeadInput,
  checks: PublicLeadChecks
): Promise<PublicLeadOutcome> {
  if (!context.releaseEnabled || !context.creatorPublished ||
      !context.creatorApproved || !context.privacyReady ||
      !validTenant(context.tenantId)) return {ok:false,status:404};

  // Deliberately generic negative response for malformed/spam payloads.
  if (typeof input.email !== "string" || !validEmail(input.email.trim()) ||
      typeof input.fullName !== "string" || input.fullName.length > 120 ||
      input.consentToDelivery !== true || typeof input.marketingOptIn !== "boolean" ||
      typeof input.honeypot !== "string" || input.honeypot.length !== 0 ||
      typeof input.turnstileToken !== "string" || input.turnstileToken.length < 1 ||
      input.turnstileToken.length > 2048) return {ok:false,status:404};

  try {
    // Rate limiting before network verification or delivery.
    if (!await checks.rateLimit()) return {ok:false,status:429};
    if (!await checks.verifyTurnstile(input.turnstileToken)) return {ok:false,status:404};
    const success = await checks.deliver({
      tenantId:context.tenantId,
      email:input.email.trim().toLowerCase(),
      fullName:input.fullName.trim(),
      marketingOptIn:input.marketingOptIn,
    });
    if (!success) return {ok:false,status:503};
    return {ok:true,status:202};
  } catch {
    // Never proceed when a dependency is unavailable.
    return {ok:false,status:503};
  }
}
