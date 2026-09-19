import ProjectDetail from "../_components/ProjectDetail";

export default function TapPage() {
  return (
    <ProjectDetail
      eyebrow="Progetto 03"
      name="Tap"
      category="Strumenti per attività locali"
      headline="Un gesto fisico. Una recensione in pochi secondi."
      description="Card, sticker e stand NFC + QR pensati per aiutare le attività locali a trasformare il momento giusto in una recensione o in un’azione digitale."
      accent="var(--rmp-orange)"
      status="In sviluppo"
      problem="Chiedere una recensione funziona solo se il cliente riesce a farla subito. Cercare il profilo, trovare il link corretto e ricordarsene dopo crea troppo attrito."
      solution="Tap porta il cliente direttamente all’azione con un gesto: avvicina il telefono oppure scansiona il QR e arriva alla destinazione già pronta."
      audience={[
        "Bar, negozi, studi e attività locali che vivono di reputazione e passaparola.",
        "Professionisti che vogliono rendere la richiesta di recensione naturale e immediata.",
        "Piccole attività che preferiscono uno strumento fisico semplice a un’altra piattaforma da imparare.",
      ]}
      principles={[
        "Il cliente deve capire cosa fare senza istruzioni.",
        "Il passaggio dal mondo fisico all’azione digitale deve richiedere pochi secondi.",
        "Hardware, QR e NFC devono restare semplici da personalizzare e replicare.",
      ]}
    />
  );
}
