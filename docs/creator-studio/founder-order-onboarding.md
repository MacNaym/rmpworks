# Founder — ordine verificato e onboarding di prova

**Ambiente:** soltanto Stripe RMPWorks sandbox. I pagamenti reali non sono abilitati.

## Flusso
1. Checkout test completa un acquisto e reindirizza a `/creator-studio/thank-you?session_id=cs_test_...`.
2. `/api/founder-order` consulta il registro D1 degli ordini che il webhook Stripe ha autenticato. Non chiama Stripe dal browser e non espone email o dettagli personali. Stati: processing, pending, paid, failed, expired, invalid, unavailable. L'identificativo di sessione è opaco e va trattato come un token.
3. Solo con stato `paid` la pagina rende visibile un questionario di onboarding dimostrativo. `POST /api/founder-onboarding` verifica **ancora sul server** che l'ordine sia pagato nella sandbox, che il Payment Link sia quello Founder e che l'email corrisponda a quella del checkout.
4. Il questionario viene salvato una sola volta nella tabella `founder_onboarding`. Non invia comunicazioni e non attiva automaticamente servizi.
5. Tutte le risposte sono per uso di prova: non inserire dati sensibili.

## D1 — tabelle
- founder_orders: dati essenziali di ordine da evento webhook verificato;
- stripe_webhook_events: deduplicazione per ID evento;
- founder_onboarding: questionari dimostrativi relativi a sessioni test;
- founder_leads: richieste pubbliche pre-acquisto.

## Verifiche
- Con `session_id` inesistente, la pagina deve mostrare uno stato non confermato e non offrire l'onboarding.
- Con una sessione test già pagata e presente in D1, `/api/founder-order` deve restituire paid e importi; il form deve apparire.
- Un onboarding con email diversa da quella del checkout deve restituire 403.
- Un secondo onboarding con lo stesso ID deve restituire 409.
- Non trattare un redirect, parametri URL o un successo frontend come prova dell'acquisto.
- Gli eventi live devono essere ignorati dall'attuale webhook sandbox.

## Prima della produzione
- Autenticazione vera del creator (link magico o account), non soltanto session_id e email.
- Condizioni contrattuali e tempi di consegna; privacy dell'onboarding da aggiornare e verificare.
- Integrazione email transazionale con dominio verificato, consenso/tempi di conservazione appropriati, handling rimborsi.
- Stripe **live**: prodotto/prezzi corretti, tassazione confermata, webhook live con segreto separato.
- Prima di aprire gli acquisti, collaudare charge, webhook, ordine, onboarding, notifiche, rimborso e storno.
