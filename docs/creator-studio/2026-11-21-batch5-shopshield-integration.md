# Batch 5 — ShopShield per RMP Works: integrazione sicura (non attiva)

Decisione del Capitano 21/11/2026: **ShopShield è il sistema prescelto per la privacy, il GDPR e i cookie** di RMP Works. Non implementare un altro CMP o un banner proprietario.

## Stato di questa PR
- Script **preparato** nel layout Next.js del sito principale, come primo script in `<head>` quando configurato.
- Release **disabilitata per default**. Senza `RMP_SHOPSHIELD_STORE_ID=rmpworks.com` non viene incluso alcuno script ShopShield.
- Non configurare tale variabile in Cloudflare finché ShopShield non abbia uno Store ID reale e validato per `rmpworks.com`, documentazione e flusso verificati in preview.
- Nessuna modifica ai siti creator, nessuna pubblicazione `/s/:slug`, nessun form lead pubblico, nessun checkout live.
- Nessuna nuova dipendenza npm: `@shopshield/react` v2 è facoltativo e di sola lettura; il banner e il pre-consent gating sono di `shield-uni.js`.

## Confini delle responsabilità
1. **Cookie e tracker**: ShopShield gestisce CMP, raccolta delle preferenze, registro e blocco prima del consenso, se la configurazione è attiva ed effettivamente funzionante.
2. **Informative e diritti**: ShopShield può essere il sistema operativo documentale e DSAR, ma prima del lancio servono contenuti approvati, identità del titolare, tempi di conservazione, fornitori/DPA e canale di esercizio diritti.
3. **Lead/marketing**: il consenso ai cookie **non equivale** al consenso per email marketing o condivisione lead. Ogni form deve conservare basi giuridiche, prova del consenso marketing facoltativo e separato, versione dell'informativa, timestamp, disiscrizione e tracciamento delle richieste. È necessaria una scelta documentata sui ruoli titolare/responsabile fra RMP Works e ciascun creator.
4. **Infrastruttura multi-tenant**: ogni `nomecreator.rmpworks.com` deve disporre di configurazione ShopShield e informativa specifica del titolare prima della pubblicazione; non riusare automaticamente lo Store ID `rmpworks.com` per tutti i creator. Validare esplicitamente se ShopShield supporta sottodomini e la separazione delle prove.
5. **Protezione server**: Turnstile/honeypot, rate limit, validazione e isolamento tenant sono controlli di sicurezza applicativi separati; non demandarli implicitamente al CMP.

## Checklist pre-attivazione sito principale
- [ ] Verificare che lo store `rmpworks.com` sia registrato e abilitato in ShopShield (non assumere che esista).
- [ ] Verificare il dominio e la versione servita da `https://cdn.shopshield.io/shield-uni.js`; nessun 404/CSP/errore e nessuna esecuzione di script facoltativi prima della scelta.
- [ ] Inventario dei cookie e tracker effettivi (inclusi Cloudflare e Stripe), classificazione e policy approvata.
- [ ] Verificare in browser reale: nessun consenso → blocco non necessari; rifiuto, accetta solo necessari, categorie granulari, revoca e preferenze persistenti.
- [ ] Verificare registro dei consensi e flusso DSAR con conservazione/cancellazione.
- [ ] Pubblicare informativa corretta per RMP Works e link di gestione preferenze.
- [ ] Validare che le funzionalità essenziali di login, OTP e checkout sandbox continuino a funzionare con consenso rifiutato.
- [ ] Solo dopo collaudo e approvazione, impostare `RMP_SHOPSHIELD_STORE_ID=rmpworks.com` per la build desiderata e ridistribuire.
- [ ] Rieseguire test regressione e browser privacy su build risultante.

## Test locali
```bash
node --experimental-strip-types --test tests/shopshield-root-config.test.mjs
```

## Gate di rilascio
Questa PR **non** sblocca l'issue #28. Senza sua approvazione finale, non attivare il renderer pubblico, i form lead dei creator, notifiche automatiche o incassi.
