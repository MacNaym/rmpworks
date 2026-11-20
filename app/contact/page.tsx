import Link from "next/link";
import type { Metadata } from "next";
import { rmpPhone } from "../contact-details";

export const metadata: Metadata = {
  title: "Contatti | RMP Works",
  description: "Contatta RMP Works per Creator Studio, collaborazione creator e progetti. Per Regolario rimane disponibile il canale dedicato.",
};
const frame = "mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12";
export default function ContactPage() {
  return <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
    <header className="border-b border-[#e2e8f0] bg-white"><div className={`${frame} flex min-h-20 items-center justify-between`}><Link href="/" className="font-bold tracking-tight">RMP WORKS</Link><Link href="/" className="text-sm text-[#475569]">← Home</Link></div></header>
    <section className={`${frame} py-20 sm:py-28`}>
      <p className="text-xs font-bold uppercase tracking-widest text-[#2563eb]">Parliamone</p>
      <h1 className="mt-5 max-w-4xl text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[.95] tracking-[-.065em]">Da un'idea a qualcosa di concreto.</h1>
      <p className="mt-7 max-w-3xl text-lg leading-8 text-[#526176]">Se hai un canale e vuoi creare il tuo primo prodotto digitale, possiamo iniziare parlando del pubblico che ti segue e di cosa gli serve davvero.</p>
      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-[#dce5f3] bg-white p-8">
          <h2 className="text-2xl font-semibold">Creator Studio</h2>
          <p className="mt-3 leading-7 text-[#526176]">Informazioni sul programma Founder, progetti e collaborazioni.</p>
          <a className="mt-7 inline-flex rounded-full bg-[#111827] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8]" href={rmpPhone.href}>Chiama {rmpPhone.display}</a>
          <p className="mt-4 text-xs leading-6 text-[#64748b]">Stiamo preparando un modulo dedicato: per ora utilizza il contatto aziendale.</p>
        </div>
        <div className="rounded-2xl border border-[#dce5f3] bg-white p-8">
          <h2 className="text-2xl font-semibold">Regolario</h2>
          <p className="mt-3 leading-7 text-[#526176]">Assistenza, AI Literacy e richieste relative alla piattaforma Regolario.</p>
          <a className="mt-7 inline-flex rounded-full border border-[#cdd7e7] px-6 py-3 text-sm font-semibold hover:text-[#1d4ed8]" href="mailto:supporto@regolario.com">supporto@regolario.com ↗</a>
          <div className="mt-5"><Link className="text-sm font-medium text-[#2563eb]" href="/projects/regolario">Scopri Regolario →</Link></div>
        </div>
      </div>
    </section>
    <footer className="bg-[#111827] py-10 text-sm text-white/70"><div className={`${frame} flex flex-wrap justify-between gap-5`}><span>© 2026 RMP Works</span><div className="flex gap-5"><Link href="/creator-studio">Creator Studio</Link><Link href="/projects">Progetti</Link></div></div></footer>
  </main>;
}
