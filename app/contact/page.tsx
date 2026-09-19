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

export default function ContactPage() {
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
            <Link className="transition hover:text-[var(--rmp-purple)]" href="/about">
              Chi siamo
            </Link>
            <Link className="text-[var(--foreground)]" href="/contact">
              Contatti
            </Link>
          </nav>
        </div>
      </header>

      <section className={`${frame} py-16 sm:py-24 lg:py-28`}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          Contatti
        </p>

        <h1 className="mt-8 max-w-7xl text-[clamp(4rem,8.5vw,9.5rem)] font-semibold leading-[0.86] tracking-[-0.075em]">
          Hai qualcosa che vale
          <br />
          la pena <span className="text-[var(--rmp-orange)]">costruire?</span>
        </h1>

        <div className="mt-16 grid gap-10 border-t border-[var(--line)] pt-8 lg:grid-cols-12">
          <p className="max-w-2xl text-xl leading-8 text-[var(--muted)] lg:col-span-7">
            Partnership, prodotti, collaborazioni o semplicemente un problema interessante:
            se c’è qualcosa di concreto da discutere, questo è il posto giusto.
          </p>

          <p className="max-w-md text-lg leading-8 lg:col-span-4 lg:col-start-9">
            Non vendiamo ore a pacchetto. Preferiamo capire se esiste un problema che
            possiamo davvero aiutare a risolvere.
          </p>
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[#101010] text-[#f4f1ea]">
        <div className={`${frame} py-16 sm:py-20 lg:py-24`}>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/50">
            Da dove partire
          </p>

          <div className="mt-8 grid border-y border-white/20 md:grid-cols-3">
            <article className="py-8 md:pr-8">
              <p className="font-mono text-xs text-[var(--rmp-purple)]">01 / PRODOTTO</p>
              <p className="mt-5 max-w-sm text-lg leading-7 text-white/75">
                Hai un problema concreto, un prodotto da costruire o un’idea che vuoi validare velocemente.
              </p>
            </article>

            <article className="border-t border-white/20 py-8 md:border-l md:border-t-0 md:px-8">
              <p className="font-mono text-xs text-[var(--rmp-green)]">02 / PARTNERSHIP</p>
              <p className="mt-5 max-w-sm text-lg leading-7 text-white/75">
                Hai un pubblico, una distribuzione o competenze che potrebbero incastrarsi con uno dei nostri progetti.
              </p>
            </article>

            <article className="border-t border-white/20 py-8 md:border-l md:border-t-0 md:pl-8">
              <p className="font-mono text-xs text-[var(--rmp-orange)]">03 / PROGETTI</p>
              <p className="mt-5 max-w-sm text-lg leading-7 text-white/75">
                Vuoi parlare di Regolario, ShopShield o Tap e capire quale soluzione è adatta al tuo caso.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={`${frame} py-20 sm:py-28`}>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Contatto diretto
            </p>

            <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
              Una conversazione
              <br />
              <span className="text-[var(--rmp-purple)]">senza giri inutili.</span>
            </h2>
          </div>

          <div className="lg:col-span-5">
            <div className="border-t border-[var(--line)] py-7">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Canale principale
              </p>
              <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
                Il canale diretto verrà collegato qui prima della pubblicazione definitiva della pagina.
              </p>
            </div>

            <div className="border-t border-[var(--line)] py-7">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                Nel frattempo
              </p>
              <Link
                href="/projects"
                className="mt-4 inline-flex items-center gap-2 text-lg font-semibold transition hover:text-[var(--rmp-purple)]"
              >
                Esplora i progetti <span aria-hidden>→</span>
              </Link>
            </div>
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
            <Link className="hover:text-[var(--rmp-purple)]" href="/about">Chi siamo</Link>
            <Link className="hover:text-[var(--rmp-purple)]" href="/">Home</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
