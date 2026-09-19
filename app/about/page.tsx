import Link from "next/link";

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

export default function AboutPage() {
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
            <Link className="transition hover:text-[var(--rmp-purple)]" href="/projects">
              Progetti
            </Link>
            <Link className="text-[var(--foreground)]" href="/about">
              Chi siamo
            </Link>
            <Link className="transition hover:text-[var(--rmp-purple)]" href="/contact">
              Contatti
            </Link>
          </nav>
        </div>
      </header>

      <section className={`${frame} py-16 sm:py-24 lg:py-28`}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          Chi siamo
        </p>

        <h1 className="mt-8 max-w-7xl text-[clamp(4rem,8.5vw,9.5rem)] font-semibold leading-[0.86] tracking-[-0.075em]">
          Un piccolo studio
          <br />
          per costruire <span className="text-[var(--rmp-orange)]">cose utili.</span>
        </h1>

        <div className="mt-16 grid gap-10 border-t border-[var(--line)] pt-8 lg:grid-cols-12">
          <p className="max-w-2xl text-xl leading-8 text-[var(--muted)] lg:col-span-7">
            RMP Works è il contenitore operativo in cui trasformiamo problemi reali
            in prodotti, software, strumenti e piccoli business che possano stare in piedi da soli.
          </p>

          <p className="max-w-md text-lg leading-8 lg:col-span-4 lg:col-start-9">
            Preferiamo sistemi piccoli, decisioni veloci, automazione dove serve
            e meno strati possibili tra un problema e la sua soluzione.
          </p>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[#101010] text-[#f4f1ea]">
        <div className={`${frame} py-16 sm:py-20 lg:py-24`}>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/50">
            Il nostro criterio
          </p>

          <h2 className="mt-6 max-w-6xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Non ci interessa sembrare grandi.
            <br />
            Ci interessa <span className="text-[var(--rmp-green)]">funzionare bene.</span>
          </h2>

          <div className="mt-14 grid border-y border-white/20 md:grid-cols-3">
            <article className="py-8 md:pr-8">
              <p className="font-mono text-xs text-[var(--rmp-purple)]">01 / FOCUS</p>
              <p className="mt-5 max-w-sm text-lg leading-7 text-white/75">
                Partiamo da un problema concreto e teniamo il perimetro stretto finché non abbiamo una soluzione utile.
              </p>
            </article>

            <article className="border-t border-white/20 py-8 md:border-l md:border-t-0 md:px-8">
              <p className="font-mono text-xs text-[var(--rmp-green)]">02 / VELOCITÀ</p>
              <p className="mt-5 max-w-sm text-lg leading-7 text-white/75">
                Mettiamo presto qualcosa di reale davanti alle persone, invece di perfezionare ipotesi per mesi.
              </p>
            </article>

            <article className="border-t border-white/20 py-8 md:border-l md:border-t-0 md:pl-8">
              <p className="font-mono text-xs text-[var(--rmp-orange)]">03 / SISTEMI</p>
              <p className="mt-5 max-w-sm text-lg leading-7 text-white/75">
                Automatizziamo ciò che si ripete e progettiamo prodotti che non richiedano burocrazia per crescere.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={`${frame} py-20 sm:py-28`}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          Cosa costruiamo
        </p>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:items-end">
          <h2 className="max-w-6xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:col-span-8 lg:text-7xl">
            Prodotti con un motivo
            <br />
            per <span className="text-[var(--rmp-purple)]">esistere.</span>
          </h2>

          <div className="space-y-5 text-lg leading-8 text-[var(--muted)] lg:col-span-4">
            <p>
              Oggi RMP Works ospita progetti in AI literacy, compliance e-commerce
              e strumenti per attività locali.
            </p>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 font-semibold text-[var(--foreground)] transition hover:text-[var(--rmp-purple)]"
            >
              Guarda i progetti <span aria-hidden>→</span>
            </Link>
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
              La prossima cosa utile
              <br />
              potrebbe iniziare qui.
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
        <div className={`${frame} flex flex-col gap-8 py-10 md:flex-row md:items-end md:justify-between`}>
          <div>
            <div className="flex items-center gap-3">
              <BrandMark />
              <p className="text-lg font-semibold tracking-[-0.03em]">RMP WORKS</p>
            </div>
            <p className="mt-2 text-sm text-white/45">© 2026 RMP Works</p>
          </div>

          <div className="flex items-center gap-6 text-sm text-white/60">
            <Link className="hover:text-[var(--rmp-purple)]" href="/projects">Progetti</Link>
            <Link className="hover:text-[var(--rmp-purple)]" href="/">Home</Link>
            <Link className="hover:text-[var(--rmp-purple)]" href="/contact">Contatti</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
