# RMP Creator Studio — Design Context

## Project
RMP Works helps emerging specialist content creators create, launch and sell digital products under their own name. The brand communicates useful craft and commercial clarity, not quick-money promises.

## Target
Independent YouTubers, educators, professional creators with focused communities and limited budgets. They value directness, professional execution, and honest promises.

## Design direction
User selected **Neo Brutalism (style 02)** on 20 November 2026. Three refinements are now compared at /design-lab: Stencil Punch (A), Underground Creator (B), Studio Press (C). Do not select a sub-variant on the user's behalf.

## Brand guardrails
- No generic AI SaaS cards, blurred purple gradients, generic "unlock potential" copy, fictitious testimonials, fake sales dashboards, or pretend integrations.
- Clear distinct typography and strong layout character; accessible contrast, mobile readability, semantic HTML, keyboard interactions, reduced-motion support.
- Headline copy in practical, direct Italian; avoid exaggerated income claims.
- Preserve RMP Works product identity and keep other studio projects out of creator-facing primary navigation.
- Dedicated creator tenant: `{creatorSlug}.rmpworks.com`, e.g. `vecchisalvataggi.rmpworks.com`. Never derive tenants from niches.
- Existing Next.js static export is marketing only; dynamic tenancy requires runtime infrastructure.

## Installed design resources
- Anti-slop (Studio-Groei, MIT): `.agents/skills/anti-slop/SKILL.md`, references, scanner and dev Tweaks Bar.
- Velora UI (ColorlibHQ, MIT): `components/velora/marquee.tsx`, copyright/license in `components/velora/LICENSE`.
- Local design lab: `/design-lab`; production robot meta noindex; visual Tweaks Bar dev only.
- The anti-slop skill references optional tooling (Higgsfield, Taste v2, 21st.dev), **not installed**. Do not claim those are active.
- Run `npm run design:scan` before approving copy.

## Workflow
Clarify brief through ARIG (aesthetic/reference/intent/guardrails), compare different directions, after style selection compare 3 sub-variants, verify visually at desktop/mobile, then merge only on approval and after a successful build.
