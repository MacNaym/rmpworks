/**
 * B6 server-only public lead staging writer. DORMANT: not imported by a route.
 * Caller must have verified platform release, tenant ownership, Turnstile,
 * rate limit, privacy notice and resource approval before invoking this.
 *
 * Never expose the Supabase backend secret as NEXT_PUBLIC_* or in browser code.
 * The SQL insert trigger independently validates published creator + approved magnet.
 */
export type PendingLead = {
  tenantId: string;
  magnetId: string;
  email: string;
  fullName: string;
  marketingOptIn: boolean;
  privacyVersion: string;
  deliveryConsentText: string;
};
export type InboxEnvironment = {
  supabaseUrl: string | undefined;
  serverSecret: string | undefined;
  // Must come from trusted server state, never user-submitted JSON.
  releaseAuthorized: boolean;
};
export type InboxOutcome = "accepted" | "duplicate" | "closed" | "unavailable";
const uuid = (x: string) => /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(x);
const emailOk = (s: string) => s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
export async function stagePublicCreatorLead(
  env: InboxEnvironment,
  lead: PendingLead,
  fetcher: typeof fetch = fetch
): Promise<InboxOutcome> {
  if (!env.releaseAuthorized) return "closed";
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(env.supabaseUrl || "") ||
      !env.serverSecret || env.serverSecret.length < 32) return "unavailable";
  if (!uuid(lead.tenantId) || !uuid(lead.magnetId) ||
      typeof lead.email !== "string" || !emailOk(lead.email.trim()) ||
      typeof lead.fullName !== "string" || lead.fullName.length > 120 ||
      typeof lead.marketingOptIn !== "boolean" ||
      typeof lead.privacyVersion !== "string" || lead.privacyVersion.length < 1 || lead.privacyVersion.length > 64 ||
      typeof lead.deliveryConsentText !== "string" || lead.deliveryConsentText.length < 10 ||
      lead.deliveryConsentText.length > 500) return "closed";
  const payload = {
    creator_account_id: lead.tenantId,
    magnet_id: lead.magnetId,
    email: lead.email.trim().toLowerCase(),
    full_name: lead.fullName.trim(),
    marketing_opt_in: lead.marketingOptIn,
    privacy_version: lead.privacyVersion,
    delivery_consent_text: lead.deliveryConsentText,
    status: "pending_verification",
  };
  try {
    const response = await fetcher(env.supabaseUrl!.replace(/\/$/, "") + "/rest/v1/creator_public_lead_inbox", {
      method: "POST",
      headers: {
        apikey: env.serverSecret!,
        authorization: "Bearer " + env.serverSecret!,
        "content-type": "application/json",
        prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 409) {
      // PostgREST uses 409 for BOTH 23505 unique and 23503 foreign-key
      // violations. Only the explicitly named deduplication constraint counts
      // as an existing lead; mismatched tenants/magnets remain unavailable.
      const error = await response.json().catch(() => null) as
        {code?: unknown; message?: unknown} | null;
      return error?.code === "23505" &&
        typeof error.message === "string" &&
        error.message.includes('creator_public_lead_inbox_unique_lead')
          ? "duplicate" : "unavailable";
    }
    return response.status === 201 || response.status === 204 ? "accepted" : "unavailable";
  } catch {
    return "unavailable";
  }
}
