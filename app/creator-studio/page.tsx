import Link from "next/link";
import type { Metadata } from "next";
import { rmpPhone } from "../contact-details";

export const metadata: Metadata = {
  title: "Creator Studio Founder | RMP Works",
  description: "Scopri il programma Founder RMP Works: attivazione assistita di uno spazio creator, primo lead magnet e primo prodotto digitale. Formula di lancio in prevendita.",
};
const frame = "mx-auto w-full max-w-5xl px-5 sm:px-8";
const included = [
  "Una pagina pubblica personalizzata con il tuo marchio",
  "Configurazione di uno spazio sul sottodominio rmpworks.com",
  "Un lead magnet semplice concordato con te (quiz base oppure risorsa digitale)",
  "Un primo microprodotto digitale su materiali e competenze che approvi",
  "Preparazione del percorso di pagamento e consegna digitale",
  "Una revisione concordata e una guida sintetica al lancio"
];
const excluded = [
  "Corsi video estesi, coaching e programmi premium",
  "Produzione illimitata di materiali, sviluppo software su misura o domini esterni",
  "Promozione pubblicitaria, crescita follower o vendite garantite",
  "Assistenza senza limiti e automazioni AI illimitate"
];
const questions = [
  {q:"È tutto pronto da usare subito?",a:"No. Il programma Founder è una prevendita di attivazione assistita. La configurazione avviene dopo la raccolta dei materiali e con una data di consegna comunicata e accettata prima del pagamento."},
  {q:"Devo avere già un corso?",a:"No. Partiamo da un lead magnet e da un microprodotto semplici. Tu metti a disposizione competenza, esempi e approvazione dei contenuti."},
  {q:"Mi garantite un numero di vendite?",a:"No. Mettiamo a disposizione la struttura tecnica e concordiamo un prodotto; risultati e vendite dipendono anche dal pubblico e dalla promozione del creator."},
  {q:"Come funzionano le commissioni?",a:"Il modello proposto è 80% al creator e 20% a RMP Works sui ricavi netti definiti nel contratto. Il trattamento delle imposte, delle commissioni e degli eventuali rimborsi sarà precisato prima dell'attivazione."},
  {q:"Come acquisto il posto Founder?",a:"Al momento raccogliamo richieste di informazioni. Prima di accettare pagamenti pubblicheremo condizioni complete, tempi di consegna e checkout verificato."}
];
export default function Founder() {
 return <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
   <header className="border-b border-[#e2e8f0] bg-white"><div className={`${frame} flex min-h-20 items-center justify-between gap-4`}><Link href="/" className="font-bold tracking-tight">RMP WORKS</Link><Link href="/" className="text-sm text-[#475569] hover:text-[#2563eb]">← Torna alla home</Link></div></header>
   <section className={`${frame} py-16 sm:py-24`}>
     <p className="inline-flex rounded-full bg-[#dce9ff] px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#1d4ed8]">Founder Preview · 20–30 novembre 2026</p>
     <h1 className="mt-8 text-[clamp(3.1rem,7vw,6.4rem)] font-semibold leading-[.97] tracking-[-.06em]">Trasforma la tua community in un progetto tutto tuo.</h1>
     <p className="mt-7 max-w-3xl text-lg leading-8 text-[#526176]">Con RMP Creator Studio progettiamo insieme il primo prodotto digitale e prepariamo il suo percorso di vendita. Tu porti competenza e pubblico; noi la parte produttiva e tecnica concordata.</p>
     <div className="mt-9 rounded-3xl border border-[#d7e2f3] bg-white p-7 sm:p-9">
       <p className="text-xs font-bold uppercase tracking-widest text-[#2563eb]">Prezzo founder proposto · Prevista attivazione una tantum</p>
       <p className="mt-3 text-5xl font-bold tracking-tight">50 € <span className="text-base font-medium text-[#64748b]">+ IVA applicabile</span></p>
       <p className="mt-3 text-sm leading-6 text-[#64748b]">Prezzo ordinario pianificato: 169 € + IVA dal 1° dicembre 2026. Non è un prezzo precedente. Offerta e disponibilità soggette alla pubblicazione delle condizioni definitive.</p>
       <a className="mt-7 inline-flex rounded-full bg-[#111827] px-6 py-3.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]" href={rmpPhone.href}>Chiedi informazioni sul programma →</a>
       <p className="mt-4 text-xs leading-6 text-[#64748b]">Nessun pagamento richiesto su questa pagina. Questa anteprima non è ancora un checkout né una prenotazione vincolante.</p>
     </div>
   </section>
   <section className="bg-[#111827] py-16 text-white"><div className={frame}>
     <h2 className="text-3xl font-semibold sm:text-5xl">Cosa comprende l&apos;attivazione</h2>
     <div className="mt-9 grid gap-4 md:grid-cols-2">{included.map(item=><div key={item} className="rounded-xl border border-white/15 p-5 text-sm leading-7">✓ {item}</div>)}</div>
   </div></section>
   <section className={`${frame} grid gap-10 py-16 md:grid-cols-2`}>
     <div><h2 className="text-3xl font-semibold">Come si parte</h2><ol className="mt-6 space-y-4 leading-7 text-[#526176]"><li>1. Parliamo del tuo canale e del pubblico.</li><li>2. Concordiamo il primo prodotto e i materiali necessari.</li><li>3. Ricevi per iscritto ambito, condizioni e data di consegna.</li><li>4. Dopo il pagamento e l&apos;onboarding, prepariamo la tua attivazione.</li></ol></div>
     <div><h2 className="text-3xl font-semibold">Cosa non comprende</h2><ul className="mt-6 space-y-4 leading-7 text-[#526176]">{excluded.map(item=><li key={item}>— {item}</li>)}</ul></div>
   </section>
   <section className="border-y border-[#dce5f3] bg-white py-16"><div className={frame}><h2 className="text-3xl font-semibold sm:text-5xl">Domande frequenti</h2><div className="mt-9 divide-y divide-[#dce5f3]">{questions.map(q=><div key={q.q} className="py-6"><h3 className="text-lg font-semibold">{q.q}</h3><p className="mt-2 max-w-3xl leading-7 text-[#526176]">{q.a}</p></div>)}</div></div></section>
   <footer className="bg-[#111827] py-10 text-sm text-white/70"><div className={`${frame} flex flex-wrap justify-between gap-4`}><span>© 2026 RMP Works</span><div className="flex flex-wrap gap-5"><Link href="/design-lab">Design Lab</Link><Link href="/contact">Contatti</Link><Link href="/about">Chi siamo</Link></div></div></footer>
 </main>;
}
