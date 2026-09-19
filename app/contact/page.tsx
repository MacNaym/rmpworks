import Link from "next/link";

const frame =
  "mx-auto w-full max-w-[1680px] px-5 sm:px-8 lg:px-12 xl:px-16";

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "";
const formEndpoint = process.env.NEXT_PUBLIC_CONTACT_FORM_ENDPOINT ?? "";

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
  const formReady = Boolean(formEndpoint);

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
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Scrivici
            </p>

            <h2 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl">
              Una conversazione
              <br />
              <span className="text-[var(--rmp-purple)]">senza giri inutili.</span>
            </h2>

            <p className="mt-8 max-w-md text-lg leading-8 text-[var(--muted)]">
              Raccontaci in poche righe cosa stai cercando di fare. Se c’è un punto concreto
              da affrontare, partiamo da quello.
            </p>

            {contactEmail ? (
              <div className="mt-10 border-t border-[var(--line)] pt-6">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  Preferisci l’email?
                </p>
                <a
                  className="mt-3 inline-flex text-lg font-semibold transition hover:text-[var(--rmp-purple)]"
                  href={`mailto:${contactEmail}`}
                >
                  {contactEmail} ↗
                </a>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-7">
            <form
              action={formReady ? formEndpoint : undefined}
              method="POST"
              className="border-t border-[var(--line)]"
            >
              <div className="grid gap-6 border-b border-[var(--line)] py-7 sm:grid-cols-2">
                <label className="grid gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                    Nome
                  </span>
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    className="border-0 border-b border-[var(--line)] bg-transparent px-0 py-3 text-lg outline-none transition focus:border-[var(--rmp-purple)]"
                    placeholder="Come ti chiami?"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                    Email
                  </span>
                  <input
                    required
                    type="email"
                    name="email"
                    autoComplete="email"
                    className="border-0 border-b border-[var(--line)] bg-transparent px-0 py-3 text-lg outline-none transition focus:border-[var(--rmp-purple)]"
                    placeholder="nome@azienda.it"
                  />
                </label>
              </div>

              <div className="border-b border-[var(--line)] py-7">
                <label className="grid gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                    Di cosa vuoi parlare?
                  </span>
                  <select
                    name="topic"
                    className="border-0 border-b border-[var(--line)] bg-transparent px-0 py-3 text-lg outline-none transition focus:border-[var(--rmp-purple)]"
                    defaultValue="prodotto"
                  >
                    <option value="prodotto">Prodotto o idea</option>
                    <option value="partnership">Partnership</option>
                    <option value="regolario">Regolario</option>
                    <option value="shopshield">ShopShield</option>
                    <option value="tap">Tap</option>
                    <option value="altro">Altro</option>
                  </select>
                </label>
              </div>

              <div className="border-b border-[var(--line)] py-7">
                <label className="grid gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                    Messaggio
                  </span>
                  <textarea
                    required
                    name="message"
                    rows={7}
                    className="resize-y border-0 border-b border-[var(--line)] bg-transparent px-0 py-3 text-lg leading-7 outline-none transition focus:border-[var(--rmp-purple)]"
                    placeholder="Il problema, il contesto e cosa vorresti ottenere."
                  />
                </label>
              </div>

              <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="flex flex-col gap-4 py-7 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                  Inviando il modulo accetti che i dati inseriti vengano usati esclusivamente
                  per rispondere alla tua richiesta.
                </p>

                <button
                  type="submit"
                  disabled={!formReady}
                  className="inline-flex w-fit rounded-full bg-[#101010] px-6 py-3 text-sm font-semibold text-white transition enabled:hover:bg-[var(--rmp-purple)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {formReady ? "Invia messaggio →" : "Configura endpoint form"}
                </button>
              </div>
            </form>
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
