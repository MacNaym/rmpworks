import Link from "next/link";
import type { Metadata } from "next";
import { rmpPhone } from "../contact-details";
export const metadata:Metadata={
 title:"Founder 50 € + IVA | RMP Creator Studio",
 description:"RMP Creator Studio Founder: attivazione assistita per creator indipendenti. Una pagina a tuo marchio, una risorsa gratuita e il primo prodotto digitale."
};
const frame="mx-auto max-w-[1240px] px-5 md:px-12";
const included=[
 "Pagina pubblica personalizzata con il tuo marchio",
 "Spazio sul sottodominio del tuo canale",
 "Un lead magnet semplice: guida o quiz base",
 "Un primo microprodotto digitale concordato",
 "Preparazione del percorso per pagamento e consegna",
 "Una revisione e istruzioni per il lancio"
];
const excluded=["Corsi video completi e prodotti premium","Pubblicità, gestione del canale o vendite garantite","Produzione illimitata di materiali e sviluppi su misura","Supporto o automazioni AI illimitati"];
const faq=[
 ["È già pronto tutto?","No. Founder è una prevendita di attivazione assistita. Definiamo insieme materiali, attività e data di consegna prima del pagamento."],
 ["Devo avere già un corso?","No. Iniziamo da un prodotto piccolo, costruito con la tua competenza. Tu validi contenuti e materiali."],
 ["Come funzionano le quote?","Il modello proposto è 80% al creator e 20% a RMP Works sui ricavi netti definiti nel contratto. Imposte, commissioni e rimborsi verranno specificati prima dell'attivazione."],
 ["Garantite vendite?","No. Mettiamo a disposizione struttura e supporto concordato, non numeri di visualizzazioni o guadagni garantiti."],
 ["Posso pagare subito?","Non ancora: prima raccogliamo le richieste e comunichiamo condizioni, tempi e modalità di pagamento verificata."]
];
export default function CreatorStudio(){
 return <main className="min-h-screen overflow-hidden bg-[#f7f1e5] text-[#111]">
   <header className="border-b-[4px] border-black"><div className={frame+" flex min-h-20 flex-wrap items-center justify-between gap-4 py-3"}><Link href="/" className="bg-black px-3 py-2 text-xl font-black tracking-[-.08em] text-white">RMP/WORKS.</Link><Link href="/" className="text-xs font-black uppercase underline decoration-[3px] underline-offset-8">← Torna al sito</Link></div></header>
   <section className={frame+" py-14 sm:py-24"}>
     <p className="inline-block -rotate-2 border-[3px] border-black bg-[#faff4e] px-5 py-3 text-xs font-black uppercase shadow-[5px_5px_0_#111]">Offerta Founder · 20–30 novembre 2026</p>
     <div className="mt-11 grid items-start gap-12 lg:grid-cols-[1.15fr_.85fr]">
       <div><h1 className="text-[clamp(3.4rem,7.5vw,8.5rem)] font-black uppercase leading-[.85] tracking-[-.09em]">FAI IL<br/>PRIMO<br/><span className="text-[#ee4f32]">PASSO.</span></h1><p className="mt-9 max-w-2xl text-xl font-bold leading-snug">La tua competenza merita qualcosa di più di un link nella descrizione.</p><p className="mt-5 max-w-xl text-base leading-8">Progettiamo il tuo primo prodotto digitale, con una pagina a tuo nome e un percorso di vendita chiaro. Senza dover costruire la tecnologia da zero.</p></div>
       <div className="border-[4px] border-black bg-[#faff4e] p-7 shadow-[11px_11px_0_#111] sm:p-10">
         <p className="text-xs font-black uppercase tracking-[.2em]">Prezzo di lancio proposto / una tantum</p>
         <p className="mt-9 text-[clamp(4.5rem,9vw,8rem)] font-black leading-none tracking-[-.1em]">50 €</p>
         <p className="mt-2 text-xl font-black">+ IVA applicabile</p>
         <div className="my-9 border-t-[3px] border-black pt-6"><p className="text-base font-bold">Prezzo ordinario pianificato: 169 € + IVA dal 1° dicembre 2026.</p><p className="mt-3 text-sm leading-6">Non è uno sconto su un prezzo precedente: è una proposta Founder in fase di prevendita, soggetta alle condizioni definitive.</p></div>
         <a href={rmpPhone.href} className="inline-flex w-full justify-center border-[3px] border-black bg-black px-6 py-5 text-center text-sm font-black uppercase text-white transition hover:bg-[#f25436] hover:text-black">Parliamo del tuo canale ↗</a>
         <p className="mt-5 text-xs font-semibold leading-6">Nessun pagamento su questa pagina. Prima dell&apos;attivazione riceverai condizioni, ambito e tempistiche.</p>
       </div>
     </div>
   </section>
   <section className="bg-[#111] py-20 text-white"><div className={frame}>
     <p className="font-mono text-xs font-black uppercase tracking-[.24em] text-[#faff4e]">Il pacchetto è concreto.</p>
     <h2 className="mt-4 text-[clamp(2.9rem,6vw,6rem)] font-black uppercase leading-[.9] tracking-[-.08em]">COSA<br/>COSTRUIAMO.</h2>
     <div className="mt-12 grid border-[3px] border-white sm:grid-cols-2">{included.map((x,i)=><div key={x} className={`flex gap-5 border-b-[2px] border-white/70 p-6 sm:p-8 ${i%2===0?"sm:border-r-[2px]":""}`}><span className="font-mono text-lg font-bold text-[#faff4e]">{String(i+1).padStart(2,"0")}</span><p className="text-lg font-bold leading-snug">{x}</p></div>)}</div>
     <p className="mt-6 text-sm leading-7 text-white/75">Il creator mette a disposizione contenuti, competenze e approvazioni. Lavoriamo su uno scope concordato.</p>
   </div></section>
   <section className={frame+" grid gap-12 py-20 lg:grid-cols-2"}>
     <div><h2 className="text-4xl font-black uppercase tracking-[-.065em] sm:text-6xl">COME SI PARTE.</h2><ol className="mt-9 space-y-5 border-l-[4px] border-black pl-6 font-bold leading-7"><li>01 / Raccontaci il tuo canale e il tuo pubblico.</li><li>02 / Concordiamo il primo prodotto e i materiali necessari.</li><li>03 / Ricevi per iscritto attività, condizioni e data di consegna.</li><li>04 / Confermiamo insieme l&apos;attivazione.</li></ol></div>
     <div className="border-[4px] border-black bg-white p-8"><h2 className="text-3xl font-black uppercase tracking-tight">COSA RESTA FUORI.</h2><ul className="mt-7 space-y-4 text-sm font-semibold leading-7">{excluded.map(x=><li key={x} className="border-b-[2px] border-black/20 pb-4">× {x}</li>)}</ul></div>
   </section>
   <section className="border-t-[4px] border-black bg-[#faff4e] py-20"><div className={frame}>
     <h2 className="text-4xl font-black uppercase tracking-[-.06em] sm:text-6xl">LE DOMANDE GIUSTE.</h2>
     <div className="mt-9 border-t-[3px] border-black">{faq.map(([q,a])=><article key={q} className="grid gap-3 border-b-[3px] border-black py-7 md:grid-cols-[.9fr_1.1fr]"><h3 className="text-xl font-black uppercase">{q}</h3><p className="max-w-2xl text-sm font-semibold leading-7">{a}</p></article>)}</div>
     <div className="mt-12 flex flex-wrap items-center justify-between gap-6"><p className="max-w-md text-xl font-black">Hai una community? Iniziamo a capire che prodotto potremmo creare.</p><Link href="/contact" className="border-[3px] border-black bg-black px-8 py-5 text-sm font-black uppercase text-white shadow-[7px_7px_0_#f25436]">Contattaci ↗</Link></div>
   </div></section>
   <footer className="bg-[#111] py-10 text-white"><div className={frame+" flex flex-wrap justify-between gap-5 text-sm font-bold"}><Link href="/">RMP/WORKS.</Link><span>© 2026 · Creator Studio</span><Link href="/contact">Contatti</Link></div></footer>
 </main>;
}
