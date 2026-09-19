import Link from "next/link";

type ProjectDetailProps = {
  eyebrow: string;
  name: string;
  category: string;
  headline: string;
  description: string;
  accent: string;
  status: string;
  problem: string;
  solution: string;
  audience: string[];
  principles: string[];
  externalHref?: string;
  externalLabel?: string;
};

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

export default function ProjectDetail({
  eyebrow,
  name,
  category,
  headline,
  description,
  accent,
  status,
  problem,
  solution,
  audience,
  principles,
  externalHref,
  externalLabel,
}: ProjectDetailProps) {
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
            <Link
              className="transition hover:text-[var(--rmp-purple)]"
              href="/projects"
            >
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
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <p
            className="font-mono text-xs uppercase tracking-[0.16em]"
            style={{ color: accent }}
          >
            {eyebrow}
          </p>
          <span className="text-[var(--line)]">/</span>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            {status}
          </p>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-9">
            <p className="text-lg text-[var(--muted)]">{category}</p>
            <h1 className="mt-4 max-w-6xl text-[clamp(4rem,8vw,9rem)] font-semibold leading-[0.86] tracking-[-0.075em]">
              {name}
            </h1>
          </div>

          <p className="max-w-md text-lg leading-8 text-[var(--muted)] lg:col-span-3">
            {description}
          </p>
        </div>

        <h2 className="mt-16 max-w-6xl text-4xl font-semibold leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
          {headline}
        </h2>
      </section>

      <section className="border-y border-[var(--line)] bg-[#101010] text-[#f4f1ea]">
        <div className={`${frame} grid gap-0 py-0 lg:grid-cols-2`}>
          <article className="border-b border-white/20 py-14 lg:border-b-0 lg:border-r lg:pr-14">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-white/45">
              Il problema
            </p>
            <p className="mt-6 max-w-xl text-2xl leading-[1.25] tracking-[-0.025em] text-white/90 sm:text-3xl">
              {problem}
            </p>
          </article>

          <article className="py-14 lg:pl-14">
            <p
              className="font-mono text-xs uppercase tracking-[0.16em]"
              style={{ color: accent }}
            >
              La risposta
            </p>
            <p className="mt-6 max-w-xl text-2xl leading-[1.25] tracking-[-0.025em] text-white/90 sm:text-3xl">
              {solution}
            </p>
          </article>
        </div>
      </section>

      <section className={`${frame} py-20 sm:py-28`}>
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Per chi è
            </p>
            <h2 className="mt-6 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl">
              Utile quando il problema è reale.
            </h2>
          </div>

          <div className="lg:col-span-7">
            <div className="border-t border-[var(--line)]">
              {audience.map((item, index) => (
                <div
                  key={item}
                  className="grid gap-4 border-b border-[var(--line)] py-6 sm:grid-cols-[80px_1fr]"
                >
                  <span
                    className="font-mono text-xs"
                    style={{ color: accent }}
                  >
                    0{index + 1}
                  </span>
                  <p className="text-lg leading-7">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--line)]">
        <div className={`${frame} py-20 sm:py-24`}>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Come lo costruiamo
          </p>

          <div className="mt-8 grid border-y border-[var(--line)] md:grid-cols-3">
            {principles.map((item, index) => (
              <article
                key={item}
                className="border-b border-[var(--line)] py-8 md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <p
                  className="font-mono text-xs"
                  style={{ color: accent }}
                >
                  0{index + 1}
                </p>
                <p className="mt-5 max-w-sm text-lg leading-7">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--rmp-orange-panel)] text-[#101010]">
        <div className={`${frame} py-16 sm:py-20`}>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-[var(--rmp-purple)]" />
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-black/55">
              {name}
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-8 border-t border-black/25 pt-8 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-5xl text-[clamp(3rem,6vw,6rem)] font-semibold leading-[0.9] tracking-[-0.065em]">
              Vuoi vedere
              <br />
              il progetto da vicino?
            </h2>

            <div className="flex flex-wrap gap-3">
              {externalHref && externalLabel ? (
                <a
                  href={externalHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit rounded-full bg-[#101010] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--rmp-purple)]"
                >
                  {externalLabel} ↗
                </a>
              ) : null}
              <Link
                href="/contact"
                className="inline-flex w-fit rounded-full border border-black/35 px-6 py-3 text-sm font-semibold transition hover:border-[var(--rmp-purple)] hover:text-[var(--rmp-purple)]"
              >
                Parliamone →
              </Link>
            </div>
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
            <Link className="hover:text-[var(--rmp-purple)]" href="/projects">
              Progetti
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
