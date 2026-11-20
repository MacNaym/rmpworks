import Link from "next/link";
import type { Metadata } from "next";
import { rmpPhone } from "./contact-details";

export const metadata: Metadata = {
  title: "RMP Works | Dal tuo canale al tuo primo prodotto digitale",
  description: "RMP Creator Studio aiuta i piccoli content creator a creare una vetrina, un lead magnet e il primo prodotto digitale. Scopri come funziona il programma Founder.",
  openGraph: {
    title: "Hai un pubblico. Ti aiutiamo a trasformarlo in un business.",
    description: "Dalla prima idea al primo prodotto digitale: un percorso concreto per creator indipendenti.",
  },
};

const frame = "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12";
const button = "inline-flex items-center justify-center rounded-full bg-[#111827] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1d4ed8]";
const outline = "inline-flex items-center justify-center rounded-full border border-[#cdd7e7] px-6 py-3.5 text-sm font-semibold transition hover:border-[#2563eb] hover:text-[#1d4ed8]";

const steps = [
  { no: "01", title: "Troviamo il prodotto giusto", desc: "Partiamo dai tuoi contenuti e dalle domande della tua community: una proposta utile, non un prodotto a caso." },
  { no: "02", title: "Prepariamo il tuo spazio", desc: "Costruiamo una pagina a tuo marchio, una risorsa gratuita e il percorso verso il primo acquisto." },
  { no: "03", title: "Tu presenti, noi gestiamo", desc: "Condividi il link con il pubblico. Noi prepariamo la parte tecnica, la consegna e il supporto concordato." },
];

const tiers = [
  { label: "Gratuito", price: "0 €", text: "Una risorsa o un quiz per dare valore e raccogliere contatti con consenso." },
  { label: "Primo prodotto", price: "5–15 €", text: "Una soluzione piccola e immediata per chi vuole iniziare." },
  { label: "Intermedio", price: "29–79 €", text: "Un percorso o strumento più completo, da realizzare insieme." },
  { label: "Premium", price: "Su progetto", text: "Corso e prodotti avanzati: solo con materiali e metodo verificati." },
];

function Mark() {
  return <span className="inline-flex items-end gap-1" aria-hidden="true"><span className="h-3 w-2 -skew-x-12 bg-[#2563eb]"/><span className="h-5 w-2 -skew-x-12 bg-[#2563eb]"/><span className="h-7 w-2 -skew-x-12 bg-[#2563eb]"/></span>;
}
export default function Home() {
  return <main className="min-h-screen bg-[#f8fafc] text-[#101827]">
    <header className="border-b border-[#e4eaf3] bg-white">
      <div className={`${frame} flex min-h-20 items-center justify-between gap-4`}>
        <Link href="/" className="flex items-center gap-3 font-bold tracking-tight"><Mark/>RMP WORKS</Link>
        <nav aria-label="Navigazione principale" className="hidden items-center gap-6 text-sm font-medium text-[#4b5563] md:flex">
          <Link href="#come-funziona" className="hover:text-[#1d4ed8]">Come funziona</Link>
          <Link href="#prodotti" className="hover:text-[#1d4ed8]">Il metodo</Link>
          <Link href="/creator-studio" className="hover:text-[#1d4ed8]">Founder</Link>
          <Link href="/design-lab" className="hover:text-[#1d4ed8]">Laboratorio grafico</Link>
        </nav>
        <Link href="/creator-studio" className="rounded-full bg-[#111827] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#1d4ed8] sm:text-sm">Scopri Creator Studio</Link>
      </div>
    </header>
    <section className={`${frame} grid gap-12 py-20 sm:py-28 lg:grid-cols-12 lg:items-end lg:py-32`}>
      <div className="lg:col-span-9">
        <p className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#dbe5f9] bg-[#edf4ff] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#2458b5]">RMP Creator Studio · Per piccoli creator</p>
        <h1 className="max-w-5xl text-[clamp(3.3rem,7.4vw,7.8rem)] font-semibold leading-[.96] tracking-[-.07em]">Hai un pubblico.<br/><span className="text-[#2563eb]">Costruiamoci qualcosa.</span></h1>
        <p className="mt-9 max-w-3xl text-lg leading-8 text-[#556174] sm:text-xl">Ti aiutiamo a creare i primi prodotti digitali per la tua community: dallo strumento gratuito alla pagina di vendita. Senza dover sviluppare un e-commerce da zero.</p>
        <div className="mt-9 flex flex-wrap gap-3"><Link href="/creator-studio" className={button}>Scopri l&apos;attivazione Founder →</Link><Link href="#come-funziona" className={outline}>Come funziona ↓</Link></div>
      </div>
      <aside className="rounded-3xl border border-[#dce5f3] bg-white p-6 shadow-sm lg:col-span-3">
        <p className="text-xs font-bold uppercase tracking-widest text-[#2563eb]">Per chi è</p>
        <p className="mt-4 text-xl font-semibold leading-snug">YouTuber, divulgatori, formatori e creator di nicchia.</p>
        <p className="mt-3 text-sm leading-6 text-[#64748b]">Hai già persone che seguono i tuoi contenuti? Non devi avere milioni di visualizzazioni per iniziare a testare un prodotto.</p>
      </aside>
    </section>
    <section id="come-funziona" className="bg-[#111827] py-20 text-white">
      <div className={frame}>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#93b7ff]">Il percorso</p>
        <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Tu hai la competenza. Noi realizziamo la struttura.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">{steps.map(s=><div key={s.no} className="rounded-2xl border border-white/15 p-7"><p className="text-sm font-bold text-[#93b7ff]">{s.no}</p><h3 className="mt-5 text-2xl font-semibold">{s.title}</h3><p className="mt-3 text-sm leading-7 text-[#bac4d5]">{s.desc}</p></div>)}</div>
      </div>
    </section>
    <section id="prodotti" className={`${frame} py-20 sm:py-28`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#2563eb]">Un prodotto alla volta</p>
      <h2 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">Dal contenuto gratuito al prodotto completo.</h2>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-[#556174]">Progettiamo una scala di prodotti, ma cominciamo dal primo passo vendibile. Gli importi qui sotto sono esempi: il prezzo finale dipende dal tuo pubblico e dall&apos;offerta.</p>
      <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{tiers.map(t=><div key={t.label} className="rounded-2xl border border-[#dce5f3] bg-white p-6"><p className="text-xs font-bold uppercase tracking-widest text-[#2563eb]">{t.label}</p><p className="mt-4 text-3xl font-semibold">{t.price}</p><p className="mt-4 text-sm leading-7 text-[#56657a]">{t.text}</p></div>)}</div>
    </section>
    <section className="border-y border-[#dce5f3] bg-[#eaf1ff] py-16">
      <div className={`${frame} flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between`}>
        <div><p className="text-xs font-semibold uppercase tracking-widest text-[#2563eb]">Programma di lancio</p><h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Il tuo primo spazio digitale, con noi.</h2><p className="mt-4 max-w-2xl text-[#475569]">Scopri l&apos;attivazione assistita Founder e cosa include la prevendita. Nessun risultato economico promesso.</p></div>
        <Link href="/creator-studio" className={button}>Dettagli del programma →</Link>
      </div>
    </section>
    
    <footer className="bg-[#111827] py-10 text-sm text-[#c2cad8]"><div className={`${frame} flex flex-col justify-between gap-6 sm:flex-row sm:items-center`}><div><p className="font-bold text-white">RMP WORKS</p><p className="mt-1">© 2026 RMP Works · Creator Studio</p></div><div className="flex flex-wrap gap-5"><Link href="/design-lab">Design Lab</Link><Link href="/about">Chi siamo</Link><Link href="/contact">Contatti</Link><a href={rmpPhone.href}>{rmpPhone.display}</a></div></div></footer>
  </main>;
}
