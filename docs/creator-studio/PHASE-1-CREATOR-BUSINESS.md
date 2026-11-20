# RMP Creator Business — Fase 1 (MVP)

**Status:** implementation branch, NOT deployed. Marketing site remains unchanged.

## Product and scope
We sell the creator a new, accessible digital revenue stream, **not** AI software. Phase 2 (AI toolbox/credits) is explicitly out of scope.

Each approved creator gets:
1. `{slug}.rmpworks.com` creator page (brand, bio, links, products).
2. Free lead magnet (quiz/checklist/guide) with delivery and optional separate marketing opt-in.
3. Tiny CRM: leads, origin, consent history, simple contact stage, purchases, export/delete.
4. First paid micro product: narrow template/kit or guide, price normally €5–15.
5. Intermediate product €29–79 developed *after* real demand signals.
6. Premium product (course/complete guide) co-created with creator; commercial split provisionally **80/20** (creator/platform), or **70/30** for substantial RMP production.

## Charging RMP Works' creator clients
Activation: one-time fee **or** annual fee — no automated recurring charge without explicit customer agreement. The marketing branch mentions a **€50 + VAT Founder pre-sale**, which needs scope, delivery timetable and legal validation before checkout. Optional future yearly hosting/support cost must be disclosed separately and no double billing.

## Architecture (do not merge static marketing with dynamic tenant backend)
- Existing `rmpworks.com` is Next.js with `output: "export"`; keep its Cloudflare Pages deployment intact.
- Creator runtime is a separate application/API deployment with wildcard hostname routing, server-side sessions and authorized tenant membership.
- Supabase: dedicated RMP creator platform project/schema, not shared with Regolario, ShopShield, Mneme or Memoria dei Sette. Resolve exact project before any write; never assume one exists.
- Stripe: use **RMPWorks sandbox** to validate the creator onboarding fee and end-customer digital product purchases; evaluate Stripe Connect (likely direct charges or destination charges depending merchant of record and funds liability). Only verified webhooks mark paid; no success-page fulfillment.
- Do NOT create live Checkout, DNS wildcard, Connect accounts, charge money, process personal data or deploy until security, privacy and billing gates pass.

## Minimal data entities
- `creators`: id, slug unique, display_name, logo, public_state, owner_user_id, created_at.
- `creator_members`: creator_id, user_id, role (owner/editor), unique pair.
- `products`: id, creator_id, stage (lead_magnet/micro/intermediate/premium), status, title, price_cents, currency, artifact_id, public_slug, created_at.
- `leads`: id, creator_id, email, lead_source, marketing_consent, consent_at, legal_notice_version, created_at; never assume gifting consent implies marketing consent.
- `lead_events`: immutable consent/change provenance, creator_id, lead_id, event_type, created_at.
- `orders`: id, creator_id, product_id, external_checkout_id unique, status, gross_cents, currency, created_at.
- `deliveries`: id, order_id, asset_id, status, delivered_at, expiry_at.
- `revenue_splits`: order_id, creator_share_bps, agreed_net_cents, platform_share_cents, creator_share_cents, accounting_status.
- `creator_settings`: creator_id, agreement_version, checkout readiness, legal settings.

All user data keyed by `creator_id`; server-side authorization/RLS for owner/editor ONLY. Public page queries must expose only published products and approved brand data; **not** CRM or user emails. Never derive authentication from hostname alone. Private downloads via expiring signed URLs. Idempotent webhook processing and unique external event IDs.

## State gates
Creator: `draft -> approved -> active -> suspended`.
Product: `draft -> review -> published -> archived`.
Lead magnet publication requires delivery and consent-flow test. Paid publication requires validated checkout, webhook, delivery, legal terms, refund workflow and owner approval. Split calculations are bookkeeping projections until Connect, liabilities and taxation are verified.

## MVP acceptance tests
1. Distinct creator hostnames resolve to different creator pages. Reserved hostnames denied.
2. Creator A cannot read/write contact, order or product of Creator B via UI/API/SQL (RLS and service tests).
3. Visitor can acquire free product without marketing opt-in; history records consent choice.
4. Owner can view/export/delete lead as legally appropriate; no exposed phone/email of RMP founders.
5. Paid product test Checkout succeeds in sandbox, webhook verified and deduplicated, download issued once; failed/refunded orders do not grant access.
6. Creator can see orders and revenue estimate, not other creators' data; split is reproducible and refund-aware.
7. 2 creators onboarded in staging, responsive mobile QA, safe rollback; no real buyers until gates passed.

## Planned delivery batches
**B1** Define commercial terms and tenant-safe data contracts (this branch).  
**B2** Dedicated Supabase schema, RLS, auth + negative cross-tenant tests.  
**B3** Runtime creator page, lead magnet, CRM basic.  
**B4** Stripe sandbox Checkout/Connect decision, webhook, fulfillment, split ledger.  
**B5** Staging domain, mobile QA, privacy/terms, creator onboarding, controlled launch.

## Local deterministic tests
`node --test packages/creator-business/core.test.mjs`

No install, API key, database or charge required. Core helper is not a production application.
