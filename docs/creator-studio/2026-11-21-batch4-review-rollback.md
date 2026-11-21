# Batch 4 — Revisione e rollback siti creator (procedura proposta, nessun rilascio)

## Stato e vincoli
- Stato al 21/11/2026: NON LIVE; il release gate dell'issue #28 prevale su qualunque check tecnico.
- Route predisposta: `/s/:slug`. Il routing wildcard `nomecreator.rmpworks.com` non è implementato.
- `RMP_CREATOR_PUBLIC_RELEASE` NON deve essere configurata prima dell'approvazione espressa del Capitano.
- Lo snapshot pubblico `creator_site_snapshots` è separato dalle tabelle private.
- Questo batch NON contiene endpoint per pubblicare, né scritture live o nuove autorizzazioni RLS.

## Checklist di revisione per ciascun creator
1. Verifica dell'identità del creator e della sua autorizzazione a usare nome, brand, link, materiali.
2. Revisione del brief e del contenuto della pagina (titolo, pubblico, categoria, URL canale e lead magnet).
3. Eliminazione di contatti personali, email, telefono, dati riservati e testi non approvati.
4. Controllo dei collegamenti HTTPS, escaping HTML, accessibilità e visualizzazione mobile.
5. Approvazione tracciata del creator del contenuto finale (data, versione/hash e approvatore).
6. Verifica RLS e test di isolamento tra due tenant usando account non privilegiati.
7. Verifica privacy e trattamento dati, consensi, retention e cancellazione previsti da #28.
8. Verifica meccanismi anti-abuso, consegna effettiva risorse e checkout solo quando previsti.
9. Verifica procedura di spegnimento e monitoraggio prima di qualsiasi release.
10. Autorizzazione esplicita del Capitano, successiva al superamento completo di #28.

## Modello di stati (non ancora automatizzato)
`draft` → `creator_review` → `approved` → `release_authorized` → `published`
Possibili uscite: `rejected`, `revision_required`, `unpublished`.
I nomi degli stati sono una proposta di processo e NON corrispondono ancora a colonne DB.

## Rollback: ordine di intervento
1. Fermare eventuali azioni di pubblicazione e form/checkout collegati.
2. Disattivare **prima** lo switch server-side `RMP_CREATOR_PUBLIC_RELEASE` nell'ambiente interessato (richiede deployment/propagazione; verificarne l'effetto).
3. Verificare con GET anonima che le rotte `/s/<slug>` rispondano 404 e che nessun form accetti POST.
4. Solo con autorizzazione e procedura amministrativa validata, impostare `published=false` sullo snapshot specifico interessato. Non concedere mai UPDATE a `anon` o `authenticated`.
5. Se il problema è nel codice, rollback del deployment Cloudflare all'ultima versione verificata; il rollback Cloudflare non ripristina lo stato del DB.
6. Verificare log, eventuali code/email/pagamenti avviati, e registrare incidente e ripristino.

## Test di regressione offline
```bash
node --experimental-strip-types --test tests/creator-public-gate.test.mjs
```
Usa Node >=22 con supporto strip-types. Nessun account, cookie o token di produzione necessario.

La suite verifica: variabile assente/errata, configurazione DB assente, slug non valido, database vuoto/in errore, query con filtro published, escaping HTML/CSP, POST rifiutato.

## Test ancora necessari per completare #28
- Test E2E con reale autentificazione e due creator diversi, anche su mobile.
- Verifica tenant isolation di tutti gli endpoint e RLS; security review terza parte se possibile.
- Riconciliazione pagamenti, rimborsi, IVA/contrattualistica.
- Privacy e consenso per ogni creator, cancellazione ed esportazione.
- Antibot e rate limit verificati lato server, email e deliverability.
- DNS wildcard, certificati TLS, rendering effettivo sottodomini, monitoraggio.
- Procedura di approvazione/pubblicazione autenticata con audit log.
