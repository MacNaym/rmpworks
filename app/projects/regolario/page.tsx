import type { Metadata } from "next";
import ProjectDetail from "../_components/ProjectDetail";

export const metadata: Metadata = {
  title: "Regolario | L'AI in azienda? Alle scartoffie ci pensa Regolario.",
  description:
    "Regolario semplifica formazione, organizzazione e documentazione legate all'uso dell'AI in azienda. Scopri l'assessment gratuito o la proposta partnership.",
  openGraph: {
    title: "L'AI in azienda? Alle scartoffie ci pensa Regolario.",
    description:
      "Un percorso semplice per organizzare il lavoro che accompagna l'uso dell'AI in azienda.",
  },
};

export default function RegolarioPage() {
  const assessmentHref = "https://regolario.com/assessment-gratuito?source=rmpworks&utm_source=rmpworks&utm_medium=website&utm_campaign=assessment_2026&utm_content=rmp_regolario_project";
  return (
    <ProjectDetail
      eyebrow="Progetto 01"
      name="Regolario"
      category="AI in azienda, senza scartoffie"
      headline="Usi l'AI in azienda? Alle scartoffie ci pensa Regolario."
      description="Regolario è pensato per semplificare formazione, organizzazione e documentazione legate all'uso dell'AI, senza aggiungere un altro progetto da gestire."
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
