# CRM pilota: cancellazione e rilascio privato

- RMP Creator Studio **non è pronto per un lancio pubblico**: riferimento [Issue #28](https://github.com/MacNaym/rmpworks/issues/28).
- Aggiunta cancellazione volontaria per i soli record `source=preview_test`, tramite bottone nella pagina privata `/creator/leads`. È richiesta conferma esplicita; nessun record esistente viene cancellato durante deploy/migrazione.
- API DELETE `/api/creator-leads`: controlli Origin, OTP user, acquisto Stripe sandbox, proprietario creator, ID UUID; PostgREST usa JWT dell'owner e policy RLS dedicata. Il client non può cancellare record di altri creator né lead reali futuri.
- Il record cancellato **non sarà recuperabile dal CRM**; le politiche per eventuali copie di backup/log vanno definite prima del pubblico.
- Conservazione pilot: non è ancora automatizzata; documentare una durata massima, policy di cleanup autorizzata, esportazione e richieste degli interessati prima di accettare lead reali.
- Consensi: la checkbox attuale riguarda **solo l'utilizzo di dati per collaudi**. Non è consenso marketing; non va riutilizzata come tale nel prodotto pubblico.
- Per il futuro: distinguere privacy notice, richiesta lead magnet, iscrizione newsletter **opzionale e non preselezionata**, timestamp e versione informativa; double opt-in e tracciabilità; gestione disiscrizione, cancellazione e export su richiesta; test antispam e limiti di richiesta.
- Non attivare route anonime, Turnstile pubblico, invii, newsletter o checkout live senza appositi test e approvazione.
