import ProjectDetail from "../_components/ProjectDetail";

export default function ShopShieldPage() {
  return (
    <ProjectDetail
      eyebrow="Progetto 02"
      name="ShopShield"
      category="Compliance e-commerce"
      headline="La compliance essenziale, senza il peso enterprise."
      description="Uno strato semplice per gestire gli elementi fondamentali della compliance di piccoli ecommerce e siti online, senza trasformarli in un progetto infinito."
      accent="var(--rmp-green)"
      status="Attivo"
      problem="Per piccoli ecommerce e attività online la compliance viene spesso trattata come un insieme di plugin, banner e procedure scollegate, difficili da mantenere nel tempo."
      solution="ShopShield concentra le funzioni essenziali in un prodotto leggero, con installazione semplice e un modello pensato per piccoli business e agenzie."
      audience={[
        "Ecommerce e siti di piccole dimensioni che vogliono una base di compliance chiara e gestibile.",
        "Solopreneur e micro-imprese che non hanno un reparto legale o tecnico dedicato.",
        "Agenzie che vogliono gestire più clienti con una soluzione ripetibile e prevedibile.",
      ]}
      principles={[
        "Ridurre il numero di strumenti e configurazioni necessarie per ottenere il risultato.",
        "Tenere il prodotto comprensibile anche per chi non vive di compliance.",
        "Separare ciò che è essenziale da ciò che appartiene a prodotti o servizi specialistici.",
      ]}
      externalHref="https://shopshield.io"
      externalLabel="Visita ShopShield"
    />
  );
}
