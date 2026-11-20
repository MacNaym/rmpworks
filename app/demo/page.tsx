import Link from "next/link";
import type {Metadata} from "next";
import SampleQuiz from "./SampleQuiz";
import {PageShell,HeroMeta,frame,eyebrow,textButton} from "../_components/EditorialShell";
export const metadata:Metadata={title:"Demo Creator Studio | RMP Works",description:"Prova una demo interattiva illustrativa di un sito per creator con lead magnet, quiz e scala prodotti digitali. Nessun acquisto reale.",robots:{index:false,follow:false}};
const offers=[
 {n:"01",name:"CHECKLIST LUCE",price:"0 €",details:"Una risorsa gratuita utile da usare già oggi.",tag:"LEAD MAGNET"},
 {n:"02",name:"7 GIORNI DI FOTO",price:"9 €",details:"Un micropercorso pratico per trasformare un problema in una piccola abitudine.",tag:"ENTRY PRODUCT"},
 {n:"03",name:"IL METODO COMPLETO",price:"49 €",details:"Una raccolta strutturata di esercizi, esempi e guide approfondite.",tag:"NEXT STEP"},
 {n:"04",name:"LAB AVANZATO",price:"249 €",details:"Un possibile prodotto premium da creare solo con contenuti ed expertise verificati.",tag:"FUTURE IDEA"},
];
export default function DemoPage(){
 return <PageShell>
  <div className="border-b-2 border-black bg-[#171615] px-5 py-3 text-center font-mono text-[10px] font-black uppercase tracking-[.13em] text-white">QUESTO È UN ESEMPIO DIMOSTRATIVO. IL BRAND, IL CREATOR E I PRODOTTI SONO FITTIZI. NESSUN ACQUISTO DISPONIBILE.</div>
  <section className={frame+" border-b-2 border-black pb-14 pt-12 sm:pt-16"}>
   <HeroMeta left="Creator Studio / Demo interattiva" right="Nicchia esempio / Fotografia"/>
   <p className={eyebrow+" text-[#e93625]"}>[ CLIENTE DEMO / LUCE RAW ]</p>
   <h1 className="mt-6 text-[clamp(3.4rem,9.6vw,10.6rem)] font-black uppercase leading-[.8] tracking-[-.085em]">FAI FOTO.<br/><span className="text-[#e93625]">VEDI</span> LA LUCE.<br/>CAMBIA TUTTO.</h1>
   <p className="mt-10 max-w-3xl text-xl font-bold leading-snug">Immagina un creator di fotografia che trasforma le domande ricevute nei commenti in esercizi e risorse digitali utili.</p>
   <p className="mt-4 max-w-3xl text-sm leading-7">Questa è una pagina vetrina creata da RMP Works per dimostrare il modello, non un vero negozio e non la pagina di un creator reale.</p>
  </section>
  <section className="grid border-b-2 border-black lg:grid-cols-2">
   <div className="border-b-2 border-black p-7 sm:p-10 lg:border-b-0 lg:border-r-2 lg:p-12">
    <p className={eyebrow+" text-[#e93625]"}>[ FIG. 01 / UN LEAD MAGNET ]</p>
    <h2 className="mt-6 text-[clamp(2.2rem,4.7vw,5.2rem)] font-black uppercase leading-[.92] tracking-[-.06em]">PRIMA<br/>TI AIUTO.<br/><span className="text-[#e93625]">POI TI VENDO.</span></h2>
    <p className="mt-8 max-w-lg text-base leading-8 text-[#353331]">Una risorsa gratuita crea fiducia, permette al pubblico di provare il metodo e può introdurre un prodotto più approfondito, senza promettere risultati impossibili.</p>
    <Link href="/creator-studio" className={textButton+" mt-9"}>VORREI UN SITO COSÌ ↗</Link>
   </div>
   <div className="bg-[#e93625] p-6 sm:p-10 lg:p-12"><SampleQuiz/></div>
  </section>
  <section className={frame+" py-20 sm:py-24"}>
   <p className={eyebrow+" text-[#e93625]"}>[ FIG. 02 / ESEMPIO CATALOGO ]</p>
   <h2 className="mt-5 text-[clamp(3rem,6.5vw,6.8rem)] font-black uppercase leading-[.86] tracking-[-.075em]">UNA SCALA<br/><span className="text-[#e93625]">DI VALORE.</span></h2>
   <p className="mt-6 max-w-2xl text-base leading-7">I prezzi e i prodotti sono puramente illustrativi. Questa demo non raccoglie pagamenti e non simula ordini effettuati.</p>
   <div className="mt-12 grid border-2 border-black md:grid-cols-2 xl:grid-cols-4">{offers.map((o,i)=><article key={o.n} className={"flex min-h-[330px] flex-col p-7 "+(i<3?"border-b-2 border-black xl:border-b-0 ":"")+(i%2===0?"md:border-r-2 xl:border-r-0 ":"")+(i<3?"xl:border-r-2 ":"")}>
     <p className={eyebrow+" text-[#e93625]"}>{o.n} / {o.tag}</p><h3 className="mt-12 text-2xl font-black uppercase tracking-[-.04em]">{o.name}</h3><p className="mt-3 text-4xl font-black">{o.price}</p><p className="mt-5 flex-1 text-sm leading-7 text-[#353331]">{o.details}</p><span className="mt-8 border-t-2 border-black pt-3 font-mono text-xs font-black uppercase">ESEMPIO NON ACQUISTABILE ↗</span>
   </article>)}</div>
  </section>
  <section className="border-t-2 border-black bg-[#171615] py-20 text-white"><div className={frame+" flex flex-wrap items-end justify-between gap-8"}><div><p className={eyebrow+" text-[#ff513c]"}>[ DAL PROTOTIPO AL TUO PROGETTO ]</p><h2 className="mt-5 text-[clamp(3rem,6vw,6rem)] font-black uppercase leading-[.89] tracking-[-.075em]">QUESTO È<br/>L&apos;ESEMPIO.<br/><span className="text-[#ff513c]">IL TUO SARÀ TUO.</span></h2></div><Link href="/contact#richiesta-founder" className="border-2 border-white bg-white px-7 py-5 font-mono text-xs font-black uppercase text-black hover:bg-[#e93625]">RACCONTACI IL TUO CANALE ↗</Link></div></section>
 </PageShell>;
}