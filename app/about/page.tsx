import Link from "next/link";
import type { Metadata } from "next";
import { rmpPhone } from "../contact-details";

export const metadata: Metadata = {
  title: "Chi siamo | RMP Works Creator Studio",
  description: "RMP Works costruisce strumenti e prodotti digitali con creator indipendenti. Creatività, tecnologia e un primo passo concreto.",
};
const frame = "mx-auto max-w-[1240px] px-5 md:px-12";
export default function About() {
  return <main className="min-h-screen bg-[#f7f1e5] text-[#111]">
    <header className="border-b-[4px] border-black"><div className={frame+" flex min-h-20 flex-wrap items-center justify-between gap-4 py-3"}>
      <Link href="/" className="bg-black px-3 py-2 text-xl font-black tracking-[-.08em] text-white">RMP/WORKS.</Link>
      <nav className="flex flex-wrap items-center gap-5 text-xs font-black uppercase"><Link href="/creator-studio" className="hover:underline">Founder</Link><Link href="/contact" className="border-[2px] border-black bg-[#faff4e] px-4 py-3 shadow-[4px_4px_0_#111]">Contatti ↗</Link></nav>
    </div></header>
    <section className={frame+" py-16 sm:py-24"}>
      <p className="inline-block -rotate-2 border-[3px] border-black bg-[#faff4e] px-4 py-3 text-xs font-black uppercase shadow-[5px_5px_0_#111]">Chi siamo / RMP Works</p>
      <h1 className="mt-12 max-w-5xl text-[clamp(3.8rem,9vw,9rem)] font-black uppercase leading-[.85] tracking-[-.095em]">LE IDEE<br/>NON SI<br/><span className="text-[#f25436]">VENDONO</span><br/>DA SOLE.</h1>
      <div className="mt-14 grid gap-9 border-t-[4px] border-black pt-10 md:grid-cols-[.85fr_1.15fr]">
        <p className="text-xl font-black uppercase leading-tight sm:text-3xl">Un piccolo studio tecnico per chi ha già qualcosa da raccontare.</p>
        <div className="space-y-5 text-base font-semibold leading-8">
          <p>RMP Works nasce per trasformare competenze e contenuti in strumenti utili. Con il Creator Studio lavoriamo insieme a YouTuber e creator indipendenti per progettare il loro primo prodotto digitale.</p>
          <p>Niente promesse di guadagni facili. Partiamo dalle domande della community, definiamo un risultato concreto, costruiamo una prima versione e la miglioriamo con i riscontri reali.</p>
          <p>RMP Works è il marchio operativo di RMP Foodworks S.r.l. Il progetto Founder è in fase di attivazione assistita: scope, condizioni e tempi vengono concordati prima di ogni pagamento.</p>
        </div>
      </div>
    </section>
    <section className="border-y-[4px] border-black bg-[#111] py-16 text-white"><div className={frame}>
      <p className="font-mono text-xs font-black uppercase tracking-[.2em] text-[#faff4e]">Il nostro metodo / 01—03</p>
      <div className="mt-10 grid gap-0 border-[3px] border-white md:grid-cols-3">
        {[
          ["01","ASCOLTARE","Capire cosa cerca davvero il tuo pubblico."],
          ["02","COSTRUIRE","Realizzare un primo prodotto utile, non un catalogo infinito."],
          ["03","LANCIARE","Mettere online un percorso semplice e imparare dai risultati."]
        ].map(([n,t,c],i)=><div key={n} className={"p-7 md:p-9 "+(i<2?"border-b-[3px] border-white md:border-b-0 md:border-r-[3px]":"")}>
          <p className="font-mono text-sm font-black text-[#faff4e]">{n}</p><h2 className="mt-6 text-3xl font-black">{t}</h2><p className="mt-4 text-sm leading-7 text-white/75">{c}</p>
        </div>)}
      </div>
    </div></section>
    <section className={frame+" py-16 sm:py-24"}>
      <div className="grid gap-8 border-[4px] border-black bg-[#faff4e] p-7 shadow-[10px_10px_0_#111] sm:p-12 md:grid-cols-[1fr_auto] md:items-end">
        <div><p className="text-xs font-black uppercase tracking-widest">Hai un canale e un'idea?</p><h2 className="mt-5 text-[clamp(2.7rem,5vw,5rem)] font-black uppercase leading-[.88] tracking-[-.07em]">FACCIAMOLA<br/>DIVENTARE REALE.</h2></div>
        <Link href="/contact" className="inline-flex border-[3px] border-black bg-black px-7 py-5 text-sm font-black uppercase text-white">Parliamone ↗</Link>
      </div>
    </section>
    <footer className="border-t-[4px] border-black bg-[#111] py-8 text-white"><div className={frame+" flex flex-wrap justify-between gap-5 text-xs font-black uppercase"}><Link href="/">RMP/WORKS.</Link><a href={rmpPhone.href}>Contatto telefonico: {rmpPhone.display}</a></div></footer>
  </main>;
}
