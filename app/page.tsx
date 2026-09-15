import Link from "next/link";

const ventures = [
  {
    index: "01",
    name: "Regolario",
    tag: "AI Literacy",
    description:
      "Formazione, assessment e documentazione per aziende che devono rendere l'AI literacy concreta, verificabile e utilizzabile.",
    href: "/projects/regolario",
    color: "var(--rmp-purple)",
  },
  {
    index: "02",
    name: "ShopShield",
    tag: "Compliance e-commerce",
    description:
      "Uno strato di compliance essenziale per piccoli business online che vogliono protezione senza complessità enterprise.",
    href: "/projects/shopshield",
    color: "var(--rmp-green)",
  },
  {
    index: "03",
    name: "Tap",
    tag: "Strumenti per attività locali",
    description:
      "NFC e QR che trasformano un'interazione fisica con il cliente in un'azione digitale utile in pochi secondi.",
    href: "/projects/tap",
    color: "var(--rmp-orange)",
  },
];

const frame = "mx-auto w-full max-w-[1680px] px-5 sm:px-8 lg:px-12 xl:px-16";

function BrandMark() {
  return (
    <span className="inline-flex h-5 items-end gap-0.5" aria-hidden>
      <span className="h-2.5 w-2.5 -skew-x-12 bg-[var(--rmp-purple)]" />
      <span className="h-4 w-2.5 -skew-x-12 bg-[var(--rmp-green)]" />
      <span className="h-5 w-2.5 -skew-x-12 bg-[var(--rmp-orange)]" />
    </span>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--line)]">
        <div className={`${frame} flex items-center justify-between py-5`}>
          <Link href="/" className="flex items-center gap-3 text-base font-bold tracking-[-0.03em]">
            <BrandMark />
            <span>RMP WORKS</span>
          </Link>

          <div className="flex items-center gap-5 sm:gap-8">
            <nav className="hidden items-center gap-5 text-sm text-[var(--muted)] sm:flex sm:gap-8">
              <Link className="transition hover:text-black" href="/projects">Progetti</Link>
              <Link className="transition hover:text-black" href="/about">Chi siamo</Link>
              <Link className="transition hover:text-black" href="/contact">Contatti</Link>
            </nav>
            <div className="flex items-center gap-1 rounded-full border border-[var(--line)] p-1 text-xs font-semibold">
              <span className="rounded-full bg-[#101010] px-2.5 py-1 text-white">IT</span>
              <Link href="/en/" className="rounded-full px-2.5 py-1 text-[var(--muted)] transition hover:text-black">EN</Link>
            </div>
          </div>
        </div>
      </header>

      <section className={`${frame} grid min-h-[76vh] content-between py-8 sm:py-12 lg:py-14`}>
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--rmp-purple)]" />
          Studio indipendente di prodotti
        </div>

        <div className="py-16 sm:py-24 lg:py-28">
          <h1 className="max-w-[1420px] text-[clamp(4rem,9vw,10rem)] font-semibold leading-[0.84] tracking-[-0.075em]">
            Costruiamo cose
            <br />
            che <span className="text-[var(--rmp-orange)]">funzionano.</span>
          </h1>
        </div>

        <div className="grid gap-8 border-t border-[var(--line)] pt-6 md:grid-cols-12">
          <p className="max-w-2xl text-lg leading-7 text-[var(--muted)] md:col-span-7 md:text-xl md:leading-8">
            RMP Works trasforma idee utili in prodotti, software e piccoli business focalizzati — in fretta, con criterio e senza strati inutili.
          </p>

          <div className="flex items-end md:col-span-3 md:col-start-10 md:justify-end">
            <Link href="#work" className="inline-flex items-center gap-3 text-sm font-medium">
              Guarda cosa stiamo costruendo <span aria-hidden>↓</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="work" className="border-y border-[var(--line)] bg-[#101010] text-[#f4f1ea]">
        <div className={`${frame} py-16 sm:py-20 lg:py-24`}>
          <div className="grid gap-8 border-b border-white/20 pb-10 md:grid-cols-12">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/55 md:col-span-3">Progetti attuali</p>
            <h2 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl md:col-span-9 lg:text-7xl">
              Prodotti veri per problemi veri.
            </h2>
          </div>

          <div>
            {ventures.map((venture) => (
              <Link href={venture.href} key={venture.name} className="group grid gap-6 border-b border-white/20 py-9 transition hover:border-white/60 md:grid-cols-12 md:items-start">
                <span className="font-mono text-xs md:col-span-1" style={{ color: venture.color }}>{venture.index}</span>
                <div className="md:col-span-4">
                  <p className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">{venture.name}</p>
                  <p className="mt-2 text-sm text-white/55">{venture.tag}</p>
                </div>
                <p className="max-w-3xl text-base leading-7 text-white/70 md:col-span-5">{venture.description}</p>
                <div className="text-right text-2xl transition-transform group-hover:translate-x-1 md:col-span-2">→</div>
              </Link>
            ))}
          </div>

          <div className="pt-10">
            <Link href="/projects" className="inline-flex rounded-full border border-white/35 px-5 py-2.5 text-sm transition hover:border-white hover:bg-white hover:text-black">
              Tutti i progetti
            </Link>
          </div>
        </div>
      </section>

      <section className={`${frame} py-20 sm:py-28 lg:py-32`}>
        <div className="grid gap-12 md:grid-cols-12">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)] md:col-span-3">Come lavoriamo</p>

          <div className="md:col-span-9">
            <h2 className="max-w-6xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
              Team piccoli.
              <br />
              Decisioni veloci.
              <br />
              <span className="text-[var(--rmp-green)]">Risultati utili.</span>
            </h2>

            <div className="mt-14 grid gap-8 border-t border-[var(--line)] pt-8 sm:grid-cols-3">
              <div>
                <p className="font-mono text-xs text-[var(--rmp-purple)]">01 / FOCUS</p>
                <p className="mt-4 max-w-sm leading-7">Risolviamo un problema che conta prima di aggiungere dieci funzioni che nessuno ha chiesto.</p>
              </div>
              <div>
                <p className="font-mono text-xs text-[var(--rmp-green)]">02 / SPEDISCI</p>
                <p className="mt-4 max-w-sm leading-7">Mettiamo presto prodotti funzionanti davanti a persone reali e miglioriamo usando evidenze.</p>
              </div>
              <div>
                <p className="font-mono text-xs text-[var(--rmp-orange)]">03 / SISTEMATIZZA</p>
                <p className="mt-4 max-w-sm leading-7">Automatizziamo il lavoro ripetibile così il prodotto può crescere senza far crescere la burocrazia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--rmp-orange)] text-[#101010]">
        <div className={`${frame} grid min-h-[54vh] content-between py-10 sm:py-14`}>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-black/55">RMP Works</p>

          <div className="py-16 sm:py-20">
            <h2 className="max-w-7xl text-[clamp(3.5rem,7.5vw,8rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
              Costruiamo la prossima
              <br />
              cosa utile.
            </h2>
          </div>

          <div className="flex flex-col gap-5 border-t border-black/25 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-black/70">Prodotti, esperimenti e business con una ragione per esistere.</p>
            <Link href="/contact" className="inline-flex w-fit rounded-full bg-[#101010] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--rmp-purple)]">
              Parliamone →
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#101010] text-white">
        <div className={`${frame} flex flex-col gap-8 py-10 md:flex-row md:items-end md:justify-between`}>
          <div>
            <div className="flex items-center gap-3">
              <BrandMark />
              <p className="text-lg font-semibold tracking-[-0.03em]">RMP WORKS</p>
            </div>
            <p className="mt-2 text-sm text-white/45">© 2026 RMP Works</p>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/60">
            <Link className="hover:text-white" href="/projects">Progetti</Link>
            <Link className="hover:text-white" href="/about">Chi siamo</Link>
            <Link className="hover:text-white" href="/contact">Contatti</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
