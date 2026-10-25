# COM-MKT-02 — Regolario Public Presence

**Stato:** proposta e implementazione isolate nel repository RMP Works; nessun deploy o pubblicazione LinkedIn eseguiti.
**Dottrina:** “Impossibile da ignorare. Facilissimo da capire.”
**Messaggio centrale:** “Usi l'AI in azienda? Alle scartoffie ci pensa Regolario.”

## Audit prima/dopo

| Superficie | Prima | Dopo proposto/implementato | Evidenza |
| --- | --- | --- | --- |
| RMP Works home | hero generico “Costruiamo cose che funzionano” | hero Regolario orientato al lavoro burocratico, con CTA assessment e pagina progetto | `app/page.tsx` |
| RMP Works /projects/regolario | elenco di feature e headline tecnica | beneficio in apertura, 3 benefici, 3 passaggi, CTA assessment e partnership | `app/projects/regolario/page.tsx`; `ProjectDetail.tsx` |
| Metadata RMP | descrizione inglese generica; nessun Open Graph pagina Regolario | title, description e Open Graph italiani coerenti | `app/layout.tsx`; pagine pubbliche |
| Regolario.com | assessment e partner URL verificati HTTP 200 | nessuna modifica in questo checkpoint | audit read-only |
| luigipesante.com | sito personale mantiene tono ironico; link `/caproni` HTTP 200 | sorgente non presente nei checkout accessibili; handoff pronto | audit HTTP read-only |
| luigipesante.com/articoli | link dalla home HTTP 404 | difetto documentato, non corretto senza repository sorgente | audit HTTP read-only |

## CTA confermate

- Assessment: `https://regolario.com/assessment-gratuito` — HTTP 200 verificato.
- Partnership: `https://regolario.com/partners` — HTTP 200 verificato.
- Conversazione RMP: `https://rmpworks.com/contact` — HTTP 200 verificato.

Non è stata rilevata una pagina demo pubblica distinta: il sito non dichiara una CTA “demo” come disponibile. Il copy usa quindi assessment, partnership o contatto, senza trasformare “parliamone” in una promessa di demo.

## Handoff sito personale

Il repository sorgente di `luigipesante.com` non è tra quelli accessibili. Quando sarà fornito un checkout autorizzato, applicare soltanto:

1. nella home, sotto **RMP Works**, una card “Regolario” con copy: “Usi l'AI in azienda? Alle scartoffie ci pensa Regolario. Un progetto RMP Works per rendere più semplice il lavoro organizzativo che accompagna l'AI.” e link a `https://rmpworks.com/projects/regolario`;
2. lasciare invariato il tono personale e ironico; non trasformare la home in una landing RMP;
3. correggere il link **Articoli** affinché punti a una route reale oppure rimuoverlo finché la route non esiste;
4. mantenere `/caproni`, verificato HTTP 200, senza modifiche editoriali non necessarie.

## LinkedIn — pronti per review, nessuna pubblicazione

### Headline professionale

**Builder e founder di RMP Works | Creo prodotti che rendono più semplice il lavoro complicato | Regolario: AI in azienda, senza scartoffie**

### Informazioni

Costruisco prodotti, software e piccole attività che cercano di togliere un po' di attrito dal lavoro vero.

In questo periodo lavoro su Regolario. L'idea è semplice: molte aziende usano già l'AI; poi qualcuno deve capire chi la usa, cosa serve alle persone e dove sono finite decisioni e documenti. Di solito quel qualcuno ha già abbastanza lavoro.

Regolario è il tentativo di rendere questa parte più ordinata e meno teatrale. Non promette scorciatoie legali o badge miracolosi: parte dal caso concreto e prova a trasformarlo in un percorso che le persone possano davvero seguire.

Mi interessano prodotti chiari, automazione utile e conversazioni con imprenditori, professionisti, creator e associazioni che vogliono parlare dell'AI senza fingere che tutto sia semplice.

### In primo piano — descrizione Regolario

**Usi l'AI in azienda? Alle scartoffie ci pensa Regolario.**
Un progetto RMP Works per rendere più semplice il lavoro di formazione, organizzazione e documentazione che accompagna l'uso dell'AI. Parti dall'assessment: https://regolario.com/assessment-gratuito

### Post 1 — Nascita di Regolario

Usi l'AI, ma alla burocrazia che si porta dietro chi ci pensa?

Avevo lo stesso problema anch'io. L'AI poteva aiutarmi a lavorare meglio, ma intorno comparivano note sparse, formazione da ricordare, decisioni da ritrovare e quella sensazione rassicurante che qualcuno avrebbe ricostruito tutto “più avanti”.

Quel qualcuno, a quanto pare, ero io.

Per questo ho creato Regolario: per rendere più semplice tenere in ordine formazione, organizzazione e documentazione legate all'uso dell'AI.

Non è una bacchetta magica. È un modo per smettere di lasciare il lavoro invisibile sul tavolo di qualcun altro.

Se vuoi capire il punto di partenza della tua azienda, c'è un assessment esplorativo: https://regolario.com/assessment-gratuito

### Post 2 — Le cinque domande

Prima di dire “siamo a posto con l'AI”, provo con cinque domande molto poco glamour:

1. Chi la usa davvero?
2. Per fare cosa?
3. Chi ha ricevuto indicazioni?
4. Dove sono le decisioni importanti?
5. Chi ricontrolla tutto fra qualche mese?

Non sono una sentenza e non sono una checklist legale. Sono un modo rapido per vedere quanto lavoro è già finito dietro i mobili.

Regolario nasce per aiutare a rimetterlo in ordine, una domanda alla volta.

### Post 3 — Per imprenditori

Il paradosso dell'AI in azienda è questo: la usi per risparmiare tempo, poi scopri che hai creato un nuovo lavoro da organizzare.

Non serve farsi prendere dal panico. Serve smettere di fingere che il problema si risolva con una cartella chiamata “AI definitivo v7”.

Si parte da un uso concreto, dalle persone coinvolte e da una traccia che puoi ritrovare. Il resto viene dopo, con calma e criterio.

### Post 4 — Per consulenti e associazioni

Quando un cliente chiede “come usiamo bene l'AI?”, raramente sta chiedendo un'altra presentazione da 86 slide.

Di solito vuole un percorso comprensibile: capire il punto di partenza, coinvolgere le persone, mettere in fila le decisioni e non dover ricostruire tutto da zero ogni volta.

Regolario è una proposta da valutare in quella conversazione. Non sostituisce il giudizio del professionista; prova a rendere più facile il lavoro che lo circonda.

Per una presentazione partnership: https://regolario.com/partners

### Post 5 — Per creator

Un buon contenuto sull'AI crea entusiasmo. Poi, molto giustamente, qualcuno chiede: “bello, ma come lo portiamo in azienda senza fare casino?”.

È la domanda che mi interessa.

Regolario vuole essere il passo pratico dopo l'ispirazione: non per sostituire chi crea contenuti, ma per aiutare le aziende a organizzare quello che decidono di fare.

Se parli di AI a una community di professionisti o imprese, parliamone: https://regolario.com/partners

## Checklist pre-pubblicazione

- [ ] Claim prodotto verificato dall'owner della demo.
- [ ] CTA ancora HTTP 200 e coerente con il contenuto.
- [ ] Nessun claim di conformità, sanzione, risparmio o risultato non dimostrato.
- [ ] Contenuto approvato dal Captain.
- [ ] Canale, data e versione annotati manualmente.
- [ ] Nessuna pubblicazione automatica o comunicazione outbound attivata.
