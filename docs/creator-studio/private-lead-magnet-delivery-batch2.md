# Batch 2: Consegna privata risorsa gratuita (pilota)

## Percorso
1. Accedi al Creator Desk (ordine Stripe SANDBOX).
2. Approva una checklist/mini-guida nel Lead Magnet Studio.
3. In `/creator/preview`, scorri al modulo di prova: scegli una risorsa approvata ed effettua una registrazione con indirizzo di prova autorizzato.
4. Solo dopo il POST del contatto il form mostra un link di download.
5. Il link chiama `/api/creator-lead-magnet-download?id=...`, che richiede login creator, ordine sandbox, profilo owner e documento approvato dello stesso creator. Risposta HTML in modalità download, stampabile in PDF dal browser.
6. Il contatto compare in `/creator/leads`.

## Sicurezza e limiti
- Solo sessioni creator autorizzate; link non condivisibile con utenti anonimi.
- Tutti i campi del documento vengono sottoposti a escaping prima di essere inseriti in HTML; no script, Content Security Policy sandbox, no-store e noindex.
- Non è una consegna PDF server-side e non costituisce prova della ricezione da parte di un fan.
- Non è ancora un flusso pubblico; nessuna email o download anonimo.
- Nessuna pubblicazione, checkout Live o cambio stato creator.
- Da fare per il live: upload/versioni dell'asset PDF, URL a scadenza, conferma email dove applicabile, controllo accessi per cliente finale, GDPR, antispam, rate limiting e test isolamenti multi-account.
