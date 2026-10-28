import Link from "next/link";
import type { Metadata } from "next";
import { rmpPhone } from "../contact-details";

export const metadata: Metadata = {
  title: "Contatti | RMP Works",
  description:
    "Per informazioni su Regolario, assessment e partnership: il canale pubblico di supporto Regolario.",
};

const frame = "mx-auto w-full max-w-[1680px] px-5 sm:px-8 lg:px-12 xl:px-16";

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
          <Link href="/" className="flex items-center gap-3 text-base font-bold tracking-[-0.03em]">
            <BrandMark />
            <span>RMP WORKS</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm text-[var(--muted)] sm:gap-8">
            <Link className="transition hover:text-[var(--rmp-purple)]" href="/projects">Progetti</Link>
            <Link className="transition hover:text-[var(--rmp-purple)]" href="/about">Chi siamo</Link>
            <Link className="text-[var(--foreground)]" href="/contact">Contatti</Link>
          </nav>
        </div>
      </header>

      <section className={`${frame} grid min-h-[72vh] content-center py-16 sm:py-24`}>
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--rmp-purple)]">Contatti Regolario</p>
        <h1 className="mt-6 max-w-5xl text-[clamp(3.5rem,8vw,8rem)] font-semibold leading-[0.88] tracking-[-0.07em]">
          Parliamone,
          <br />
          senza altre <span className="text-[var(--rmp-orange)]">scartoffie.</span>
        </h1>
        <div className="mt-12 max-w-2xl border-t border-[var(--line)] pt-7">
          <p className="text-lg leading-8 text-[var(--muted)]">
            Per informazioni su Regolario, assessment e possibili partnership, puoi scrivere al canale pubblico di supporto Regolario.
          </p>
          <a
            href="mailto:supporto@regolario.com"
            className="mt-7 inline-flex w-fit items-center gap-3 rounded-full bg-[#101010] px-6 py-3 text-sm font-semibold !text-white transition hover:bg-[var(--rmp-purple)]"
          >
            Scrivi a supporto@regolario.com <span aria-hidden>↗</span>
          </a>
          <a
            href={rmpPhone.href}
            className="mt-3 inline-flex w-fit items-center gap-3 rounded-full border border-[var(--line)] px-6 py-3 text-sm font-semibold transition hover:border-[var(--rmp-purple)] hover:text-[var(--rmp-purple)]"
          >
            Chiama RMP Works: {rmpPhone.display}
          </a>
          <p className="mt-6 text-sm leading-6 text-[var(--muted)]">
            Il supporto email riguarda Regolario. Per RMP Works puoi chiamare il numero aziendale qui sopra.
          </p>
        </div>
      </section>
      <footer className="bg-[#101010] text-white">
        <div className={`${frame} flex flex-col gap-5 py-9 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between`}>
          <div className="flex items-center gap-3"><BrandMark /><span className="font-semibold text-white">RMP WORKS</span></div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <a className="transition hover:text-[var(--rmp-purple)]" href={rmpPhone.href}>{rmpPhone.display}</a>
            <Link className="transition hover:text-[var(--rmp-purple)]" href="/projects/regolario">Scopri Regolario</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
