# Inspiratie-bibliotheek — Stap 1 workflow

De bibliotheek levert de **R (Reference)** in het ARIG-framework. Doel: van losse Dribbble/
Pinterest/X-refs naar gegroepeerde smaak → een concrete design brief.

## Locaties
- **Globaal** (cross-project, jouw smaak): `~/.agents/design-inspiration/`
  - `library.md` — de index (stijl-tag → refs).
  - `_captures/` — opgeslagen screenshots + `.md`-notities per ref.
- **Per project**: optioneel `inspo/` in de projectroot voor project-specifieke refs.

## Capture-formaat (per referentie)
Wanneer de gebruiker een URL of screenshot geeft, leg vast in `library.md` onder de juiste stijl-tag:

```md
### <stijl-tag>  ·  bijv. Print Tech
- **ref**: <URL of _captures/bestandsnaam.png>
- **bron**: Dribbble | Pinterest | X | site | …
- **wat werkt**: 1-2 zinnen — WAT precies (type-contrast, grid, kleur, motion, spacing).
- **wat NIET overnemen**: optioneel (guard-rail-kandidaat).
- **toegevoegd**: <YYYY-MM-DD>
```

Regels:
- Groepeer altijd onder een stijl uit `aesthetic-styles.md`. Past niks → stel een nieuwe tag voor.
- Beschrijf **waarom** het werkt (dat is de smaak), niet alleen "mooi".
- Screenshots → sla op in `_captures/` met een sprekende naam; verwijs relatief.

## Regelmatig vragen (niet dwangmatig)
Bij de start van een ontwerp-sessie, of ~wekelijks: *"Nieuwe refs voor de bibliotheek? Dribbble/
Pinterest/X-links of screenshots?"* Voeg toe → hergroepeer indien nodig.

## Van bibliotheek → design brief (ARIG)
Bij een nieuw ontwerpverzoek:
1. Selecteer de 2-4 meest relevante stijl-tags + refs voor dit doel/deze doelgroep.
2. Destilleer het gedeelde DNA (type, kleur, motion, layout) uit die refs.
3. Schrijf de brief langs **A**esthetic / **R**eference / **I**ntent / **G**uard Rails.
4. Die brief voedt de Wide Net (5 stijlen) — spreid bewust *voorbij* de gekozen tags zodat er
   echte alternatieven ontstaan, niet 5x hetzelfde.

## Onderhoud
- Dubbele/verouderde refs opschonen bij het toevoegen van nieuwe.
- Verschuift de smaak? Werk de stijl-DNA's in `aesthetic-styles.md` bij (dat is de bron).
