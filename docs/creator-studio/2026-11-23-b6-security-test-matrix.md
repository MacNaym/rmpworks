# B6 — CRM privato: test sicurezza di base (nessuna attivazione pubblica)

## Stato
- Test statici/offline contro gli helper esistenti di `functions/_lib/creator-auth.ts`.
- Non modifica routing, Auth, database, Cloudflare, Stripe, ShopShield o permessi; non apre i form pubblici.
- Preparazione del collaudo manuale del Capitano al PC.

## Eseguire senza consumare GitHub Actions
```powershell
node --version
node --experimental-strip-types --test tests/creator-private-form-hardening.test.mjs
```

## Aspetti da affrontare prima del vero B6 pubblico
- [ ] Nuovo endpoint pubblico separato dall'endpoint `/api/creator-leads` riservato a creator autenticati. L'endpoint privato oggi richiede owner/test buyer: non eliminare questo controllo.
- [ ] Turnstile server-side con token a consumo e verifica hostname/action; eventuale honeypot accessibile.
- [ ] Rate limiting per IP/tenant/finestra e limite invii; valutare privacy e protezione proxy.
- [ ] CSRF/origin policy per tutte le mutation autenticate; evitare fiducia in origin forniti da client senza verifiche.
- [ ] Deduplica/inserimento atomico, validazione input, sanitizzazione, anti-enumeration e messaggi d'errore uniformi.
- [ ] Prova del consenso separato per finalità: richiesta risorsa e marketing; informativa/versione/retention/DSAR tramite ShopShield dove supportato.
- [ ] Isolamento RLS tenant A e B e rate-limits con test negativi.
- [ ] Evitare invio di contatti/email pubbliche o azioni live fino al superamento gate #28.
- [ ] Audit del caricamento/rigetto del banner ShopShield: attività manuale del Capitano.

## Risultato atteso
I 5 test controllano origin mismatch, email, configurazione Supabase, flag dei cookie e cache headers. Non certificano l'intero sistema antiabuso; sono una baseline.
