# RMP Creator Studio — Audit B0 (20 novembre 2026)

## Ambito e salvaguardia
- Repository verificato: `MacNaym/rmpworks`, branch principale `main`.
- Branch di lavoro isolato: `feature/creator-studio-b0-b1`. Nessuna modifica direttamente su `main` o sul sito live.
- Principali pagine esistenti da preservare: `/projects`, `/projects/regolario`, `/about`, `/contact`, `/en`.
- Stack verificato via `package.json`: Next.js 16.3.5, React 19.2.8, Tailwind 4, TypeScript 5.
- `next.config.ts` imposta `output: "export"`: il sito attuale è statico e non può risolvere tenant sulla base del dominio host lato server. Non introdurre middleware, webhook o sottodomini dinamici in questo stesso deployment senza modifica dell'architettura.
- Homepage originale in `main`: priorità Regolario. Nuova homepage creator-first su branch, con link a progetti esistenti.
- Contatto pubblico verificato nel codice: numero aziendale `app/contact-details.ts`; non inventare indirizzi email né moduli senza backend.

## Verifiche non ancora eseguibili con il solo accesso repository
- DNS autorevole, registrar, provider di hosting, pipeline effettiva di pubblicazione, TLS wildcard.
- Stripe: account corretto, modalità live/test, tasse, payout e webhooks.
- Privacy/cookie/termini, conformità del sito e condizioni per una prevendita.
- Build `npm run build`, mobile QA e link check automatizzato sull'insieme del sito.
- Backup del deploy e rollback del provider: il branch preserva il codice, ma non sostituisce un backup hosting.

## Confini delle modifiche B1
- Pagina home: copy creator, navigazione, CTA alla pagina di programma.
- Pagina `/creator-studio`: informativa Founder trasparente, niente checkout funzionante e nessun presunto cliente.
- Pagina contatti: mantenere canale Regolario distinguendolo dalla nuova attività creator.
- Non modificare servizi Regolario, DNS, database, Stripe o configurazione di export.

## Gate prima della messa online
1. Revisione contenuto/prezzi e approvazione del proprietario.
2. `npm ci && npm run lint && npm run build` sull'intero repository.
3. Verifica responsive e percorsi `/`, `/creator-studio`, `/projects/regolario`, `/contact`, `/en`.
4. Verifica pagine legali e banner cookie se pertinente.
5. Conferma del provider e della strategia di deploy/rollback.
6. Nessuna vendita Founder prima delle condizioni complete, disponibilità reale, data di consegna e Stripe verificato.

## Nota sull'architettura tenant successiva
Preferenza: separare marketing statico (`rmpworks.com`) dall'app di tenant a runtime, ad esempio con routing host su server/edge e dati isolati. Decisione concreta dopo inventario DNS, budget e hosting. Non considerare tenant funzionali solo perché la landing ne parla.
