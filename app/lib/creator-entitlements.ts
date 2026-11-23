/**
 * B9A — entitlement model only. No billing, DB writes or public release.
 * Plans are ordered by inclusion, standalone grants only its own feature.
 * Quotas are explicitly NOT defined here: backend metering is pending.
 */
export const PLANS = ["free", "pro", "pro_plus"] as const;
export type Plan = (typeof PLANS)[number];
export const FEATURES = [
  "creator_desk", "lead_magnets", "micro_crm", "creator_storefront",
  "digital_products", "video_optimizer", "channel_audit",
  "competitor_insights", "keyword_research", "content_opportunities",
] as const;
export type Feature = (typeof FEATURES)[number];
type Subscription = { feature: Feature; status: "active" | "trialing" | "past_due" | "canceled" };
export type AccessInput = {
  plan: Plan;
  subscriptions?: Subscription[];
  // Platform release gates must be checked separately by every public endpoint.
  enabledFeatures?: readonly Feature[];
};
const base: Record<Plan, readonly Feature[]> = {
  free: ["creator_desk"],
  pro: [
    "creator_desk", "lead_magnets", "micro_crm", "creator_storefront",
    "digital_products", "video_optimizer",
  ],
  pro_plus: FEATURES,
};
/** Pure access resolution. Does not override public-release or privacy gates. */
export function resolveFeatures(input: AccessInput): ReadonlySet<Feature> {
  const allowed = new Set<Feature>(base[input.plan] ?? base.free);
  for (const sub of input.subscriptions ?? []) {
    if (sub.status === "active" || sub.status === "trialing") {
      if ((FEATURES as readonly string[]).includes(sub.feature)) allowed.add(sub.feature);
    }
  }
  // All non-core features require explicit product readiness/release enablement.
  const enabled = new Set(input.enabledFeatures ?? []);
  return new Set([...allowed].filter(feature => feature === "creator_desk" || enabled.has(feature)));
}
export function canUseFeature(input: AccessInput, feature: Feature): boolean {
  return resolveFeatures(input).has(feature);
}
