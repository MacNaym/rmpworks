# Copy-slop — de tekst-kant van anti-slop

Een pagina kan visueel volledig onderscheidend zijn en tóch als AI lezen. De tell zit dan niet in
het font of het raster maar in de zinnen: de hero, de sectiekoppen, de feature-labels, de
microcopy, de knoptekst. Copy is ontwerp. Deze referentie hoort daarom bij de esthetiek-taxonomie,
niet ernaast.

Twee patronen krijgen hier de volle behandeling, omdat ze het hardnekkigst zijn én omdat de
*voor de hand liggende* reparatie er een nieuw slop-patroon van maakt:

1. de **em dash** — de standaardfix (alles komma) levert komma-monotonie op;
2. de **rule of three** — de standaardfix (maak er twee van) levert een even strakke mal op.

> **Werkverdeling.** Lange lopende tekst (blog, docs, essay, e-mail)? Draai de `humanizer`-skill:
> die heeft de volledige Wikipedia-catalogus van AI-tells. Dit bestand gaat over **interface-copy**
> en over de twee patronen waar de gangbare fix fout is.

---

## 1 · Em dash — variatie, geen verbod

Het teken is niet het probleem. De **monotonie** is het probleem: één schrijver, één ritme, om de
zoveel zin dezelfde ademhaling op dezelfde plek. Een mens die van gedachtestreepjes houdt zet er
drie op een pagina en daarna twintig zinnen niet. Een model zet er één per alinea, altijd op de
plek waar de zin zijn tweede idee begint.

Vandaar: geen ban, maar een **budget** plus een **repertoire**.

### Budget

| Oppervlak | Maximum |
|---|---|
| Lopende tekst | 1 per ~150 woorden |
| Eén sectie UI-copy (hero, feature-blok, pricing-kaart) | 1 |
| Eén zin | 1 (nooit twee, ook niet als paar rond een tussenzin, tenzij dát het paar ís) |
| Twee opeenvolgende zinnen | nooit allebei |
| Koppen, knoppen, labels, formuliervelden, tooltips | 0 |

### Diagnose vóór vervanging

Vraag eerst wat het streepje *doet*. Er zijn vier taken, en ze hebben verschillende alternatieven:

- **A · pauze** — retorisch inhouden vóór de clou.
- **B · tussenzin** — een terzijde tussen twee streepjes.
- **C · gelijkstelling** — "X, oftewel Y", een definitie of appositie.
- **D · wending** — contrast of afstraffing: "we probeerden A, het werkte niet".

### Repertoire (roteer, kies niet één favoriet)

| Taak | Alternatieven om af te wisselen | Voorkeur |
|---|---|---|
| A pauze | punt · komma · niets | Punt, zodra de tweede helft op eigen benen staat. |
| B tussenzin | haakjes · kommaparen · losse zin | Haakjes = echt terzijde. Komma's = onderdeel van de zin. Kies bewust. |
| C gelijkstelling | dubbele punt · "is/zijn" · bijzin met "die/dat" | Dubbele punt hooguit één keer per alinea, anders is dát je nieuwe tic. |
| D wending | punt + nieuwe zin · "maar" / "alleen:" · puntkomma | Punt wint bijna altijd. Een korte zin ná een lange doet het werk van het streepje. |

Er is een vijfde optie, altijd beschikbaar en meestal de beste: **herschrijf de zin zodat er geen
leestekentruc meer nodig is.** Een gedachtestreepje lapt in negen van de tien gevallen een zin op
die twee ideeën draagt. Knip hem doormidden en het probleem is weg in plaats van verplaatst.

### Nederlandse typografie

In Nederlandse tekst is de conventie het **half-kastlijntje met spaties** (`–`, en dash), niet het
Amerikaanse `—` tegen de woorden aan geplakt. Een gekleefde em dash in Nederlandse copy is dus een
dubbele tell: AI-ritme én anglicisme. Het scanner-script meldt dit apart.

Voor de duidelijkheid, want ze worden door elkaar gehaald:
`-` koppelteken · `–` half-kastlijntje (NL-gedachtestreepje, mét spaties) · `—` kastlijntje (EN,
meestal zonder spaties).

### Toets

Lees de alinea hardop. Adem je in drie opeenvolgende zinnen op dezelfde plek in, dan is het ritme
monotoon — ongeacht welk leesteken die adem veroorzaakt. Het streepje was het symptoom.

### Voorbeeld

**Voor** (vier streepjes, vier keer hetzelfde ritme):

<!-- slop-scan: uit -->
> Wij bouwen software — snel, en zonder ruis. Onze aanpak is anders — we starten met de meting,
> niet met het ontwerp. Dat scheelt tijd — en het scheelt discussie. Het resultaat — een product
> dat klopt.
<!-- slop-scan: aan -->

**Na** (één streepje, en dat verdient zijn plek):

> Wij bouwen software zonder ruis. We starten bij de meting in plaats van bij het ontwerp, wat
> tijd scheelt en discussie voorkomt. Het resultaat: een product dat klopt.
>
> Meestal. Soms meet je twee weken en blijkt het idee niet te kloppen – dat is dan de opbrengst.

---

## 2 · Rule of three — tel het echte aantal

De tell is dat *alles* in drieën komt. Drie features, drie bullets, drie bijvoeglijke naamwoorden,
drie kaarten, drie stappen, drie pricing-tiers. De werkelijkheid telt zelden precies tot drie; het
model doet dat wel, omdat een drietal "compleet" klinkt zonder dat iemand hoeft te controleren of
het klopt.

Dit patroon leeft in twee media tegelijk, en dat is precies waarom het in dít bestand thuishoort:

<!-- slop-scan: uit -->
- **In de copy** — het tricolon ("sneller, slimmer, schaalbaarder"), de lijst van drie bullets,
  de opsomming "A, B en C".
- **In de layout** — het 3-koloms feature-raster, de drie prijskaarten, de drie processtappen, de
  drie testimonials. `SKILL.md` verbiedt de "hero → 3-kolom-features → CTA"-layout al. Dat is
  dezelfde reflex, alleen in een ander medium.
<!-- slop-scan: aan -->

**De naïeve fix is nieuwe slop.** Overal twee van maken is geen variatie, dat is een andere mal.

### Methode: tellen in plaats van componeren

1. Schrijf **elk waar item** op, ongefilterd. Niet stoppen bij drie, niet aanvullen tot drie.
2. Streep weg wat de "en dan?"-toets niet overleeft. Wat blijft er staan als je het schrapt?
3. Publiceer het aantal dat overblijft. Eén. Twee. Vier. Zeven. Is het écht drie, houd dan drie
   aan, maar dan moet elk item die plek verdiend hebben.
4. **Varieer de lengtes over de pagina.** Een pagina met 4 · 2 · 5 · 1 items leest als geschreven.
   Een pagina met 3 · 3 · 3 leest als gegenereerd, hoe goed de zinnen ook zijn.
5. Laat de layout het echte aantal dragen: vier items zijn geen gedwongen 2×2 en al helemaal geen
   "3 + 1 eronder". Overweeg een lijst, een gestaffelde kolom, of één groot item met de rest klein.

### Budget

Hoogstens één tricolon per pagina, en alleen wanneer de drie werkelijk parallel zijn (drie echte
abonnementen, drie echte stappen in een proces). Twee drietallen op één scherm is altijd raak.

### Herkennen

Een drietal is verdacht wanneer de drie items ongeveer even lang zijn, dezelfde grammaticale vorm
hebben en met een bijvoeglijk naamwoord eindigen. Dat is de klassieke gegenereerde tricolon.
Verdacht is ook een kop van drie woorden van dezelfde soort, en een sectie waarin de bullets en het
kolomraster tóevallig allebei op drie uitkomen.

### Voorbeeld

**Voor:**

<!-- slop-scan: uit -->
> ### Sneller, slimmer, schaalbaarder
> Wij combineren strategie, ontwerp en techniek. Onze klanten kiezen ons om onze snelheid,
> onze kwaliteit en onze transparantie.
<!-- slop-scan: aan -->

Drie in de kop, drie in de eerste zin, drie in de tweede. Niemand heeft geteld; er is gecomponeerd.

**Na:**

> ### Twee weken tot iets werkends
> We ontwerpen en bouwen in hetzelfde team, dus er gaat niets verloren in de overdracht.
> Klanten noemen meestal hetzelfde als reden om te blijven: ze kunnen op elk moment zien
> waar hun geld naartoe gaat.

Vier items werden er twee, omdat er maar twee waar waren. De kop noemt een getal dat controleerbaar
is in plaats van drie bijvoeglijke naamwoorden.

---

## 3 · Meeliftende tells in interface-copy

Kort, want deze zijn snel te zien. Uitgebreid nakijken van lange tekst doet `humanizer`.

<!-- slop-scan: uit -->
- Stapel-bijvoeglijke naamwoorden in een hero: "seamless, intuitive and powerful".
- "Het is niet zomaar X, het is Y" en zijn Nederlandse tweelingbroer "niet alleen …, maar ook …".
- Werkwoord-slop in CTA's en koppen: *Elevate*, *Unlock*, *Empower*, *Supercharge*, *Effortlessly*,
  *Ontzorgen*, *Naar een hoger niveau*.
- Koppelwerkwoord-vermijding: "fungeert als", "vormt de basis voor", "biedt u de mogelijkheid om"
  waar gewoon "is" of "kan" staat.
- Title Case In Elke Kop, terwijl de rest van de site zinskapitalisatie gebruikt.
- Emoji als label-icoon (🚀 **Snel:** …) en de bullet met vetgedrukte kop-plus-dubbele-punt.
<!-- slop-scan: aan -->

---

## 4 · De copy-pas (de poort)

Draai deze pas **nadat** een variant staat en **vóór** je hem laat zien, en nog een keer vóór een
publieke pagina naar productie gaat.

1. `node scripts/slop-scan.mjs <pad…>` — meldt em-dash-dichtheid, gekleefde em dashes, drietallen
   en 3-koloms-rasters, met regelnummers.
2. Werk elke melding af met het repertoire hierboven. **Roteer** de alternatieven; vervang niet
   alle streepjes door hetzelfde leesteken, want dan verplaats je de tell alleen maar.
3. Lees de hero en de eerste sectie hardop. Let op de ademplekken.
4. Tel de lijstlengtes over de hele pagina. Kom je op 3 · 3 · 3, herverdeel dan op basis van de
   werkelijke items.

De scanner is een rookmelder, geen rechter. Hij kent geen intentie: een bewust geplaatst streepje
en een reflex zien er voor een regex identiek uit. Laat hem nooit automatisch herschrijven.

### Uitzonderen

Bewuste keuze, of juist een voorbeeld ván slop (zoals de "Voor"-blokken hierboven)? Zet de melder
uit voor dat stuk:

```md
<!-- slop-scan: uit -->
… hier kijkt de scanner niet …
<!-- slop-scan: aan -->
```

In componentcode doet `// slop-scan: uit` hetzelfde. Gebruik dit voor citaten, klantnamen en
bewuste stijlkeuzes. Gebruik het niet om een melding weg te maken die je eigenlijk moet oplossen.

### In CI

`--strict` geeft exit 1 zodra iets over het budget gaat. Zet dat pas aan nadat je een pagina één
keer schoon hebt getrokken, anders staat de poort meteen rood en zet iemand hem weer uit.

---

*Dit bestand blijft zelf onder het streepjes-budget (~0,5 per 100 woorden). De drietallen die de
scanner er nog in vindt zijn de voorbeelden. Meet het na met
`node scripts/slop-scan.mjs references/copy-slop.md`.*
