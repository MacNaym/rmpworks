# Lead magnet — anteprima privata (test)

Stato: modulo di raccolta lead **solo nel preview autenticato**, `/creator/preview`. Non è un modulo pubblico.

## Cosa è operativo
- Form nel preview con email e nome facoltativo e conferma esplicita del test.
- Invio a `/api/creator-leads` con cookie del creator; il backend controlla Stripe sandbox buyer e account owner, usando JWT Supabase e RLS.
- Inserimento della fonte `preview_test` e fase `new` nella tabella `creator_leads`.
- Link per controllare il contatto nel `/creator/leads`.

## Limiti intenzionali
- Non esiste iscrizione pubblica al creator e non è attivo il sottodominio personalizzato.
- Non vengono inviate email né consegnate risorse gratuite.
- Non è raccolto un consenso marketing; i dati sono esclusivamente per collaudi autorizzati.
- L'inserimento dello stesso indirizzo per lo stesso creator restituisce un conflitto gestito.
- Il backend di acquisizione pubblica non è ancora attivo. Prima di aprirlo servono: informativa e base giuridica definite, testo di consenso separato, limitazione abusi/rate limiting, Captcha/Turnstile server-side, anti-bot, policy di retention/cancellazione, double opt-in dove applicabile, protezione contro enumeration e pipeline di consegna risorsa, attivazione creator e verifica delivery.

## Test manuale
1. Accedere al Creator Desk con il buyer sandbox già verificato.
2. Aprire `/creator/preview`.
3. Inserire una email di test controllata e confermare l'utilizzo privato.
4. Inviare e aprire il CRM dal link. Verificare fonte `Test privato` e stato `Nuovo`.
5. Cambiare stato nel CRM, riaprire e verificare persistenza.
6. Visitare le API senza autenticazione: lettura e scrittura devono essere negate.
