# B7.2/B7.3 — Mail e consegna delle risorse (contratti inattivi)

## Stato
Questo batch aggiunge componenti server-only, test e nessuna route pubblica. I moduli non sono importati da alcun handler in produzione.

- `functions/_lib/creator-confirmation-mail.ts`: modello testuale e HTML per conferma dell'indirizzo email, destinato ai lettori di un creator. Invia **solo** se `sendEnabled===true` e viene fornito esplicitamente un trasporto server-side. **Nessun provider è collegato; nessuna email inviata.**
- `functions/_lib/creator-resource-delivery.ts`: rendering HTML stampabile/scaricabile per `checklist` e `mini_guide` approvate. Richiede flag release, sito creator pubblicato, email verificata, permesso di download valido e corrispondenza esatta di creator e risorsa. `no-store`, `noindex`, HTML escaped e CSP sandbox.
- Test offline: 6 mail + 5 risorse = **11 casi preparati, non ancora eseguiti**. Separati dai 7 test della PR #51.

## Cosa non è ancora implementato
1. Invio email reale: non assumere un provider; per ora il progetto usa Hostinger per alcuni indirizzi di dominio, ma non abbiamo verificato che sia il servizio di invio transazionale con API. La connessione reale richiede una scelta verificata, DNS SPF/DKIM, credenziali solo lato server, rate limit, bounce/complaint monitoring e idempotenza.
2. Il vero `sendEnabled` non deve mai provenire dal client. In produzione restare OFF fino a staging e approvazione.
3. Emissione e consumo atomico dei token in Supabase, con scadenza verificata da `now()` nel database; la SQL di #51 è solo proposta e non è applicata. La conferma richiede un POST intenzionale, non un GET che i bot di posta potrebbero visitare.
4. Origine/host, isolamento dei tenant e magnetId devono essere risolti da dati attendibili del server. I booleani passati al renderer sono un **contratto** e non sostituiscono una query/decisione affidabile.
5. Il download reale richiede una concessione server-side a breve durata, legata a email verificata, creator, risorsa, scadenza e limite di utilizzi. Nessun URL pubblico permanente.
6. Le risorse già create nel Creator Studio sono colonne `format,title,subtitle,content,status` di `creator_lead_magnets`; i formati attuali sono `checklist` e `mini_guide`. Il vecchio endpoint di download rimane privato, vincolato al proprietario creator.
7. Privacy: informativa/versione, retention, accesso/cancellazione e gestione di ShopShield da parte del Capitano.

## Check di sicurezza
- Test negativi: assenza di switch, creator non pubblicato, email non verificata, grant revocato, creator A con magnet B, bozza non approvata, HTML aggressivo, provider fallito o disabilitato.
- Prima di unirli al prodotto pubblico, eseguire prove in staging usando servizi reali e utenti separati.
- Nessun database alterato, nessun server secret impostato e nessuna email reale inviata.
- Gate pubblico #28 sempre chiuso.

## Test locali
```powershell
node --experimental-strip-types --test tests/creator-confirmation-mail.test.mjs tests/creator-resource-delivery.test.mjs
```
