# B9A — Primi contratti di entitlement (bozza non integrata)

- `app/lib/creator-entitlements.ts` è un modulo puro, non collegato a checkout, API, database o UI: **nessun diritto reale viene ancora concesso**.
- Piani `free`, `pro`, `pro_plus`, con inclusione progressiva; Video Optimizer è Pro e può essere acquistato standalone.
- Abbonamento standalone `active`/`trialing` concede esclusivamente la feature acquistata, NON l'intero bundle.
- Per tutte le funzionalità non-core vige un ulteriore blocco `enabledFeatures`, esplicito, che impedisce abilitazioni per errore. In produzione la lista dovrà provenire da configurazione server trusted, mai dal client.
- I codici prodotto sono **identificatori logici**, NON prezzi e non `price_id` Stripe.
- La lista `pro_plus` contiene funzioni pianificate; nessuna suite analytics è stata effettivamente implementata o resa disponibile.
- Questo modello non implementa quote, relazioni tenant, RLS, scadenze, verifica webhook o anti-abuso. Perciò NON va usato come autorizzazione di endpoint senza completare B9A (enforcement lato DB) e B9B (billing).
- La prova gratuita Pro di 7 giorni sarà validata lato backend; `trialing` è qui solo un esempio di stato sottoscrizione, non una logica completa di trial.
- Prezzi aggiornati: **Pro lancio 5 € + IVA/mese o 50 € + IVA/anno**; **Pro standard 16,90 € + IVA/mese o 169 € + IVA/anno**; **Pro Plus target 29 € + IVA/mese**, soggetto a costi; standalone 5–10 € + IVA/mese per singolo strumento. Trial **7 giorni solo Pro**. Nessuna creazione Stripe.
- Restano vincolanti issue #28 (no live), #39 (prezzi e conflitti) e #42 (roadmap).

## Test
`node --experimental-strip-types --test tests/creator-entitlements.test.mjs`

## Completamento di B9A (ancora da fare)
Schema e transazioni quote atomiche, integrazione database del progetto confermato, test isolamento tenant, stato entitlement server-side da Stripe, auditing, reset quote, scadenze e backpressure dei tool costosi.

Questa PR è un primo contratto di codice per ridurre riscritture, non una release pronta.
