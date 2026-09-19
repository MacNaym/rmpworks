import ProjectDetail from "../_components/ProjectDetail";

export default function RegolarioPage() {
  return (
    <ProjectDetail
      eyebrow="Progetto 01"
      name="Regolario"
      category="AI Literacy"
      headline="AI literacy verificata, documentata e utilizzabile."
      description="Una piattaforma per PMI italiane che trasforma l’AI literacy in un percorso concreto: assessment, formazione, test, registri e documentazione."
      accent="var(--rmp-purple)"
      status="Attivo"
      problem="Molte aziende usano già strumenti AI, ma senza una fotografia chiara degli usi reali, senza formazione per ruolo e senza documentazione ordinata."
      solution="Regolario riunisce assessment, inventario AI, formazione, test, attestati, registri e policy in un unico percorso verificabile."
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
      externalHref="https://regolario.com"
      externalLabel="Visita Regolario"
    />
  );
}
