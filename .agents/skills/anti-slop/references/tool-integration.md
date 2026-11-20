# Gereedschap-integratie — eerlijke wiring

Status geverifieerd op 2026-07-24. Werk dit bij als er iets wijzigt.

---

## 1. Impeccable (impeccable.style)

**Realiteit**: er is een `teach-impeccable`-skill (`~/.agents/skills/teach-impeccable/`), maar dat
is een **Design-Context-verzamelaar** die een `## Design Context`-blok naar de project-CLAUDE.md
schrijft. Er is **geen** geïnstalleerde `impeccable`-CLI met `bolder`/`overdrive`/`clarify`.
`impeccable.style` zelf is de referentie-site (staat ook in de studio-groei-CLAUDE.md als
inspiratie/anti-referentie voor rijke scroll-motion).

**Hoe we het gebruiken**:
- Brief/context vastleggen → draai `teach-impeccable` (één keer per project).
- `bolder`/`overdrive`/`clarify` → **prompt-passes** gedefinieerd in `../SKILL.md` (§Passes).
  De gebruiker roept ze bij naam aan ("draai clarify over de copy"); jij past de transformatie toe.
- Wil je een échte externe Impeccable-CLI? Vraag de repo/URL; tot die er is: bovenstaande.

## 2. Taste Skill v2 (GitHub) — de bron van onderscheid

**Waarom dit juist WEL nodig is** (correctie): `frontend-design` is de skill die *élke*
Claude-designer draait. Precies daarom is het een **convergentie-/slop-bron** — het valt terug op
dezelfde defaults (bv. Space Grotesk) waar iedereen op uitkomt. Taste v2 is er expliciet om
*weg* van die gemene deler te komen. Dus: **niet redundant, maar het onderscheidende kader.**

**Repo**: `github.com/Leonxlnx/taste-skill` (MIT); de v2-default is submap `skills/taste-skill`
(frontmatter `name: design-taste-frontend`). Geïnstalleerd + gesymlinkt op 2026-07-24.

**Het echte verschil met `frontend-design`** — 3 numerieke dials, ingelezen uit de brief (baseline
**8 / 6 / 4**): **DESIGN_VARIANCE** (layout-asymmetrie, def 8), **MOTION_INTENSITY** (def 6, met
canonieke GSAP-skeletten i.p.v. losse scroll-listeners), **VISUAL_DENSITY** (def 4). Plus een
**harde ban-list (~16 patronen)** + een pass/fail **"no box, no ship"-preflight**, design-system-
routing (Material/Fluent/Carbon) en zuster-skills (`minimalist`, `brutalist`, `redesign`,
`imagegen`, `brandkit`) — elk als submap onder `skills/`.

**Rolverdeling**:
- `frontend-design` = **vloer** → alleen de *verboden* (geen Inter/Roboto, geen paars-op-wit).
- `design-taste-frontend` + inspiratie-bibliotheek + `aesthetic-styles.md` = **de esthetiek-bron**.

**Install** (gedaan):
```bash
git clone --depth 1 https://github.com/Leonxlnx/taste-skill.git ~/.agents/skills/taste-skill
ln -s ../../.agents/skills/taste-skill/skills/taste-skill ~/.claude/skills/design-taste-frontend
# zusters optioneel: ln -s ../../.agents/skills/taste-skill/skills/brutalist-skill ~/.claude/skills/brutalist-ui
```

## 3. Higgsfield MCP (higgsfield.ai) — asset-generatie

**Realiteit**: standaard **niet aangesloten** in je MCP-config.

**Wiring — OFFICIËLE remote MCP met OAuth (GÉÉN API-key)**. Dit is de variant met GPT-Image 2
(2K/4K hero) + Seedance 2.0 (video ≤15s), credits uit je bestaande Higgsfield-plan:
```bash
claude mcp add --transport http higgsfield https://mcp.higgsfield.ai/mcp
# daarna in Claude Code: /mcp  → browser-OAuth voltooien
```
Of als JSON-blok (`~/.claude.json` of project-`.mcp.json`; OAuth interactief, dus géén key in file):
```json
{ "mcpServers": { "higgsfield": { "type": "http", "url": "https://mcp.higgsfield.ai/mcp" } } }
```
Tools verschijnen na OAuth via ToolSearch (o.a. `generate_image`, `generate_video`). Er bestaat óók
een 3rd-party `npx higgsfield-mcp` (API-key, max 1080p, geen GPT-pad, repo privé) — **niet gebruiken.**

**Fallback zolang Higgsfield ontbreekt** (nooit doen alsof een asset "echt gerenderd" is):
- **Canva-MCP** is verbonden → bruikbaar voor eenvoudige beelden/lay-outs.
- **Placeholder-pipeline**: gelabelde placeholders (juiste ratio/afmeting) + een expliciete
  "ASSET TODO"-lijst met de prompts die later naar Higgsfield gaan (2K hero via GPT-pad,
  video via Seed-Dance-pad). Zo blijft de layout kloppen en is niets nep.

## 4. 21st.dev — component-inspiratie

**Er is wél een MCP**: "Magic" (`@21st-dev/magic`). Tools: `CreateUiTool`, `RefineUiTool`,
`FetchUiTool` (haal component uit het 21st-register), `LogoSearchTool`.
```json
{ "mcpServers": { "@21st-dev/magic": {
    "command": "npx", "args": ["-y", "@21st-dev/magic@latest"],
    "env": { "API_KEY": "<uit 21st.dev/magic/console>" } } } }
```
(Rejecteert de server de key? Probeer env-naam `TWENTY_FIRST_API_KEY` als fallback.)

**Key-loze fallback (WebFetch, geen MCP nodig)** — trek een bestaand component als bron:
- Component-detail/JSON: `https://21st.dev/r/{author}/{component}` (+ `.json` = register-JSON).
- Categorie bladeren: `https://21st.dev/s/{categorie}` (bv. `/s/hero`, `/s/button`).
- Direct installeren: `npx shadcn@latest add "https://21st.dev/r/{author}/{component}"`.
Herbouw altijd in de gekozen esthetiek — níet 1-op-1 plakken, níet terugvallen op default-Tailwind.
De generatie-*prompt* per component is publiek niet beschikbaar (dat is MCP-only).

---

## Snelle checklist per bouwsessie
- [ ] Design Context aanwezig? (`teach-impeccable`) — zo nee en serieus project: eerst draaien.
- [ ] Assets nodig? Higgsfield gewiret? Zo nee → Canva/placeholder + ASSET-TODO-lijst.
- [ ] Component-referentie nodig? → 21st.dev via WebFetch of een screenshot van de gebruiker.
- [ ] Tweaks Bar geïnjecteerd op de dev-server? (`../scripts/tweaks-bar.js`)
