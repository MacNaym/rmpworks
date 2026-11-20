// Phase 1: deterministic, dependency-free creator commerce rules.
// No DB calls, payments, secrets or side effects. Node >=20.
export const RESERVED_SLUGS = new Set([
  'www','api','app','admin','auth','login','signup','account','billing',
  'support','help','mail','email','static','assets','cdn','staging',
  'preview','creator-studio','design-lab','dashboard','shop','checkout',
  'stripe','webhooks','rmpworks','localhost'
]);
export const PRODUCT_STAGES = Object.freeze(['lead_magnet','micro','intermediate','premium']);
export const PRODUCT_STATUS = Object.freeze(['draft','review','published','archived']);

export function normalizeCreatorSlug(value) {
  if (typeof value !== 'string') return null;
  const slug = value.trim().toLowerCase();
  if (!/^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/.test(slug)) return null;
  if (RESERVED_SLUGS.has(slug) || slug.includes('--')) return null;
  return slug;
}

// Host is for tenant LOOKUP only. Never use it as proof of authorization.
export function resolveCreatorHost(hostHeader, rootDomain='rmpworks.com') {
  if (typeof hostHeader !== 'string' || hostHeader.length > 253) return null;
  const host = hostHeader.trim().toLowerCase().replace(/\.$/,'').replace(/:\d+$/,'');
  const root = rootDomain.toLowerCase();
  if (host === root || host === 'www.' + root) return {kind:'marketing'};
  if (!host.endsWith('.' + root)) return null;
  const prefix = host.slice(0, -root.length-1);
  const slug = normalizeCreatorSlug(prefix);
  return slug ? {kind:'creator',slug} : null;
}

export function validateProduct(input) {
  if (!input || typeof input !== 'object') throw new Error('Invalid product');
  if (!PRODUCT_STAGES.includes(input.stage)) throw new Error('Invalid product stage');
  if (!PRODUCT_STATUS.includes(input.status)) throw new Error('Invalid product status');
  if (typeof input.title !== 'string' || !input.title.trim() || input.title.length > 120) throw new Error('Invalid product title');
  if (!Number.isSafeInteger(input.priceCents) || input.priceCents < 0) throw new Error('Invalid price');
  if (input.stage === 'lead_magnet' && input.priceCents !== 0) throw new Error('Lead magnet must be free');
  if (input.stage !== 'lead_magnet' && input.priceCents === 0) throw new Error('Paid product must have a price');
  if (input.currency !== 'eur') throw new Error('Only EUR is supported in MVP');
  return Object.freeze({stage:input.stage,status:input.status,title:input.title.trim(),priceCents:input.priceCents,currency:'eur'});
}

export function splitCreatorRevenue(netCents, creatorShareBps=8000) {
  // netCents must be computed upstream from legally agreed tax/fee/refund rules.
  if (!Number.isSafeInteger(netCents) || netCents < 0) throw new Error('Invalid net amount');
  if (![7000,8000].includes(creatorShareBps)) throw new Error('Unsupported split');
  const creatorCents = Math.floor(netCents * creatorShareBps / 10000);
  return {creatorCents,rmpCents:netCents - creatorCents};
}

export function validateLeadInput(input) {
  if (!input || typeof input !== 'object') throw new Error('Invalid lead');
  const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
  if (typeof input.source !== 'string' || !['quiz','gift','manual','landing'].includes(input.source)) throw new Error('Invalid source');
  if (typeof input.marketingConsent !== 'boolean') throw new Error('Explicit consent flag required');
  return {email,source:input.source,marketingConsent:input.marketingConsent};
}

export function canPublishProduct(product, context) {
  const p=validateProduct(product);
  // Safety by default: no payment processing or delivery without verified gateway.
  if (!context || context.tenantActive !== true || context.ownerApproved !== true) return false;
  if (p.status !== 'review') return false;
  if (p.stage === 'lead_magnet') return context.leadFlowVerified === true;
  return context.checkoutVerified === true && context.digitalDeliveryVerified === true &&
    context.refundPolicyReady === true && context.legalTermsReady === true;
}
