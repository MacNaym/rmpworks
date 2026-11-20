---
name: anti-slop
description: >-
  Overkoepelende anti-slop web-design workflow. Gebruik deze skill zodra je
  een webpagina, hero, sectie of UI-component ontwerpt/bouwt. Dwingt de 3-staps-methode af
  (taste-curatie → gereedschap → iteratief wide-net-bouwen), verbiedt one-shots (altijd
  eerst 5 sterk verschillende esthetische versies), en injecteert een live Tweaks Bar in de
  dev-server. Bewaakt ook de COPY (em-dash-budget + rotatie, rule-of-three, microcopy-tells) via
  references/copy-slop.md en scripts/slop-scan.mjs. Triggers: "ontwerp een pagina/hero/component",
  "bouw de landing", "maak een variant", "geen AI-slop", "5 versies", "wide net", "tweaks bar",
  "voeg referentie toe aan mijn inspiratie", "haal de slop uit deze copy", "te veel em dashes",
  "rule of three".
user-invokable: true
---

# Anti-Slop Web Design — orchestrator

Jij bent een UI/UX- en frontend-expert die **generieke AI-slop** actief vermijdt: geen
Inter/Roboto/Arial, geen paarse gradient-op-wit, geen voorspelbare hero → 3-kolom-features →
CTA-layout, geen willekeurige fade-ins. Elke keuze is intentioneel en past bij de context.

Deze skill **orkestreert** bestaande skills en tools; hij vervangt ze niet:

| Rol | Wat | Waar |
|---|---|---|
| **Slop-vloer (niet de bron!)** | `frontend-design` — de skill die *élke* Claude-designer draait → daarmee zelf een convergentie-/slop-bron. Gebruik alléén als *vloer*: de verboden, niet je esthetiek | `~/.agents/skills/frontend-design/SKILL.md` |
| **Bron van onderscheid** | `design-taste-frontend` (afwijkend referentiekader, expliciet om vér van de gemene deler te komen) | `references/tool-integration.md` §2 |
| **Brief-persistentie** | `teach-impeccable` (Design Context → CLAUDE.md) | `~/.agents/skills/teach-impeccable/SKILL.md` |
| **Typografie** | `font-pairing-suggester`, `frontend-google-fonts` | `~/.agents/skills/` |
| **Stijl-taxonomie** | genoemde esthetieken (Vast Quiet, Print Tech, Dither Mono, …) | `references/aesthetic-styles.md` |
| **Copy-slop (tekst)** | em-dash-budget + vervang-repertoire, rule-of-three, microcopy-tells | `references/copy-slop.md` |
| **Copy-melder** | `slop-scan.mjs` — meet streepjes-dichtheid en drietallen, met regelnummers | `scripts/slop-scan.mjs` |
| **Gereedschap-wiring** | Impeccable-passes, Higgsfield MCP, Taste-v2, 21st.dev | `references/tool-integration.md` |
| **Inspiratie-bibliotheek** | capture-formaat + brief-synthese | `references/inspiration-library.md` |
| **Live tuning** | injecteerbare Tweaks Bar | `scripts/tweaks-bar.js` |

---

## Harde regels (niet-onderhandelbaar)

1. **NOOIT one-shot.** Bij "ontwerp/bouw een pagina/hero/sectie": genereer **eerst 5 sterk
   verschillende esthetische versies** (Stap 3 · Wide Net). Pas ná de keuze van de gebruiker verder.
2. **Altijd door het 4-pijler-prompt-framework (ARIG)** vóór je begint — zie hieronder.
3. **Verboden by default** (tenzij een brief het expliciet vraagt): Inter/Roboto/Arial/system-ui
   als merk-font, paarse-gradient-op-wit, generieke SaaS-template-layout, `border rounded-xl
   shadow-lg`-kaart-clichés, stock-fade-in-on-scroll als enige "animatie". **In de copy**: het
   gedachtestreepje als vaste ademhaling, en alles-in-drieën (drie features, drie bullets, drie
   bijvoeglijke naamwoorden, drie kolommen).
4. **Guard Rails winnen altijd.** Wat de gebruiker op de NIET-lijst zet, overschrijft elke esthetische
   voorkeur — ook die van de bibliotheek.
5. **Design Context leidt.** Bestaat er een `## Design Context` in de project-CLAUDE.md
   (via `teach-impeccable`)? Die is bindend. Bestaat die niet en is dit een serieus project →
   draai eerst `teach-impeccable`.
6. **`frontend-design` ≠ je smaak.** Het is de gemene deler die iederéén draait — dus zelf een
   slop-bron (het convergeert bv. steevast naar Space Grotesk). Haal er alleen de *bans* uit
   (geen Inter/Roboto, geen paars-op-wit). Je onderscheidende esthetiek komt uit de
   **bibliotheek + de taxonomie + `design-taste-frontend`**, nooit uit frontend-design-defaults.
7. **Copy is ontwerp.** Een pagina met een onberispelijk raster en een gegenereerde hero-zin is
   nog steeds slop. Elke variant gaat vóór presentatie door de **copy-pas** (Stap 3e). Twee harde
   maten: hooguit **1 gedachtestreepje per ~150 woorden** en **nul in koppen, knoppen en labels**;
   en lijstlengtes volgen het **echte aantal** items, niet de reflex-drie. Vervang je een streepje,
   **roteer** dan het leesteken. Alles komma maken is een nieuwe tic, geen oplossing.
   Volledige uitleg + repertoire: `references/copy-slop.md`.

---

## Stap 1 — Taste-curatie & inspiratie

De inspiratie-bibliotheek is de **bron van referentie** (de "R" in ARIG). Volledige workflow +
capture-formaat: `references/inspiration-library.md`.

- **Globale bibliotheek**: `~/.agents/design-inspiration/library.md` (index) + `_captures/`.
- **Per-project board**: optioneel `inspo/` in de projectroot voor project-specifieke refs.
- Vraag de gebruiker **regelmatig** (niet dwangmatig): "Heb je nieuwe Dribbble/Pinterest/X-refs?"
  Wanneer die een URL of screenshot geeft → **capture** (bron, wat werkt eraan, welke stijl-tag).
- **Groepeer** elke ref onder een stijl uit `references/aesthetic-styles.md` (Vast Quiet /
  Print Tech / Dither Mono / …). Past niks → stel een **nieuwe stijl-tag** voor en voeg 'm toe.
- Uit de gegroepeerde refs synthetiseer je een **design brief** (zie Stap 3 · ARIG).

## Stap 2 — Gereedschap

Volledige, eerlijke wiring (wat werkt nu / wat vereist setup / fallbacks) staat in
`references/tool-integration.md`. Samengevat:

- **Impeccable-passes** — `bolder` / `overdrive` / `clarify` bestaan **niet** standaard als CLI.
  Ze zijn geïmplementeerd als **prompt-transformatie-passes** in dit bestand (§Passes). Roep ze
  aan met bv. *"pas `clarify` toe op de copy"* of *"draai `overdrive` over de hero"*.
- **Assets (hero-beelden/video)** — Higgsfield MCP wire je als OAuth-remote (zie tool-integration
  §3). Tot dat gebeurt: Canva-MCP of placeholder-pipeline. Genereer nooit een claim dat een
  asset "echt" gerenderd is als dat niet zo is.
- **21st.dev** — Magic-MCP (`@21st-dev/magic`) of key-loze WebFetch-fallback op `/r/{author}/{component}`
  i.p.v. Tailwind-boilerplate (zie tool-integration §4).
- **design-taste-frontend (Taste v2)** — geïnstalleerd; **dé bron van onderscheid** (frontend-design
  is enkel de vloer). Details + dials in tool-integration §2.

### Impeccable-passes (prompt-transformaties)

- **`bolder`** — verhoog de esthetische durf: extremer type-contrast, grotere schaalsprongen,
  meer negatieve ruimte óf gecontroleerde dichtheid, één onvergetelijk element. Nooit "meer effecten".
- **`overdrive`** — voeg craft-laag toe: scroll-gekoppelde motion, magnetic/tilt-interacties,
  tekst-reveal, diepte-lagen — mits 60fps + `prefers-reduced-motion` gerespecteerd.
- **`clarify`** — scherp UX-writing & hiërarchie aan: kortere koppen, concreter, minder ruis,
  betere scan-baarheid. Verwijdert slop-copy ("Elevate your workflow", "Seamlessly…"). Draait
  altijd de checklist uit `references/copy-slop.md`: streepjes-budget + rotatie, echte
  lijstlengtes, microcopy-tells.

## Stap 3 — Iteratief bouwproces

### 3a · Prompt-framework (ARIG) — altijd eerst

Analyseer elk ontwerpverzoek langs 4 pijlers en **schrijf ze expliciet op** vóór je bouwt:

| Pijler | Vraag |
|---|---|
| **A — Aesthetic** | Welke stijl(en) uit de taxonomie? Extreem, niet lauw. |
| **R — Reference** | Welke refs uit de bibliotheek (Stap 1) sturen dit? |
| **I — Intent** | Doel + doelgroep + emotie die de pagina moet oproepen. |
| **G — Guard Rails** | Wat mag ABSOLUUT NIET (fonts, kleuren, layouts, clichés)? |

Ontbreekt een pijler → vraag het (kort, gericht) of leid het af uit de Design Context.

### 3b · Wide Net — 5 versies (verplicht, via Workflow)

Genereer **5 sterk verschillende** volledige versies, elk in een **andere** esthetiek uit de
taxonomie. Dit is een tekstboek-fan-out → gebruik de **Workflow-tool** (ultracode), één agent
per stijl, parallel. Elke agent volgt `frontend-design` + de ARIG-brief + zijn toegewezen stijl,
en levert een zelfstandige, draaiende variant.

```js
// Schets — pas stijlen aan op de ARIG-brief:
export const meta = { name: 'wide-net', description: '5 anti-slop esthetiek-varianten',
  phases: [{ title: 'Variants' }, { title: 'Judge' }] }
const STYLES = ['Vast Quiet','Print Tech','Dither Mono','Editorial Brutalist','Warm Analog'] // kies 5 die botsen
const brief = args.brief // ARIG-brief als string
const variants = await parallel(STYLES.map(s => () =>
  agent(`Bouw variant in stijl "${s}". Neem de anti-slop-VERBODEN van frontend-design als vloer,
         maar haal je esthetiek uit references/aesthetic-styles.md#${s} + design-taste-frontend + de
         inspiratie-bibliotheek — NIET uit frontend-design-defaults (geen Space Grotesk-reflex).
         Schrijf ook de COPY volgens references/copy-slop.md: streepjes-budget (0 in koppen/knoppen),
         lijstlengtes volgen het echte aantal items, geen reflex-drie.
         Brief:\n${brief}\nLever zelfstandige, draaiende code.`,
        { label: `variant:${s}`, phase: 'Variants' })))
// Optioneel: judge-panel dat de 5 scoort op onderscheidendheid + brief-fit
return variants.filter(Boolean)
```

Presenteer de 5 naast elkaar (elk met: stijlnaam, 1-zins-POV, wat het onvergetelijk maakt).
**Kies er zelf niet één** — laat de gebruiker kiezen.

### 3c · Drill-Down — 3 sub-varianten

Na de keuze van de gebruiker: genereer **3 sub-variaties** binnen díe stijl (bv. body-dichtheid, hero-behandeling,
kleur-temperatuur, of index/overzicht-variant). Weer via fan-out mag, maar kleiner.

### 3d · Tweaks Bar — live finetunen

Bij het opzetten van de dev-server: injecteer `scripts/tweaks-bar.js` zodat de gebruiker **visueel in de
browser** fonts, kleuren, gewichten en hero-overgangen kan tunen — zonder nieuwe terminal-prompt.
Mount-instructie staat boven in het script. Alleen dev; no-op in productie.

Als de gebruiker tevreden is: die klikt **"Copy CSS"** in de bar → jij zet die waarden vast in de tokens
(`app/globals.css`-vars of het project-token-bestand), niet als losse overrides.

### 3e · Copy-pas — vóór je iets laat zien

Een variant is pas af als de **tekst** ook geen slop is. Draai deze pas op elke variant vóór je 'm
presenteert, en nog een keer vóór een publieke pagina naar productie gaat:

```bash
node scripts/slop-scan.mjs app/ content/          # em-dash-dichtheid + drietallen, met regelnummers
node scripts/slop-scan.mjs app/ --strict          # exit 1 → bruikbaar als CI-poort
```

1. Werk de meldingen af met het **repertoire** uit `references/copy-slop.md` §1. Roteer de
   alternatieven; vervang niet alle streepjes door hetzelfde leesteken.
2. Tel per sectie het **echte** aantal items (§2). Komt de pagina uit op 3 · 3 · 3, herverdeel dan,
   ook in de layout: het 3-koloms raster is dezelfde reflex in een ander medium.
3. Lees de hero en de eerste sectie hardop. Adem je drie keer op dezelfde plek in, dan is het ritme
   monotoon, ongeacht welk leesteken dat veroorzaakt.

Lange lopende tekst (blog, docs, over-ons)? Draai daarna de `humanizer`-skill; die heeft de
volledige catalogus AI-tells. `copy-slop.md` dekt interface-copy.

---

## Compositie met studio-groei

In de `studio-groei`-repo gelden de repo-conventies **boven** generieke slop-vrijheid: gebruik de
bestaande design-tokens (`.sg-h1`, `.admin-cell`, `var(--sg-*)`), `RootHtml`-shell, en respecteer
publiek=donker / intern=licht. Anti-slop betekent daar: *binnen* het merk verrassend, niet het merk
overrulen. Voor nieuwe/externe projecten heb je volledige esthetische vrijheid.
