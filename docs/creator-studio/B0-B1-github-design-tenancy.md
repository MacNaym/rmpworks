# RMP Creator Studio — Decisioni di architettura e design (20 novembre 2026)

## DNS e tenant: per creator, mai per categoria
- Forma canonica: `{slug-creator}.rmpworks.com`.
- Esempio di tenant: `vecchisalvataggi.rmpworks.com`, per il creator/canale "Vecchi Salvataggi".
- `rmpworks.com` = portale RMP Works, marketing, risorse gratuite, acquisto/contatto.
- La categoria (gaming, fotografia, cucina) è un attributo del creator nel database, NON parte dell'identità del sottodominio e NON la chiave tenant.
- Ogni creator riceve un catalogo autonomo, branding, quiz, lead magnet, clienti/follower, ordini e analytics separati.

### Schema logico minimo, non ancora implementato
`creators(id, slug UNIQUE, display_name, niche, status, brand_config)`
`products(id, creator_id, ...)`
`leads(id, creator_id, ...)`
`orders(id, creator_id, customer_id, ...)`
`courses(id, creator_id, ...)`
`memberships(id, creator_id, ...)`

Ogni query su dati tenant deve essere limitata a `creator_id`; con Supabase, RLS va progettata e verificata esplicitamente. Non fidarsi del solo parametro del browser. Slug proibiti: www, api, admin, auth, support, mail, static, assets, app, design-lab, creator-studio, staging e altri endpoint di sistema.

### Vincolo infrastrutturale attuale
Il sito Next 16 usa `output: "export"`; un'esportazione statica non può risolvere i creator dal nome host server-side. Per il tenant routing servono un'app runtime separata o una migrazione dell'hosting; nessuna promessa di sottodomini attivi finché DNS wildcard, TLS e host routing non sono verificati.

## GitHub Actions — analisi del rischio
- Account MacNaym: comunicazione del 19/11/2026 indica 2.000/2.000 minuti consumati e rinnovo 01/12/2026.
- Il repository rmpworks è pubblico al controllo del 20/11/2026.
- Il tree del repository su main non contiene `.github/workflows`: non emergono workflow Actions versionati IN QUESTO repo.
- GitHub concede uso gratuito di Actions su runner standard dei repo pubblici, secondo la documentazione ufficiale.
- Il consumo avvenuto sull'account può provenire da altri repo privati; non è possibile attribuirlo senza report Billing/Actions su tutto l'account.
- Policy operativa: eseguire lint/build in locale; evitare workflow Actions nei repo privati fino al reset o a nuovo budget controllato; non attivare un runner locale senza misure di sicurezza.

## Staging locale preferito
Windows PowerShell, dopo `git clone` sul PC:
```powershell
git switch feature/creator-studio-b0-b1
npm ci
npm run lint
npm run build
npm run dev -- -p 3100
```
Preview locale: `http://localhost:3100/design-lab`; homepage `http://localhost:3100/`; Founder `http://localhost:3100/creator-studio`.
Il terminale `npm run dev` rimane aperto. Non modificare DNS né produzione.

## B1 — Laboratorio grafico
Comparazione in `/design-lab` con 5 direzioni:
1. Editorial Studio: serif, impaginazione da magazine, salvia/inchiostro/carta.
2. Neo Brutalist: headline grandi, contrasto duro, accenti lime e rosso.
3. Creator Control: dark studio, mint, mini dashboard dimostrativa.
4. Analog Workshop: carta, collage, tipografia calda, editoriale ludico.
5. Swiss System: griglia, rosso, alta leggibilità, layout disciplinato.

La pagina è esclusa dall'indicizzazione tramite metadati robots. La home attuale NON è sostituita da uno dei concept finché l'utente non sceglie uno stile. Le demo non contengono dati reali o funzionalità attive.

## Presenza dei progetti legacy
Eliminati i rimandi espliciti dalla homepage, dalla landing Founder, da Contatti e dalla home inglese. Le vecchie URL in `/projects/*` rimangono temporaneamente nel codice e possono essere aperte digitando l'indirizzo diretto; eliminarle o reindirizzarle richiede decisione su SEO, backlink e conservazione, per non creare 404 senza piano.

## Gate per la chiusura
- Ottenere prova lint e build locale.
- Prova visuale desktop/mobile dei 5 stili.
- Selezione grafica, homepage definitiva e revisione inglese.
- Redirect/migrazione URL legacy.
- Audit hosting e DNS, piano rollback, verifica pagine legali.
