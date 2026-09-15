import Link from "next/link";

const ventures = [
  {
    index: "01",
    name: "Regolario",
    tag: "AI Literacy",
    description:
      "Training, assessment and documentation for companies that need AI literacy to be practical, verifiable and usable.",
    href: "/projects/regolario",
  },
  {
    index: "02",
    name: "ShopShield",
    tag: "E-commerce compliance",
    description:
      "A focused compliance layer for small online businesses that need the essentials without enterprise complexity.",
    href: "/projects/shopshield",
  },
  {
    index: "03",
    name: "Tap",
    tag: "Local business tools",
    description:
      "NFC and QR tools that turn a physical customer interaction into a useful digital action in seconds.",
    href: "/projects/tap",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link href="/" className="text-sm font-bold tracking-[-0.02em]">
            RMP WORKS
          </Link>

          <nav className="flex items-center gap-5 text-sm text-[var(--muted)] sm:gap-8">
            <Link className="transition hover:text-black" href="/projects">
              Work
            </Link>
            <Link className="transition hover:text-black" href="/about">
              About
            </Link>
            <Link className="transition hover:text-black" href="/contact">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <section className="mx-auto grid min-h-[78vh] max-w-[1440px] content-between px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-14">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
          <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          Independent product studio
        </div>

        <div className="py-20 sm:py-28 lg:py-32">
          <h1 className="max-w-[1200px] text-[clamp(4rem,10vw,10rem)] font-semibold leading-[0.82] tracking-[-0.075em]">
            We build things
            <br />
            that <span className="text-[var(--accent)]">work.</span>
          </h1>
        </div>

        <div className="grid gap-8 border-t border-[var(--line)] pt-6 md:grid-cols-12">
          <p className="max-w-xl text-lg leading-7 text-[var(--muted)] md:col-span-6 md:text-xl md:leading-8">
            RMP Works turns useful ideas into focused products, software and
            small businesses — quickly, deliberately and without unnecessary
            layers.
          </p>

          <div className="flex items-end md:col-span-3 md:col-start-10 md:justify-end">
            <Link
              href="#work"
              className="inline-flex items-center gap-3 text-sm font-medium"
            >
              See what we are building <span aria-hidden>↓</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="work" className="border-y border-[var(--line)] bg-[#101010] text-[#f4f1ea]">
        <div className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="grid gap-8 border-b border-white/20 pb-10 md:grid-cols-12">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/50 md:col-span-4">
              Current work
            </p>
            <h2 className="text-4xl font-semibold tracking-[-0.045em] sm:text-5xl md:col-span-8 lg:text-7xl">
              Real products for real problems.
            </h2>
          </div>

          <div>
            {ventures.map((venture) => (
              <Link
                href={venture.href}
                key={venture.name}
                className="group grid gap-6 border-b border-white/20 py-9 transition hover:border-white/60 md:grid-cols-12 md:items-start"
              >
                <span className="font-mono text-xs text-white/40 md:col-span-1">
                  {venture.index}
                </span>

                <div className="md:col-span-4">
                  <p className="text-3xl font-medium tracking-[-0.04em] sm:text-4xl">
                    {venture.name}
                  </p>
                  <p className="mt-2 text-sm text-white/45">{venture.tag}</p>
                </div>

                <p className="max-w-2xl leading-7 text-white/60 md:col-span-5">
                  {venture.description}
                </p>

                <div className="text-right text-2xl transition-transform group-hover:translate-x-1 md:col-span-2">
                  →
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-10">
            <Link
              href="/projects"
              className="inline-flex rounded-full border border-white/30 px-5 py-2.5 text-sm transition hover:border-white hover:bg-white hover:text-black"
            >
              All projects
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-20 sm:px-8 sm:py-28 lg:px-12 lg:py-36">
        <div className="grid gap-14 md:grid-cols-12">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)] md:col-span-3">
            How we work
          </p>

          <div className="md:col-span-9">
            <h2 className="max-w-5xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
              Small teams.
              <br />
              Fast decisions.
              <br />
              <span className="text-[var(--accent)]">Useful output.</span>
            </h2>

            <div className="mt-16 grid gap-8 border-t border-[var(--line)] pt-8 sm:grid-cols-3">
              <div>
                <p className="font-mono text-xs text-[var(--muted)]">01 / FOCUS</p>
                <p className="mt-4 leading-7">
                  Solve one valuable problem before adding ten features nobody
                  asked for.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs text-[var(--muted)]">02 / SHIP</p>
                <p className="mt-4 leading-7">
                  Put working products in front of real people early and improve
                  from evidence.
                </p>
              </div>
              <div>
                <p className="font-mono text-xs text-[var(--muted)]">03 / SYSTEMIZE</p>
                <p className="mt-4 leading-7">
                  Automate the repeatable work so the product can grow without
                  growing bureaucracy with it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[var(--accent)] text-white">
        <div className="mx-auto grid min-h-[54vh] max-w-[1440px] content-between px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/65">
            RMP Works
          </p>

          <div className="py-20">
            <h2 className="max-w-6xl text-[clamp(3.5rem,8vw,8rem)] font-semibold leading-[0.86] tracking-[-0.07em]">
              Build the next
              <br />
              useful thing.
            </h2>
          </div>

          <div className="flex flex-col gap-5 border-t border-white/35 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-lg text-white/75">
              Products, experiments and businesses with a reason to exist.
            </p>
            <Link
              href="/contact"
              className="inline-flex w-fit rounded-full bg-white px-6 py-3 text-sm font-medium text-[var(--accent)] transition hover:bg-[#101010] hover:text-white"
            >
              Get in touch →
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#101010] text-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-end md:justify-between lg:px-12">
          <div>
            <p className="text-lg font-semibold tracking-[-0.03em]">RMP WORKS</p>
            <p className="mt-2 text-sm text-white/40">© 2026 RMP Works</p>
          </div>

          <div className="flex gap-6 text-sm text-white/55">
            <Link className="hover:text-white" href="/projects">
              Work
            </Link>
            <Link className="hover:text-white" href="/about">
              About
            </Link>
            <Link className="hover:text-white" href="/contact">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
