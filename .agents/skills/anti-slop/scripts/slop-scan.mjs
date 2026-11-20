#!/usr/bin/env node
/*
 * Anti-Slop Copy Scanner — rookmelder voor tekst-slop.
 * -------------------------------------------------------------------------
 * Meet de twee patronen waar de gangbare reparatie zélf slop oplevert:
 *
 *   1) EM DASH   — dichtheid, twee in één zin, twee zinnen op rij, gekleefd
 *                  (`woord—woord` is in NL een anglicisme), en streepjes in
 *                  koppen/knoppen (daar hoort het budget op nul te staan).
 *   2) RULE OF   — "A, B en C"-drietallen, series van precies 3 lijstitems,
 *      THREE       en 3-koloms rasters (de layout-variant van dezelfde reflex).
 *
 * Uitleg + het vervang-repertoire: references/copy-slop.md
 *
 * GEBRUIK
 *   node scripts/slop-scan.mjs <pad…> [opties]
 *   node scripts/slop-scan.mjs app/ content/index.md
 *   node scripts/slop-scan.mjs src --json
 *   node scripts/slop-scan.mjs src --strict      # exit 1 zodra er iets afgaat
 *
 * OPTIES
 *   --json          machine-leesbare uitvoer
 *   --strict        exit-code 1 bij ≥1 bevinding (voor een CI-poort)
 *   --density=N     em-dashes per 100 woorden die nog mogen (default 0.67 = 1 per 150)
 *   --all           toon ook info-meldingen die anders zijn samengevat
 *
 * UITZONDEREN (voor bewuste keuzes en voor voorbeelden ván slop):
 *   <!-- slop-scan: uit -->  …  <!-- slop-scan: aan -->      (md/html)
 *   // slop-scan: uit        …  // slop-scan: aan            (code)
 *
 * DIT IS GEEN RECHTER. Een regex kent geen intentie: een bewust geplaatst
 * streepje en een reflex zien er identiek uit. Laat dit script nooit
 * automatisch herschrijven — het wijst aan, jij beslist.
 *
 * Geen dependencies. Node ≥ 18.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

// ── config ────────────────────────────────────────────────────────────────

const PROSE_EXT = new Set(['.md', '.mdx', '.txt', '.html', '.htm']);
const CODE_EXT = new Set(['.tsx', '.jsx', '.ts', '.js', '.mjs', '.vue', '.svelte', '.astro']);
const SKIP_DIR = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out', 'coverage',
  '.turbo', '.vercel', '.cache', 'vendor', '__snapshots__',
]);

const EM = '—'; // — kastlijntje (EN)
const EN = '–'; // – half-kastlijntje (NL, mét spaties)
const DASH_ANY = new RegExp(`${EM}|\\s${EN}\\s`, 'g');
const DASH_GLUED = new RegExp(`\\S${EM}\\S|\\S${EM}|${EM}\\S`);

// "A, B en C" / "A, B, and C" / "A, B of C" — losse woorden of korte woordgroepen.
const ITEM = "[\\w'’-]+(?:\\s+[\\w'’-]+){0,3}";
const TRIAD = new RegExp(`\\b(${ITEM}),\\s+(${ITEM}),?\\s+(?:en|and|of|or)\\s+(${ITEM})\\b`, 'gi');
// "Sneller, slimmer, schaalbaarder" — tricolon zónder voegwoord. Alleen betrouwbaar in
// koppen en labels; in lopende tekst is dat gewoon een opsomming.
const TRIAD_KAAL = new RegExp(`^\\s*(${ITEM}),\\s+(${ITEM}),\\s+(${ITEM})\\s*[.!?]?\\s*$`, 'i');

const SCAN_UIT = /slop-scan:\s*uit/i;
const SCAN_AAN = /slop-scan:\s*aan/i;
const GRID3 =/grid-cols-3|columns-3|basis-1\/3|repeat\(\s*3\s*,|grid-template-columns:\s*(?:[^;]*\b1fr\s+1fr\s+1fr)/;
const UI_LABEL = /<(h[1-6]|button)\b[^>]*>([^<>{}]{2,})</gi;
const MD_HEADING = /^\s{0,3}#{1,6}\s+(.*)$/;
const LIST_ITEM = /^(\s*)(?:[-*+]|\d+[.)])\s+(.+)$/;
// `- **term** — uitleg` en `## Kop — ondertitel`: structuur van een document, geen
// zins-ritme. Telt niet mee voor de dichtheid; wordt apart samengevat.
const DEF_DASH = new RegExp(`^(\\s{0,3}(?:#{1,6}|[-*+]|\\d+[.)])\\s+[^${EM}${EN}]{0,70}?\\s)(${EM}|${EN})\\s`);

// ── cli ───────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith('--')));
const targets = argv.filter((a) => !a.startsWith('--'));
const densityLimit = Number(
  [...flags].find((f) => f.startsWith('--density='))?.split('=')[1] ?? 0.67,
);

if (!targets.length) {
  console.error('gebruik: node scripts/slop-scan.mjs <pad…> [--json] [--strict] [--density=N] [--all]');
  process.exit(2);
}

// ── bestanden verzamelen ──────────────────────────────────────────────────

function collect(path, acc = []) {
  let st;
  try {
    st = statSync(path);
  } catch {
    console.error(`overgeslagen (bestaat niet): ${path}`);
    return acc;
  }
  if (st.isDirectory()) {
    for (const entry of readdirSync(path)) {
      if (SKIP_DIR.has(entry) || entry.startsWith('.')) continue;
      collect(join(path, entry), acc);
    }
    return acc;
  }
  const ext = extname(path).toLowerCase();
  if (PROSE_EXT.has(ext) || CODE_EXT.has(ext)) acc.push(path);
  return acc;
}

// ── tekst-extractie ───────────────────────────────────────────────────────

/** Ziet een string eruit als copy, of als een className/pad/URL/ID? */
function looksLikeProse(s) {
  const t = s.trim();
  if (t.length < 12) return false;
  if (/^(https?:|\/|\.\.?\/|#|@|data:|\$\{)/.test(t)) return false;
  if (/[:/\\]/.test(t)) return false; // className-modifiers (md:), paden, urls
  const tokens = t.split(/\s+/);
  if (tokens.length < 3) return false;
  // tailwind-achtig: px-4, text-sm, 1fr, gap-2
  const utility = tokens.filter((w) => /^[a-z]+-[a-z0-9[]/.test(w) || /^\d/.test(w)).length;
  if (utility / tokens.length > 0.34) return false;
  return /[a-zA-Z]{3,}/.test(t);
}

/** Welke regels staan tussen `slop-scan: uit` en `slop-scan: aan`? */
function uitgezonderd(lines) {
  const skip = new Array(lines.length).fill(false);
  let uit = false;
  lines.forEach((raw, i) => {
    if (SCAN_UIT.test(raw)) { uit = true; skip[i] = true; return; }
    if (SCAN_AAN.test(raw)) { uit = false; skip[i] = true; return; }
    skip[i] = uit;
  });
  return skip;
}

/** Prose-regels uit een markdown/txt/html-bestand. Tabellen en code tellen niet mee. */
function proseLinesFromProse(lines, ext, counters, skip) {
  const out = [];
  let inFence = false;
  let inFrontmatter = false;
  let inRaw = false; // <script>/<style>
  lines.forEach((raw, i) => {
    const n = i + 1;
    let line = raw;
    if (skip[i]) return;
    if (i === 0 && /^---\s*$/.test(line)) { inFrontmatter = true; return; }
    if (inFrontmatter) { if (/^---\s*$/.test(line)) inFrontmatter = false; return; }
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; return; }
    if (inFence) return;
    if (/<(script|style)\b/i.test(line)) inRaw = true;
    if (inRaw) { if (/<\/(script|style)>/i.test(line)) inRaw = false; return; }
    if (/^\s*\|/.test(line)) return;             // tabelrij: structuur, geen ritme
    if (/^\s{4,}\S/.test(line) && ext !== '.html') return; // ingesprongen codeblok
    if (DEF_DASH.test(line)) { counters.defDashes++; line = line.replace(DEF_DASH, '$1 '); }
    line = line
      .replace(/`[^`]*`/g, ' ')                  // inline code
      .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')  // links → linktekst
      .replace(/<[^>]+>/g, ' ');                  // html-tags
    if (line.trim()) out.push({ line: n, text: line });
  });
  return out;
}

/** Prose-regels uit een component-bestand: JSX-tekstnodes + string-literals. */
function proseLinesFromCode(lines, skip) {
  const out = [];
  let inBlockComment = false;
  lines.forEach((raw, i) => {
    if (skip[i]) return;
    let line = raw;
    if (inBlockComment) {
      if (line.includes('*/')) { line = line.slice(line.indexOf('*/') + 2); inBlockComment = false; }
      else return;
    }
    if (line.includes('/*')) { line = line.slice(0, line.indexOf('/*')); inBlockComment = !raw.includes('*/'); }
    if (/^\s*(import|export\s+\*|const\s+\w+\s*=\s*require)/.test(line)) return;
    line = line.replace(/\/\/.*$/, '');

    const parts = [];
    for (const m of line.matchAll(/>([^<>{}]{3,})</g)) parts.push(m[1]);
    for (const m of line.matchAll(/(['"`])((?:\\.|(?!\1)[^\\\n])+?)\1/g)) parts.push(m[2]);
    const text = parts.filter(looksLikeProse).join(' ');
    if (text.trim()) out.push({ line: i + 1, text });
  });
  return out;
}

// ── checks ────────────────────────────────────────────────────────────────

function countWords(s) {
  return (s.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) || []).length;
}

function scanFile(path, root) {
  const r = relative(root, path);
  const rel = !r || r.startsWith('..') ? path : r;
  const src = readFileSync(path, 'utf8');
  const lines = src.split(/\r?\n/);
  const ext = extname(path).toLowerCase();
  const isCode = CODE_EXT.has(ext);
  const counters = { defDashes: 0 };
  const skip = uitgezonderd(lines);
  const prose = isCode
    ? proseLinesFromCode(lines, skip)
    : proseLinesFromProse(lines, ext, counters, skip);
  const findings = [];
  const add = (rule, line, level, msg, sample) =>
    findings.push({
      file: rel, rule, line, level, msg,
      sample: sample?.replace(/\s+/g, ' ').trim().slice(0, 110),
    });

  // ---- em dash ----------------------------------------------------------
  let dashes = 0;
  let words = 0;
  const dashLines = [];
  for (const seg of prose) {
    words += countWords(seg.text);
    const hits = seg.text.match(DASH_ANY);
    if (hits) { dashes += hits.length; dashLines.push(seg); }
    if (DASH_GLUED.test(seg.text)) {
      add('em-gekleefd', seg.line, 'info',
        `gekleefde "${EM}" — NL-conventie is "${EN}" mét spaties`, seg.text);
    }
  }

  // twee streepjes in één zin · twee zinnen op rij.
  // Alinea-grens (of, in code, elke aparte string) breekt de keten: ¶ = harde stop.
  const bounds = [];
  let stream = '';
  prose.forEach((s, i) => {
    const gap = i === 0 ? '' : (isCode || s.line - prose[i - 1].line > 1) ? '\n\n' : '\n';
    stream += gap;
    bounds.push([stream.length, s.line]);
    stream += s.text;
  });
  const lineOf = (idx) => {
    let lo = bounds[0]?.[1] ?? 1;
    for (const [off, line] of bounds) if (off <= idx) lo = line; else break;
    return lo;
  };
  let cursor = 0;
  for (const alinea of stream.split(/\n{2,}/)) {
    let prevHadDash = false; // de keten stopt bij een alinea-grens
    for (const sentence of alinea.split(/(?<=[.!?…])[\s\n]+/)) {
      if (!sentence.trim()) continue;
      const at = stream.indexOf(sentence, cursor);
      cursor = at + sentence.length;
      const n = (sentence.match(DASH_ANY) || []).length;
      if (n >= 2) {
        add('em-zin', lineOf(at), 'slop', `${n} gedachtestreepjes in één zin`, sentence);
      } else if (n === 1 && prevHadDash) {
        add('em-ritme', lineOf(at), 'slop',
          'twee opeenvolgende zinnen ademen op dezelfde plek', sentence);
      }
      prevHadDash = n >= 1;
    }
  }

  // Dichtheid pas meten als er genoeg tekst is; onder ~60 woorden zegt een ratio niets.
  const density = words ? (dashes / words) * 100 : 0;
  if (words >= 60 && dashes >= 2 && density > densityLimit) {
    add('em-dichtheid', dashLines[0]?.line ?? 1, 'slop',
      `${dashes} streepjes op ${words} woorden = ${density.toFixed(2)}/100w ` +
      `(budget ${densityLimit}/100w ≈ 1 per ${Math.round(100 / densityLimit)})`);
  }

  if (counters.defDashes) {
    add('def-streepje', 1, 'info',
      `${counters.defDashes} structuur-streepje(s) in koppen/lijstitems, niet meegeteld`);
  }

  // streepje in een kop/knop/label → budget is daar nul
  lines.forEach((raw, i) => {
    if (skip[i]) return;
    if (isCode || ext === '.html' || ext === '.htm') {
      for (const m of raw.matchAll(UI_LABEL)) {
        if (DASH_ANY.test(m[2])) {
          DASH_ANY.lastIndex = 0;
          add('em-label', i + 1, 'slop', `<${m[1].toLowerCase()}> met gedachtestreepje`, m[2]);
        }
        DASH_ANY.lastIndex = 0;
      }
    }
  });

  // ---- rule of three ----------------------------------------------------
  let triads = 0;
  for (const seg of prose) {
    for (const m of seg.text.matchAll(TRIAD)) {
      triads++;
      // Drie losse woorden achter elkaar is de klassieke gecomponeerde tricolon.
      // Langere leden kunnen een echte opsomming zijn: melden, niet veroordelen.
      const kaal = [m[2], m[3]].every((s) => !/\s/.test(s.trim()));
      add('drietal', seg.line, kaal ? 'slop' : 'info',
        kaal ? 'drietal van losse woorden — tel het echte aantal' : 'drietal', m[0]);
    }
  }

  // Koppen en UI-labels: daar is "A, B, C" vrijwel altijd gecomponeerd, ook zonder voegwoord.
  lines.forEach((raw, i) => {
    if (skip[i]) return;
    const kandidaten = [];
    const h = raw.match(MD_HEADING);
    if (h && !isCode) kandidaten.push(h[1].replace(/[*_`#]/g, '').trim());
    if (isCode || ext === '.html' || ext === '.htm') {
      for (const m of raw.matchAll(UI_LABEL)) kandidaten.push(m[2].trim());
    }
    for (const tekst of kandidaten) {
      if (!tekst) continue;
      const kaal = tekst.match(TRIAD_KAAL);
      const metVoegwoord = tekst.match(new RegExp(TRIAD.source, 'i'));
      if (kaal || metVoegwoord) {
        triads++;
        add('drietal-kop', i + 1, 'slop', 'tricolon in een kop of label', tekst);
      }
    }
  });

  if (triads > 1) {
    add('drietal-budget', prose[0]?.line ?? 1, 'slop',
      `${triads} drietallen in één bestand (budget: 1 per pagina)`);
  }

  // series van precies 3 lijstitems
  if (!isCode) {
    let run = [];
    let indent = null;
    const runs = [];
    const flush = () => { if (run.length === 3) runs.push(run); run = []; indent = null; };
    lines.forEach((raw, i) => {
      if (skip[i]) { flush(); return; }
      const m = raw.match(LIST_ITEM);
      if (m) {
        if (indent !== null && m[1].length !== indent) flush(); // sublijst = eigen serie
        if (indent === null) indent = m[1].length;
        run.push({ line: i + 1, text: m[2] });
        return;
      }
      if (!raw.trim()) return;                       // lege regel: losse lijst loopt door
      if (run.length && /^\s{2,}\S/.test(raw)) {     // doorloopregel van hetzelfde item
        run[run.length - 1].text += ` ${raw.trim()}`;
        return;
      }
      flush();
    });
    flush();
    for (const r of runs) {
      const lens = r.map((it) => countWords(it.text));
      const spread = Math.max(...lens) - Math.min(...lens);
      if (spread <= 3) {
        add('lijst-van-drie', r[0].line, runs.length > 1 ? 'slop' : 'info',
          'exact 3 lijstitems van vergelijkbare lengte', r.map((it) => it.text).join(' / '));
      }
    }
    if (runs.length > 1) {
      add('drieslag-ritme', runs[0][0].line, 'slop',
        `${runs.length}× een blok van precies 3 items — 3·3·3 leest als gegenereerd`);
    }
  }

  // 3-koloms raster (de layout-variant)
  lines.forEach((raw, i) => {
    if (!skip[i] && GRID3.test(raw)) {
      add('raster-van-drie', i + 1, 'info',
        '3-koloms raster — is drie het ECHTE aantal items?', raw);
    }
  });

  return { file: rel, words, dashes, density, findings };
}

// ── rapport ───────────────────────────────────────────────────────────────

const root = process.cwd();
const files = targets.flatMap((t) => collect(t));
const results = files.map((f) => scanFile(f, root)).filter((r) => r.findings.length);
const all = results.flatMap((r) => r.findings);
const slop = all.filter((f) => f.level === 'slop');

if (flags.has('--json')) {
  console.log(JSON.stringify(
    { scanned: files.length, findings: all, budget: { density: densityLimit } }, null, 2));
} else if (!all.length) {
  console.log(`✓ ${files.length} bestand(en) gescand, niets aan de hand.`);
} else {
  const HINT = {
    'em-dichtheid': 'copy-slop.md §1 · budget + repertoire (roteer, kies niet één vervanger)',
    'em-zin': 'copy-slop.md §1 · knip de zin door in plaats van hem op te lappen',
    'em-ritme': 'copy-slop.md §1 · lees hardop, let op de ademplek',
    'em-gekleefd': `copy-slop.md §1 · NL-typografie: "${EN}" mét spaties`,
    'em-label': 'copy-slop.md §1 · koppen en knoppen: budget nul',
    'def-streepje': 'definitie-streepjes in docs zijn structuur, geen ritme',
    drietal: 'copy-slop.md §2 · tel het echte aantal, componeer er geen drie',
    'drietal-kop': 'copy-slop.md §2 · een kop mag een getal noemen dat klopt',
    'drietal-budget': 'copy-slop.md §2 · hoogstens 1 tricolon per pagina',
    'lijst-van-drie': 'copy-slop.md §2 · varieer lijstlengtes over de pagina',
    'drieslag-ritme': 'copy-slop.md §2 · 4·2·5·1 leest als geschreven, 3·3·3 niet',
    'raster-van-drie': 'copy-slop.md §2 · de layout-variant van dezelfde reflex',
  };
  const seenHint = new Set();
  for (const r of results) {
    const shown = flags.has('--all') ? r.findings : r.findings.filter((f) => f.level === 'slop');
    const hidden = r.findings.length - shown.length;
    if (!shown.length && !hidden) continue;
    const dichtheid = r.words >= 60 ? ` (${r.density.toFixed(2)}/100w)` : '';
    console.log(`\n${r.file}  ·  ${r.words} woorden · ${r.dashes} streepjes${dichtheid}`);
    for (const f of shown) {
      const mark = f.level === 'slop' ? '×' : '·';
      console.log(`  ${mark} ${String(f.line).padStart(4)}  ${f.rule.padEnd(16)} ${f.msg}`);
      if (f.sample) console.log(`         ${f.sample}`);
      if (!seenHint.has(f.rule)) { seenHint.add(f.rule); console.log(`         → ${HINT[f.rule]}`); }
    }
    if (hidden && !flags.has('--all')) console.log(`  · ${hidden} info-melding(en) verborgen (--all)`);
  }
  console.log(
    `\n${slop.length} bevinding(en) over het budget, ${all.length - slop.length} ter overweging, ` +
    `in ${results.length}/${files.length} bestand(en).`);
  console.log('Rookmelder, geen rechter: beoordeel elke regel zelf. references/copy-slop.md');
}

if (flags.has('--strict') && slop.length) process.exit(1);
