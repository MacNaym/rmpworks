# RMP Creator Desk — rollout controllato

## Cosa viene introdotto
- `/creator`: accesso email OTP, wizard in 5 passaggi, dashboard privata.
- `/api/creator-auth`: OTP + verifica email + sessioni HttpOnly Secure SameSite=Lax.
- `/api/creator-profile`: API RLS con JWT dell'utente, nessun service-role token nel codice.
- `docs/creator-studio/supabase-creator-schema.sql`: schema isolato con RLS owner-only.

## Gate obbligatorio
**Non esiste ancora un Supabase RMP dedicato**. Non configurare questi endpoint su Regolario, Regolario staging, Mneme, ShopShield o altre app.
Creare un **nuovo progetto** nell'organizzazione scelta dall'utente, dopo aver verificato eventuali costi. L'utente deve accettare la spesa prima della creazione.

1. Applicare lo schema solo al nuovo progetto. Verificare policies con `get_advisors`, tentare letture cross-user e controllare gli accessi a `creator_orders`.
2. Cloudflare Pages → Production secrets: `RMP_SUPABASE_URL` (URL nuovo progetto) e `RMP_SUPABASE_PUBLISHABLE_KEY` (publishable / anon, **mai service-role**).
3. Configurare Auth Email nel progetto dedicato. Il template email deve contenere il codice OTP `{{ .Token }}`, non solamente un magic link. Predisporre SMTP dedicato verificato e rate limiting.
4. Effettuare un nuovo deploy Cloudflare dopo l'aggiunta dei valori.
5. Accesso sandbox: il backend consente OTP **solo** agli indirizzi email con un acquisto Founder sandbox `paid` già registrato nel database D1. Un visitatore senza acquisto non può creare account.
6. Verificare a mano l'accesso via codice, il rinnovo e la scadenza delle sessioni, il logout, il salvataggio profilo e l'isolamento tra due utenti.
7. Verificare preventivamente il sottodominio richiesto, prima del provisioning effettivo; il testo mostrato oggi è un desiderata, non un hostname allocato.

## Sicurezza e limiti prima del live
- Il flusso attuale è **sandbox-only**. Il webhook live, verifica checkout, membership e inviti dopo acquisto reali richiederanno un circuito separato.
- OTP rate limiting e protezione anti-abuso necessitano Cloudflare Turnstile o una policy equivalente prima di un'apertura pubblica.
- La registrazione e la visibilità sulla dashboard sono separate dal provisioning: **NON** rendere attivo un tenant leggendo semplicemente `creator_accounts.status`.
- Il database non contiene documenti fiscali né dati carte.
- Non inserire codici, chiavi, password o token nel repository. Cookies firmati da Supabase e verificati chiamando l'endpoint Supabase `auth/v1/user`.
- Il backend utilizza l'email verificata dal provider, non i metadata modificabili dall'utente, per l'accesso gated.
- La tabella `creator_orders` è read-only per utenti, i futuri ordini devono essere inseriti da un backend affidabile.
- Occorrono audit transazionali, policy legali, email transazionali, gestione rimborsi e chiusura condizioni commerciali prima degli incassi veri.

## QA minima
- Senza configurazione Supabase, la pagina deve mostrare chiaramente “in preparazione”, nessuna richiesta può salvare un creator.
- Con configurazione valida e pagamento test, richiedere OTP, verificare login, completare 5 step, riaprire dashboard.
- Tentare l'accesso come utente diverso: non deve mostrare il profilo di altri.
- Cambiare direttamente `owner_user_id` e `status` tramite REST con JWT authenticated: deve essere rifiutato.
- Tentare accesso senza pagamento test: OTP non inviato e profilo non accessibile.
- Testare login dopo scadenza di access token per verificare il refresh senza perdere sessione.

## Delega prossima
Solo dopo conferma costo e creazione del progetto: configurare variabili, migrazione, Auth Email, test end-to-end e aggiornare il redirect checkout/operazioni per il flusso live. Se il provider email non è pronto, non sbloccare vendita live.
