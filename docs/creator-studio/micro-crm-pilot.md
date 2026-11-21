# Micro-CRM pilota per Creator Studio

- Progetto Supabase: `rmpworks`, ref `mxgwdnnpkywzhldyyrue` (indipendente dagli altri).
- `/creator/leads`: area privata sotto cookie OTP, solo owner del brief con ordine Stripe sandbox verificato.
- `/api/creator-leads`: GET max 100 contatti, POST test con consenso espresso, PATCH solo stato; tutte le query usano il JWT del creator (nessuna service role) e le policy RLS del database.
- Stadi: nuovo, contattato, qualificato, convertito, archiviato.
- `creator_leads` distingue source `preview_test` da futuri eventi `public_lead_magnet` e `quiz`. Al momento solo `preview_test` può essere inserito dagli utenti.
- **Nessuna iscrizione pubblica, nessun invio di messaggi, nessuna vendita e nessun sottodominio attivo**: questo CRM è un collaudo manuale privato.
- Privacy: inserire solo indirizzi controllati o legittimamente autorizzati, non usare dati personali reali di terzi senza base giuridica. Prima di pubblicare i moduli: informativa e base giuridica specifica, esplicita scelta newsletter separata, gestione esercizio diritti, retention, antispam, rate limit e consenso verificabile.
- Da fare: collegare form pubblico del lead magnet quando il creator è approvato; introduzione privacy e doppio opt-in; consegna risorsa digitale; automatismi notifiche; CRM con ricerca/filtri/paginazione; esportazione privacy e cancellazione.
