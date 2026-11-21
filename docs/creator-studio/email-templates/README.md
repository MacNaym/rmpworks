# RMP Works — pacchetto 13 email Supabase Auth

**Project**: `mxgwdnnpkywzhldyyrue`, account `okstyleshirts@gmail.com`.

Template coerenti con l'area Creator Desk: caratteri ad alta leggibilità, grafite/nero, rosso accento, italiano, niente link localhost, niente immagini remote (compatibili con la maggior parte dei client email).

## Uso dei template e priorità

| Ordine | Template Supabase | File | Oggetto | Usato oggi? |
|---|---|---|---|---|
| 01 | Confirm signup | [01-confirm-signup.html](./01-confirm-signup.html) | RMP Works | Conferma il tuo indirizzo email | **Sì: OTP email** |
| 02 | Magic link / OTP | [02-magic-link.html](./02-magic-link.html) | RMP Works | Il tuo codice di accesso | **Sì: OTP email** |
| 03 | Invite user | [03-invite-user.html](./03-invite-user.html) | RMP Works | Il tuo invito | **Non attivato nel flusso Creator Desk attuale** |
| 04 | Change email address | [04-change-email.html](./04-change-email.html) | RMP Works | Conferma il cambio email | **Non attivato nel flusso Creator Desk attuale** |
| 05 | Reset password | [05-reset-password.html](./05-reset-password.html) | RMP Works | Reimposta la password | **Non attivato nel flusso Creator Desk attuale** |
| 06 | Reauthentication | [06-reauthentication.html](./06-reauthentication.html) | RMP Works | Verifica di sicurezza | Futuro: reauthentication |
| 07 | Password changed notification | [07-password-changed.html](./07-password-changed.html) | RMP Works | Password modificata | **Non attivato nel flusso Creator Desk attuale** |
| 08 | Email address changed notification | [08-email-address-changed.html](./08-email-address-changed.html) | RMP Works | Indirizzo email modificato | **Non attivato nel flusso Creator Desk attuale** |
| 09 | Phone number changed notification | [09-phone-number-changed.html](./09-phone-number-changed.html) | RMP Works | Numero di telefono modificato | **Non attivato nel flusso Creator Desk attuale** |
| 10 | Sign-in method linked notification | [10-signin-method-linked.html](./10-signin-method-linked.html) | RMP Works | Nuovo metodo di accesso collegato | **Non attivato nel flusso Creator Desk attuale** |
| 11 | Sign-in method removed notification | [11-signin-method-removed.html](./11-signin-method-removed.html) | RMP Works | Metodo di accesso rimosso | **Non attivato nel flusso Creator Desk attuale** |
| 12 | Verification method added notification | [12-verification-method-added.html](./12-verification-method-added.html) | RMP Works | Nuovo metodo di verifica | **Non attivato nel flusso Creator Desk attuale** |
| 13 | Verification method removed notification | [13-verification-method-removed.html](./13-verification-method-removed.html) | RMP Works | Metodo di verifica rimosso | **Non attivato nel flusso Creator Desk attuale** |

### Come applicare in Supabase
1. Supabase → Authentication → Email Templates → scegliere la tipologia corrispondente.
2. **Subject:** copiare dalla colonna Oggetto.
3. **Body:** copiare l'HTML completo dal file omonimo.
4. Salvare e, prima dell'uso reale, provare il caso specifico. Non cliccare link di reset/invito se l'app non ha ancora una pagina che gestisca quel flusso.
5. Nella sezione **Security and Protection / Security Notifications**, attivare individualmente solo le notifiche effettivamente supportate; disponibilità dipendente da impostazioni/piano Supabase.

### Avvertenze funzionali
- **Confirm signup** e **Magic link/OTP** usano `{{ .Token }}` e rinviano esplicitamente alla pagina `https://rmpworks.com/creator`. L'API Cloudflare verifica il codice e crea cookie HttpOnly.
- **Reauthentication** usa `{{ .Token }}` ma il Creator Desk non include ancora una schermata per un secondo fattore; non attivarla senza interfaccia.
- **Invite user**, **Change email address**, **Reset password** usano il link Supabase `{{ .ConfirmationURL }}`; sono template **preparati ma non collaudati**. In particolare, **il Creator Desk non gestisce ancora sessioni da link, recovery o inviti**: non bisogna considerarli flussi funzionanti finché non sono sviluppati e provati.
- Security Notifications: solo informazione, nessun link che richieda credenziali.
- L'attuale indirizzo `noreply@rmpworks.com` è la sola casella attiva. La dicitura nel footer per segnalare eventi si appoggia temporaneamente alla stessa casella; verificare la gestione della posta in ingresso e sostituire con `support@rmpworks.com` appena operativa.
- Modifiche al codice e a questi file **non modificano automaticamente le email già salvate nel Dashboard Supabase**: occorre applicarle nel pannello o usare una Management API autenticata dell'account, attualmente non collegata per la configurazione Auth.
- Il progetto sandbox Stripe è il solo abilitato. Non attivare pagamenti live in questa fase.

Documentazione: https://supabase.com/docs/guides/auth/auth-email-templates
