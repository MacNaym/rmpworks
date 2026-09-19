import Link from "next/link";

const projects = [
  {
    index: "01",
    name: "Regolario",
    category: "AI Literacy",
    status: "Attivo",
    color: "var(--rmp-purple)",
    description:
      "Formazione, assessment e documentazione per rendere l’AI literacy concreta, verificabile e utilizzabile nelle PMI.",
    href: "/projects/regolario",
  },
  {
    index: "02",
    name: "ShopShield",
    category: "Compliance e-commerce",
    status: "Attivo",
    color: "var(--rmp-green)",
    description:
      "Uno strato di compliance essenziale per piccoli business online: semplice da installare, leggero da gestire.",
    href: "/projects/shopshield",
  },
  {
    index: "03",
    name: "Tap",
    category: "Strumenti per attività locali",
    status: "In sviluppo",
    color: "var(--rmp-orange)",
    description:
      "NFC e QR per trasformare un’interazione fisica con il cliente in recensioni e azioni digitali utili in pochi secondi.",
    href: "/projects/tap",
  },
];

const frame =
  "mx-auto w-full max-w-[1680px] px-5 sm:px-8 lg:px-12 xl:px-16";

function BrandMark() {
  return (
    <span className="inline-flex h-7 items-end gap-1" aria-hidden>
      <span className="h-3 w-3 -skew-x-12 bg-[var(--rmp-purple)]" />
      <span className="h-5 w-3 -skew-x-12 bg-[var(--rmp-green)]" />
      <span className="h-7 w-3 -skew-x-12 bg-[var(--rmp-orange)]" />
    </span>
  );
}

export default function ProjectsPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--line)]">
        <div className={`${frame} flex items-center justify-between py-5`}>
          <Link
            href="/"
            className="flex items-center gap-3 text-base font-bold tracking-[-0.03em]"
          >
            <BrandMark />
            <span>RMP WORKS</span>
          </Link>

          <nav className="flex items-center gap-5 text-sm text-[var(--muted)] sm:gap-8">
            <Link className="text-[var(--foreground)]" href="/projects">
              Progetti
            </Link>
            <Link
              className="transition hover:text-[var(--rmp-purple)]"
              href="/about"
            >
              Chi siamo
            </Link>
            <Link
              className="transition hover:text-[var(--rmp-purple)]"
              href="/contact"
            >
              Contatti
            </Link>
          </nav>
        </div>
      </header>

      <section className={`${frame} py-16 sm:py-24 lg:py-28`}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          Progetti
        </p>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:items-end">
          <h1 className="max-w-6xl text-[clamp(4rem,8vw,9rem)] font-semibold leading-[0.86] tracking-[-0.075em] lg:col-span-9">
            Prodotti costruiti
            <br />
            per <span className="text-[var(--rmp-orange)]">servire davvero.</span>
          </h1>

          <p className="max-w-md text-lg leading-8 text-[var(--muted)] lg:col-span-3">
            Software, strumenti e piccoli business nati da problemi concreti,
            con una preferenza netta per semplicità, velocità e utilità.
          </p>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[#101010] text-[#f4f1ea]">
        <div className={`${frame} py-14 sm:py-20`}>
          <div className="border-t border-white/20">
            {projects.map((project) => (
              <Link
                key={project.name}
                href={project.href}
                className="group grid gap-6 border-b border-white/20 py-10 transition hover:border-white/55 md:grid-cols-12 md:items-start"
              >
                <span
                  className="font-mono text-xs md:col-span-1"
                  style={{ color: project.color }}
                >
                  {project.index}
                </span>

                <div className="md:col-span-3">
                  <h2 className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                    {project.name}
                  </h2>
                  <p className="mt-2 text-sm text-white/50">
                    {project.category}
                  </p>
                </div>

                <p className="max-w-3xl text-base leading-7 text-white/70 md:col-span-5">
                  {project.description}
                </p>

                <div className="flex items-center justify-between gap-4 md:col-span-3 md:justify-end">
                  <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/55">
                    {project.status}
                  </span>
                  <span className="text-2xl transition-all group-hover:translate-x-1 group-hover:text-[var(--rmp-purple)]">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className={`${frame} py-20 sm:py-28`}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          Criterio
        </p>
        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          <h2 className="max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:col-span-8 lg:text-7xl">
            Non lanciamo idee.
            <br />
            <span className="text-[var(--rmp-green)]">
              Costruiamo cose utili.
            </span>
          </h2>

          <div className="space-y-5 text-lg leading-8 text-[var(--muted)] lg:col-span-4">
            <p>
              Ogni progetto deve risolvere un problema leggibile, arrivare
              rapidamente davanti a persone reali e poter migliorare dai dati.
            </p>
            <p>
              Se la complessità non crea valore, la togliamo.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[var(--rmp-orange-panel)] text-[#101010]">
        <div className={`${frame} py-16 sm:py-20`}>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[var(--rmp-purple)]" />
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-black/55">
              RMP Works
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-8 border-t border-black/25 pt-8 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-5xl text-[clamp(3rem,6vw,6rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
              Hai qualcosa che vale
              <br />
              la pena costruire?
            </h2>

            <Link
              href="/contact"
              className="inline-flex w-fit rounded-full bg-[#101010] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--rmp-purple)]"
            >
              Parliamone →
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#101010] text-white">
        <div
          className={`${frame} flex flex-col gap-8 py-10 md:flex-row md:items-end md:justify-between`}
        >
          <div>
            <div className="flex items-center gap-3">
              <BrandMark />
              <p className="text-lg font-semibold tracking-[-0.03em]">
                RMP WORKS
              </p>
            </div>
            <p className="mt-2 text-sm text-white/45">© 2026 RMP Works</p>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/60">
            <Link className="hover:text-[var(--rmp-purple)]" href="/">
              Home
            </Link>
            <Link className="hover:text-[var(--rmp-purple)]" href="/about">
              Chi siamo
            </Link>
            <Link className="hover:text-[var(--rmp-purple)]" href="/contact">
              Contatti
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
