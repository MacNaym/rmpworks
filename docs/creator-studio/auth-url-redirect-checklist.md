# RMP Creator Desk — Supabase Auth URL e OTP (21 novembre 2026)

## Sintomo
Una email Supabase mostrava un pulsante "Conferma email" che conduceva a `localhost`. Il progetto Supabase nuovo ha ereditato la Site URL di sviluppo.

## Impostazioni obbligatorie nel SOLO progetto `rmpworks`
Supabase project: `mxgwdnnpkywzhldyyrue` (account `okstyleshirts@gmail.com`).
Authentication → URL Configuration:
- Site URL: `https://rmpworks.com`
- Redirect URLs: `https://rmpworks.com/creator`
- Non aggiungere localhost alla allowlist di produzione.

Nel backend Cloudflare `/api/creator-auth` la richiesta a `/auth/v1/otp` include esplicitamente `redirect_to=https://rmpworks.com/creator`.

**Importante:** L'applicazione attuale usa **codici numerici OTP** digitati nel modulo e salva la sessione in cookie HttpOnly. Non implementa il login automatico dai magic link con token nella URL. Quindi non inserire nei template di login link cliccabili per autenticarsi; i link di verifica della prima registrazione possono condurre alla pagina Creator Desk ma l'utente deve ancora inserire il codice per la sessione.

Authentication → Emails → Templates → **Magic Link**: messaggio OTP con `{{ .Token }}`, senza `{{ .ConfirmationURL }}`.
Controllare anche il template **Confirm signup**, se l'invio della prima registrazione usa ancora un pulsante. Non cambiare la gestione di verifica email senza testare l'onboarding di un nuovo utente.

## Collaudo
1. Controllare Site URL e Redirect URLs nel dashboard Supabase.
2. Dopo nuovo deploy Cloudflare, richiedere OTP da `https://rmpworks.com/creator` usando la email già pagata in sandbox.
3. Verificare ricezione OTP e inserimento del codice (non cliccare eventuali link).
4. Verificare cookie di login, caricamento profilo, inserimento brief, logout e login successivo.
5. Riprovare un'iscrizione **nuova** tramite sandbox prima di dichiarare corretta la prima registrazione.
6. Non utilizzare la chiave service-role in frontend e non attivare incassi live.

Documentazione: https://supabase.com/docs/guides/auth/redirect-urls e https://supabase.com/docs/guides/auth/auth-email-passwordless.
