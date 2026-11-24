# B6 — Contratto di acquisizione lead: pipeline bloccata per default

## Ambito di questa PR
Il nuovo `functions/_lib/public-lead-pipeline.ts` definisce **solo** la sequenza di controllo di un futuro lead pubblico; non è importato da una route Cloudflare, non crea endpoint, non invia email e non scrive alcun dato. Il release gate #28 resta pienamente vigente.

Controlli eseguiti (in ordine):
1. Autorizzazione server-side di piattaforma, snapshot pubblicato, approvazione creator, privacy pronta, ID tenant valido.
2. Validazione della richiesta, consenso alla consegna distinto da marketing, honeypot vuoto.
3. Rate limit (PR #46, ancora da collaudare).
4. Verifica Turnstile lato server (PR #45, ancora da collaudare).
5. Un solo callback `deliver` fidato, oggi **non implementato né collegato**.

Risultati negativi generici: 404/429/503; successo 202 solo quando il callback fidato conclude. Un futuro endpoint deve aggiungere anche limiti di body, host/origin, autenticità snapshot, risorsa approvata, versionamento informativa, idempotenza, audit, retention e consegna protetta.

## Perché NON colleghiamo ancora il database
Nell'attuale progetto `creator_leads` l'inserimento anonimo è esplicitamente revocato e la policy per i creator permette soltanto `source='preview_test'` con JWT dell'owner. È corretto mantenerlo così. **Non aggiungere GRANT INSERT ad anon**, né usare service-role nell'endpoint pubblicato senza una procedura RLS e un writer vincolato al tenant, testato su staging.

## Verifica
```powershell
node --experimental-strip-types --test tests/public-lead-pipeline.test.mjs
```
Sei test isolati simulano le dipendenze e verificano: release deny, payload invalidi, rate prima del CAPTCHA, challenge rifiutato, consenso marketing separato, errori fail-closed.

## Sequenza integrazione
- Validare PR #45 e #46 (test su PC e runtime D1).
- Revisionare e applicare solo su staging la migrazione D1 necessaria, dopo risoluzione dell'account target.
- Progettare writer server-side limitato a un creator pubblicato, senza permessi anon generalizzati, con RLS/procedure e audit.
- Integrare la pipeline nel futuro endpoint su preview soltanto, con switch OFF di default.
- Verificare ShopShield con configurazione manuale del Capitano e privacy specifica del creator.
- Superare i test reali e ottenere autorizzazione esplicita secondo issue #28 prima di qualunque raccolta pubblica.

**Nessuna modifica richiesta a Stripe, ShopShield o Cloudflare produzione in questa PR.**
