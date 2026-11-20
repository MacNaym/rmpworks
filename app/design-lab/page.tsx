import Link from "next/link";
import type { Metadata } from "next";
import { Marquee } from "@/components/velora/marquee";
import { DesignTweaks } from "./tweaks";

export const metadata: Metadata = {
  title: "Laboratorio Neo Brutalism | RMP Works",
  description: "Tre proposte di design Neo Brutalist per RMP Creator Studio: Punch, Underground e Studio Press.",
  robots: { index: false, follow: false },
};

const strips=["CREA","PUBBLICA","MONETIZZA","IMPARA","RIPETI"];
const features=[
  {number:"01",title:"Conosci il tuo pubblico",detail:"Partiamo dalle domande che ricevi già, non da idee inventate."},
  {number:"02",title:"Costruiamo il primo prodotto",detail:"Una risorsa gratuita, poi qualcosa per cui valga la pena pagare."},
  {number:"03",title:"Lo metti online",detail:"Tu presenti il prodotto. Noi prepariamo il percorso tecnico."},
];
function VariantHeader({n,name,position}:{n:string,name:string,position:string}) {
 return <div className="mx-auto flex max-w-[1500px] flex-wrap items-baseline justify-between gap-2 px-5 pb-4 pt-8 text-xs font-semibold text-white/70 md:px-12"><span className="text-white">CONCEPT {n} / {name}</span><span>{position}</span></div>;
}
function StencilPunch(){
 return <section id="punch" className="scroll-mt-20 bg-[#f6f1e7] text-[#11110f]">
   <div className="mx-auto max-w-[1500px] px-5 py-5 md:px-12">
     <header className="flex items-center justify-between gap-3 border-b-[5px] border-black pb-5"><span className="bg-black px-3 py-2 text-xl font-black tracking-[-.06em] text-white sm:text-2xl">RMP/WORKS.</span><span className="hidden text-xs font-black uppercase tracking-[.22em] sm:block">Creator business department</span><span className="rounded-full border-2 border-black bg-[#faff4e] px-4 py-2 text-xs font-black">ED. 001</span></header>
     <div className="grid border-b-[5px] border-black lg:grid-cols-[1.38fr_.62fr]">
       <div className="relative overflow-hidden border-black py-14 lg:border-r-[5px] lg:py-20">
         <p className="mb-8 inline-block -rotate-2 border-[3px] border-black bg-[#ff7351] px-5 py-3 text-sm font-black uppercase shadow-[5px_5px_0_#111]">Basta lavorare gratis per l'algoritmo.</p>
         <h2 className="max-w-5xl text-[clamp(5.5rem,12vw,12.8rem)] font-black uppercase leading-[.78] tracking-[-.12em]">IL TUO<br/>CANALE.<br/><span className="text-[#fa5135]">IL TUO</span><br/>BUSINESS.</h2>
         <p className="mt-12 max-w-2xl text-xl font-bold leading-[1.28] md:text-2xl">Trasforma quello che insegni in prodotti digitali acquistabili dalla tua community.</p>
         <Link href="/creator-studio" className="mt-9 inline-flex border-[3px] border-black bg-[#faff4e] px-8 py-5 text-sm font-black uppercase tracking-wide shadow-[7px_7px_0_#111] transition-transform hover:-translate-y-1">Scopri Founder ↗</Link>
       </div>
       <aside className="flex flex-col justify-between border-t-[5px] border-black bg-[#faff4e] p-7 lg:border-t-0 lg:p-10">
         <div><p className="text-xs font-black uppercase tracking-[.25em]">Qui non vendiamo follower.</p><div className="my-12 -rotate-[7deg] border-[5px] border-black bg-white p-7 shadow-[12px_12px_0_#111]"><p className="text-sm font-black uppercase">Il tuo primo prodotto</p><p className="mt-8 text-6xl font-black leading-[.9] tracking-tight">È ORA<br/>DI FARLO.</p><p className="mt-7 text-xs font-bold uppercase tracking-widest">Ideato insieme. Venduto da te.</p></div></div>
         <p className="text-base font-bold leading-relaxed">Creiamo una pagina, un primo prodotto e un percorso di vendita. Senza aprire un'agenzia né imparare a programmare.</p>
       </aside>
     </div>
     <div className="border-b-[5px] border-black py-5"><Marquee repeat={3} fade={false} className="[--duration:28s] [--gap:2.5rem]">{strips.map(x=><span key={x} className="whitespace-nowrap text-xl font-black uppercase italic tracking-tight">✳ {x}</span>)}</Marquee></div>
   </div>
 </section>;
}
function Underground(){
 return <section id="underground" className="scroll-mt-20 overflow-hidden bg-[#111111] text-[#f6f3eb]">
  <div className="mx-auto max-w-[1500px] px-5 py-5 md:px-12">
   <header className="flex items-center justify-between gap-4 border-b-2 border-[#f6f3eb] py-5 font-mono text-xs font-bold uppercase tracking-wider"><span>RMP® / UNDERGROUND</span><span>NO GURU. NO SHORTCUTS.</span></header>
   <div className="relative py-16 md:py-24">
     <div className="absolute right-0 top-12 hidden -rotate-12 border-2 border-[#f6f3eb] px-5 py-3 font-mono text-xs font-black uppercase lg:block">Per creator indipendenti ↗</div>
     <p className="mb-9 font-mono text-xs font-bold uppercase tracking-[.28em] text-[#c6fa35]">Questa è la parte che viene dopo il video</p>
     <h2 className="max-w-[1300px] text-[clamp(5rem,11vw,12rem)] font-black uppercase leading-[.79] tracking-[-.11em]">VIEWS<br/><span className="text-[#c6fa35]">NON</span> PAGANO<br/>LE BOLLETTE.</h2>
     <div className="mt-14 flex flex-wrap items-end justify-between gap-10 border-t-2 border-[#f6f3eb] pt-9">
       <p className="max-w-2xl text-xl font-semibold leading-[1.4] md:text-2xl">Le visualizzazioni sono un inizio. Una guida, un corso, uno strumento fatto bene possono diventare una fonte di ricavi. Ti aiutiamo a crearli.</p>
       <Link href="/creator-studio" className="inline-flex shrink-0 border-2 border-[#c6fa35] bg-[#c6fa35] px-9 py-5 text-sm font-black uppercase text-black transition hover:bg-transparent hover:text-[#c6fa35]">Costruiamo il prodotto ↗</Link>
     </div>
   </div>
   <div className="grid border-y-2 border-[#f6f3eb] md:grid-cols-[1fr_1fr_1fr]">{features.map((f,i)=><div key={f.number} className={`border-b-2 border-[#f6f3eb] p-7 md:border-b-0 ${i!==2?"md:border-r-2":""}`}><span className="font-mono text-xs font-bold text-[#c6fa35]">{f.number} / PROCESS</span><h3 className="mt-8 text-3xl font-black uppercase leading-none">{f.title}</h3><p className="mt-5 text-sm leading-7 text-[#bdbdb5]">{f.detail}</p></div>)}</div>
   <div className="py-6 text-center font-mono text-xs uppercase tracking-[.2em] text-[#c6fa35]">NON PROMETTIAMO SOLDI FACILI. COSTRUIAMO PRODOTTI VERI.</div>
  </div>
 </section>;
}
function StudioPress(){
 return <section id="press" className="scroll-mt-20 overflow-hidden bg-[#f8f5ed] text-[#13212b]">
   <div className="mx-auto max-w-[1500px] px-5 py-5 md:px-12">
     <header className="flex flex-wrap items-center justify-between gap-4 border-b-[3px] border-[#13212b] py-5"><span className="text-2xl font-black tracking-[-.09em]">RMP<span className="text-[#e93b2e]">/</span>WORKS</span><div className="flex gap-6 text-xs font-black uppercase tracking-wider"><span>Laboratorio</span><span>Creator Studio</span><span>2026</span></div></header>
     <div className="grid min-h-[690px] lg:grid-cols-[.95fr_1.05fr]">
       <div className="flex flex-col justify-between border-b-[3px] border-[#13212b] py-16 lg:border-b-0 lg:border-r-[3px] lg:pr-12">
         <div><p className="mb-9 text-xs font-black uppercase tracking-[.24em] text-[#e93b2e]">Il prossimo capitolo del tuo canale</p><h2 className="max-w-3xl text-[clamp(5rem,9vw,9.5rem)] font-black uppercase leading-[.83] tracking-[-.105em]">CREI.<br/>INSEGNI.<br/><span className="text-[#e93b2e]">VENDI.</span></h2></div>
         <div><p className="max-w-xl text-lg font-semibold leading-relaxed">Hai già qualcosa che interessa alle persone. Prepariamo il tuo spazio per trasformarlo in un prodotto digitale.</p><Link href="/creator-studio" className="mt-8 inline-flex items-center gap-6 border-b-[3px] border-[#13212b] pb-3 text-sm font-black uppercase">Vedi come funziona <span className="text-xl">↗</span></Link></div>
       </div>
       <div className="relative flex flex-col justify-between bg-[#e93b2e] p-7 text-[#171b1e] md:p-12">
         <div className="flex justify-between border-b-2 border-[#171b1e] pb-5 text-xs font-black uppercase tracking-widest"><span>Un sistema per piccoli creator</span><span>ISSUE #001</span></div>
         <div className="relative my-12"><div className="mx-auto max-w-md rotate-[-4deg] border-[3px] border-[#171b1e] bg-[#fff8e9] p-7 shadow-[14px_15px_0_#171b1e]"><p className="text-xs font-black uppercase tracking-widest">LA TUA LINEA DI PRODOTTI</p><p className="mt-10 text-5xl font-black uppercase leading-[.93] tracking-[-.065em]">Gratis.<br/>Accessibile.<br/>Completa.</p><div className="mt-10 flex flex-col gap-2 border-t-2 border-[#171b1e] pt-5 font-mono text-xs font-bold"><span>01 / LEAD MAGNET</span><span>02 / PRIMO PRODOTTO</span><span>03 / PERCORSO PREMIUM</span></div></div></div>
         <p className="max-w-lg text-sm font-bold leading-relaxed">Il processo è collaborativo. I contenuti devono riflettere la tua competenza; noi ne curiamo struttura, esperienza e distribuzione.</p>
       </div>
     </div>
     <div className="flex flex-wrap justify-between gap-3 border-t-[3px] border-[#13212b] py-5 text-xs font-black uppercase tracking-widest"><span>Focus sui contenuti</span><span>Prodotti a tuo nome</span><span>Supporto tecnico</span></div>
   </div>
 </section>;
}

const designs=[
 {id:"punch",num:"A",name:"Stencil Punch",note:"Giallo acido, rosso, manifesto grafico. Il più immediato per la campagna Black Friday."},
 {id:"underground",num:"B",name:"Underground Creator",note:"Bianco, nero e lime. Più duro e radicale, particolarmente adatto al mondo YouTube."},
 {id:"press",num:"C",name:"Studio Press",note:"Rosso editoriale, carta, struttura. Più leggibile e sostenibile come identità di lungo periodo."},
];
export default function DesignLab(){
 return <main className="min-h-screen bg-[#171717]">
  <DesignTweaks />
  <div className="sticky top-0 z-30 border-b border-white/25 bg-[#171717]/95 text-white backdrop-blur">
   <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4 px-5 py-4 md:px-12"><Link href="/" className="text-xs font-black tracking-[.2em]">← RMP WORKS</Link><nav className="flex flex-wrap gap-2" aria-label="Varianti Neo Brutalist">{designs.map(d=><a key={d.id} href={`#${d.id}`} className="border border-white/30 px-3 py-2 text-xs font-bold uppercase hover:bg-[#faff4e] hover:text-black">{d.num}: {d.name}</a>)}</nav></div>
  </div>
  <div className="mx-auto max-w-[1500px] px-5 pb-12 pt-14 text-white md:px-12"><p className="font-mono text-xs font-bold uppercase tracking-[.22em] text-[#faff4e]">RMP / DESIGN EXPLORATION / 02</p><h1 className="mt-5 text-4xl font-black uppercase leading-none tracking-[-.06em] sm:text-6xl">Neo Brutalism.<br/>Tre direzioni.</h1><p className="mt-5 max-w-3xl text-base leading-7 text-white/65">Queste demo seguono la skill anti-slop installata e utilizzano un componente Velora UI. Non sono pagine finali, né includono testimonianze inventate. Scegliamo la personalità che meglio rappresenta RMP Creator Studio.</p></div>
  <div className="space-y-12 pb-20">
   <div><VariantHeader n="A" name="Stencil Punch" position={designs[0].note}/><StencilPunch/></div>
   <div><VariantHeader n="B" name="Underground Creator" position={designs[1].note}/><Underground/></div>
   <div><VariantHeader n="C" name="Studio Press" position={designs[2].note}/><StudioPress/></div>
  </div>
 </main>;
}