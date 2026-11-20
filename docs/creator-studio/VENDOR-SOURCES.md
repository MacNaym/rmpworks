# Third-party design sources

## Studio-Groei / anti-slop
- Source: https://github.com/Studio-Groei/anti-slop
- License: MIT, copied to .agents/skills/anti-slop/LICENSE
- Installed skill, references and scanner in .agents/skills/anti-slop/
- Dev-only tweaks bar copied to public/tweaks-bar.js
- Original SKILL.md is in Dutch; do not assume supplementary design taste tools are installed.

## ColorlibHQ / velora-ui
- Source: https://github.com/ColorlibHQ/velora-ui
- License: MIT, copied to components/velora/LICENSE
- Vendored component: components/velora/marquee.tsx
- Minimal local cn helper: lib/utils.ts
- CSS animation defined in app/globals.css with prefers-reduced-motion handling from upstream component.
- Do not install paid Velora Pro templates.
- Future component additions should be reviewed before importing, with their dependencies and license.
