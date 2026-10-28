import type { Metadata } from "next";
import ProjectDetail from "../_components/ProjectDetail";

export const metadata: Metadata = {
  title: "Regolario | Tu usa l'AI. Noi mettiamo in ordine la burocrazia.",
  description:
    "Tutta la formazione e la documentazione AI della tua azienda, finalmente organizzate. Con Regolario.",
  openGraph: {
    title: "Tu usa l'AI. Noi mettiamo in ordine la burocrazia.",
    description:
      "Formazione, attestati, registri e documentazione AI in un unico posto.",
  },
};

export default function RegolarioPage() {
  const assessmentHref = "https://regolario.com/assessment-gratuito?source=rmpworks&utm_source=rmpworks&utm_medium=website&utm_campaign=assessment_2026&utm_content=rmp_regolario_project";
  return (
    <ProjectDetail
      eyebrow="Progetto 01"
      name="Regolario"
      category="AI in azienda, senza scartoffie"
      headline="Tu usa l'AI. Noi mettiamo in ordine la burocrazia."
      description="Formazione, attestati, registri e documentazione: Regolario ti aiuta a gestire tutto in un unico posto, senza rincorrere fogli Excel, scadenze e documenti sparsi."
      accent="var(--rmp-purple)"
      status="Attivo"
      problem="Molte aziende usano già strumenti AI, ma senza una fotografia chiara degli usi reali, senza formazione per ruolo e senza documentazione ordinata."
      solution="Regolario aiuta a trasformare attività sparse in un percorso più semplice da seguire, rivedere e ritrovare quando serve."
      audience={[
        "PMI che devono strutturare l’uso dell’AI senza costruire un sistema interno da zero.",
        "Aziende che vogliono formare persone e ruoli diversi con un percorso leggibile e documentato.",
        "Organizzazioni che vogliono trasformare attività sparse in un fascicolo finale consultabile e aggiornabile.",
      ]}
      principles={[
        "Prima capire cosa viene già usato, poi decidere cosa formare e documentare.",
        "Formazione corta, per ruolo e collegata ai casi d’uso reali.",
        "Ogni passaggio deve lasciare una traccia verificabile: test, registri, attestati e policy.",
      ]}
      benefits={[
        { title: "Meno caccia al documento", copy: "Rendi più semplice ritrovare il percorso, le decisioni e ciò che è stato fatto." },
        { title: "Formazione che parte dalle persone", copy: "Affronta i bisogni reali di ruoli e attività, invece di aggiungere materiale indistinto." },
        { title: "Un prossimo passo leggibile", copy: "Parti da un assessment e trasforma il punto di partenza in attività da verificare insieme." },
      ]}
      steps={[
        { title: "Guardiamo il punto di partenza", copy: "Partiamo da come l'AI viene usata oggi, non da una checklist generica." },
        { title: "Mettiamo ordine", copy: "Organizziamo il lavoro su persone, indicazioni e documentazione in passaggi proporzionati." },
        { title: "Rivediamo quando serve", copy: "Il percorso resta comprensibile mentre cambiano persone, strumenti e utilizzi." },
      ]}
      actions={[
        { href: assessmentHref, label: "Fai l'assessment gratuito" },
        { href: "https://regolario.com/partners", label: "Proponi una partnership" },
      ]}
    />
  );
}
