# RMP Creator Studio — B2/B3: raccolta richieste e demo

**Ambiente:** Cloudflare Pages static Next.js + Pages Functions `POST /api/founder` + D1 database `rmpworks-creator-leads` (giurisdizione UE).

## Registrazione lead
Campi: `name`, `email`, `channel_url`, `note` (opzionale), `marketing_opt_in` (facoltativo), `consent_privacy_at`, `created_at`, `status`. Non esiste un endpoint pubblico di lettura. `GET /api/founder` risponde 405. `Origin` deve coincidere con l'origine della pagina e c'è un honeypot semplice; implementare Turnstile/rate limit come hardening.

## Come leggere le richieste
Cloudflare → Workers & Pages → D1 → `rmpworks-creator-leads` → Console. Query:
```sql
SELECT id, created_at, name, email, channel_url, note, marketing_opt_in, status
FROM founder_leads ORDER BY created_at DESC LIMIT 50;
```
Per contrassegnare una richiesta:
```sql
UPDATE founder_leads SET status='contacted', updated_at=CURRENT_TIMESTAMP WHERE id='ID_DA_VERIFICARE';
```
Query conteggio:
```sql
SELECT status, COUNT(*) FROM founder_leads GROUP BY status;
```
Non pubblicare i lead, non inviare a log o analytics, non condividere con gli altri progetti.

## Informativa e operatività
- Il modulo rimanda a `/privacy`. Verificare con il titolare la denominazione legale, gli identificativi/indirizzi, la modalità di esercizio dei diritti, le nomine e la policy GDPR prima di considerare la privacy definitiva.
- Mancano conferma email automatica, alert nuovi lead, anti-spam Turnstile, cancellazione/retention automatica e dashboard commerciale con accesso autenticato.
- Marketing facoltativo e separato. Nessuna email promozionale automatica in questa release.
- La richiesta non crea ordini, pagamenti, prenotazioni o obbligazioni.
- Per il workflow commerciale: new → qualified → contacted → proposal → won/lost. Aggiornare manualmente e non mandare email senza consenso o altra base giuridica.

## Stato Stripe
La sola connessione Stripe verificata nell'ambiente è sandbox `I Caproni sandbox`; non è autorizzata ad incassare per RMP Works. Nessun checkout collegato. B2 **parziale**, non completo.

## Demo B3
`/demo`: creator fotografico fittizio, quiz locale interattivo senza raccolta dati, scala prodotti 0/9/49/249 euro solo illustrativa. Niente pagamento, auth o subdomini wildcard. B3 **dimostrazione statica**, non provisioning multi-tenant.

## Test dopo il deploy
1. `/contact` apre il modulo senza errori; `/privacy` e `/demo` rispondono.
2. Un invio sintetico tramite browser crea una sola riga in D1; rimuoverla a test concluso.
3. `GET /api/founder` = 405; origin differente = 403; input non valido = 400.
4. Verificare che Cloudflare Pages gestisca la `functions/` directory e la binding `RMP_LEADS` sia presente sia in preview sia in production.
5. Non pubblicare il form come “pronto” finché non passano i test end-to-end.

## Batch successivi
- B2 completamento: account Stripe RMP, test mode, checkout 50 € + IVA verificata, webhook firmato, gestione ordine e condizioni.
- B3: routing dinamico reale su Workers/Pages, wildcard DNS/TLS, 2 tenant isolati.
- B4: download protetti, catalogo, pagamenti per follower e report.
