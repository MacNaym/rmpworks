import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laboratorio grafico | RMP Creator Studio",
  description: "Cinque proposte di direzione visiva per il portale RMP Creator Studio, in confronto sullo stesso contenuto.",
  robots: { index: false, follow: false },
};

const options = [
  { id: "editorial", n: "01", name: "Editorial Studio", note: "Tipografia editoriale · rivista creativa · raffinato" },
  { id: "brutalist", n: "02", name: "Neo Brutalist", note: "Contrasti forti · titoli monumentali · energia" },
  { id: "control", n: "03", name: "Creator Control", note: "Dark pro · atmosfera studio · dashboard" },
  { id: "analog", n: "04", name: "Analog Workshop", note: "Carta · collage · caloroso · artigianale" },
  { id: "swiss", n: "05", name: "Swiss System", note: "Griglia rigorosa · leggibilità · precisione" },
];

function Editorial() {
  return <section id="editorial" className="scroll-mt-12 overflow-hidden bg-[#f1eee6] text-[#1f261e]">
    <div className="mx-auto max-w-[1440px] px-6 py-7 md:px-14">
      <div className="flex items-center justify-between border-b border-[#34402e] pb-4 text-[11px] font-bold uppercase tracking-[.22em]"><span>RMP / CREATOR STUDIO</span><span>AN INDEPENDENT CREATOR BUSINESS LAB — 2026</span></div>
      <div className="grid gap-12 py-20 lg:grid-cols-[1.55fr_.45fr] lg:py-28">
        <div><span className="font-serif text-lg italic">Per chi ha qualcosa da insegnare.</span><h2 className="mt-6 font-serif text-[clamp(4.8rem,10vw,10.8rem)] leading-[.82] tracking-[-.075em]">Il tuo<br/><i>pubblico.</i><br/>Il tuo futuro.</h2></div>
        <div className="flex flex-col justify-end"><span className="mb-6 block h-[2px] w-16 bg-[#657658]"/><p className="max-w-sm text-lg leading-relaxed">Un canale non è soltanto un algoritmo. È una comunità. Costruiamo insieme prodotti che vale la pena acquistare.</p><Link href="/creator-studio" className="mt-9 inline-flex w-fit items-center gap-6 border-b border-[#263523] pb-2 text-sm font-bold uppercase tracking-wider">Esplora il programma <span>↗</span></Link></div>
      </div>
      <div className="grid border-t border-[#34402e] py-5 text-xs font-bold uppercase tracking-[.15em] md:grid-cols-3"><span>01 / Strategia</span><span>02 / Prodotto</span><span>03 / Mercato</span></div>
    </div>
  </section>;
}

function Brutalist() {
  return <section id="brutalist" className="scroll-mt-12 overflow-hidden bg-[#f5f1e8] text-black">
    <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-5 md:px-12">
      <div className="flex items-center justify-between border-b-[3px] border-black pb-4 text-xs font-black tracking-tight"><span className="rounded-full bg-black px-4 py-2 text-white">RMP WORKS®</span><span>CREATOR ECONOMY / NO BULLSHIT</span></div>
      <div className="relative py-14 md:py-20"><p className="mb-8 w-fit border-2 border-black bg-[#e7ff4e] px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[5px_5px_0_#000]">Non aspettare un milione di follower</p>
        <h2 className="text-[clamp(4rem,11vw,11rem)] font-black uppercase leading-[.82] tracking-[-.095em]">FAI VIDEO.<br/><span className="text-[#fc4b28]">VENDI</span><br/>IDEe.</h2>
        <div className="mt-14 flex flex-wrap items-end justify-between gap-8 border-t-[3px] border-black pt-7"><p className="max-w-lg text-xl font-bold leading-tight">Hai una nicchia. Noi realizziamo gli strumenti per monetizzarla. La tua prossima entrata inizia da un prodotto.</p><Link href="/creator-studio" className="border-2 border-black bg-[#e7ff4e] px-7 py-4 text-sm font-black uppercase shadow-[7px_7px_0_#000] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_#000]">Entra nel programma ↗</Link></div>
      </div>
      <div className="grid border-t-[3px] border-black pt-4 text-xs font-black uppercase md:grid-cols-3"><span>LEAD</span><span>PRODOTTI</span><span>INCASSI</span></div>
    </div>
  </section>;
}

function Control() {
  return <section id="control" className="scroll-mt-12 overflow-hidden bg-[#090c12] text-[#f5f7fd]">
    <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-14">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#2b3345] pb-5 font-mono text-xs tracking-[.12em]"><span>RMP<span className="text-[#5dffcd]">●</span> CREATOR STUDIO</span><span className="text-[#8e9aab]">SYSTEM STATUS: READY FOR IDEAS</span></div>
      <div className="grid gap-14 py-20 lg:grid-cols-[1.1fr_.9fr] lg:py-28">
        <div><p className="mb-7 font-mono text-xs font-semibold uppercase tracking-[.18em] text-[#5dffcd]">/ FOR THE NEXT GENERATION OF CREATORS</p><h2 className="text-[clamp(4.4rem,8vw,8rem)] font-semibold leading-[.92] tracking-[-.075em]">Build your<br/><span className="text-[#5dffcd]">creator</span><br/>business.</h2><p className="mt-9 max-w-xl text-lg leading-relaxed text-[#a9b4c5]">Contenuti, community, prodotti digitali. Tutto quello che ti serve per passare da creator a piccolo imprenditore.</p><Link href="/creator-studio" className="mt-9 inline-flex rounded-md bg-[#5dffcd] px-7 py-4 text-sm font-bold text-[#07120e]">Attiva Creator Studio →</Link></div>
        <div className="self-center border border-[#364052] bg-[#101725] p-4 shadow-[0_0_60px_#38ecb218] md:p-6"><div className="flex items-center justify-between border-b border-[#344052] pb-4 font-mono text-xs"><span>CREATOR / OVERVIEW</span><span className="text-[#5dffcd]">● DEMO</span></div><div className="grid grid-cols-2 gap-3 py-5"><div className="bg-[#182336] p-5"><p className="font-mono text-xs text-[#93a3ba]">LEAD MAGNET</p><p className="mt-5 text-3xl font-semibold">01</p><p className="mt-2 text-xs text-[#5dffcd]">Primo passo</p></div><div className="bg-[#182336] p-5"><p className="font-mono text-xs text-[#93a3ba]">PRODUCTS</p><p className="mt-5 text-3xl font-semibold">03</p><p className="mt-2 text-xs text-[#5dffcd]">Roadmap</p></div></div><div className="border-t border-[#344052] pt-5"><div className="flex justify-between font-mono text-xs text-[#93a3ba]"><span>MONETIZATION ROADMAP</span><span>4 STEPS</span></div><div className="mt-4 flex h-3 gap-1">{[1,2,3,4].map(n=><div key={n} className={`h-full flex-1 ${n===1?"bg-[#5dffcd]":"bg-[#344052]"}`}/>)}</div></div></div>
      </div>
      <p className="border-t border-[#2b3345] pt-5 font-mono text-xs text-[#738198]">STRATEGY / DELIVERY / GROWTH — VISUAL DEMO ONLY</p>
    </div>
  </section>;
}

function Analog() {
  return <section id="analog" className="scroll-mt-12 overflow-hidden bg-[#f3dcc2] text-[#312c28]">
    <div className="mx-auto max-w-[1440px] px-5 py-9 md:px-14">
      <div className="flex flex-wrap items-center justify-between gap-4"><span className="rotate-[-2deg] border-2 border-[#312c28] bg-[#f8eee2] px-4 py-2 font-serif text-2xl font-bold">rmp works / studio</span><span className="text-xs font-extrabold uppercase tracking-[.16em]">Indipendenti, non improvvisati.</span></div>
      <div className="relative grid gap-12 py-20 lg:grid-cols-[1.3fr_.7fr] lg:items-center">
        <div><p className="mb-5 w-fit -rotate-2 bg-[#fb6a4e] px-4 py-2 text-sm font-black uppercase">A piccoli creator con grandi idee</p><h2 className="font-serif text-[clamp(4.7rem,9vw,9.5rem)] font-black leading-[.88] tracking-[-.075em]">Le tue idee<br/>meritano<br/><i>uno shop.</i></h2><p className="mt-7 max-w-xl text-xl leading-relaxed">Il tuo pubblico ti segue per qualcosa. Creiamo insieme qualcosa di utile che possa anche comprare.</p><Link href="/creator-studio" className="mt-9 inline-flex -rotate-2 bg-[#312c28] px-8 py-4 text-sm font-bold uppercase tracking-wide text-white shadow-[7px_7px_0_#fb6a4e]">Facciamolo insieme ↗</Link></div>
        <div className="relative mx-auto h-[360px] w-full max-w-[420px]"><div className="absolute inset-x-8 top-5 rotate-[8deg] border-2 border-[#312c28] bg-[#eab184] p-8 shadow-[10px_12px_0_#b78a6b]"><p className="text-xs font-black uppercase tracking-wider">THE CREATOR PLAN</p><p className="mt-10 font-serif text-5xl font-bold leading-tight">Publish.<br/>Build.<br/>Sell.</p><div className="mt-9 h-2 bg-[#312c28]"/></div><div className="absolute bottom-0 left-0 -rotate-[11deg] border-2 border-[#312c28] bg-[#fff0a1] px-6 py-5 text-lg font-black shadow-[5px_5px_0_#312c28]">made with you ♥</div></div>
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t-2 border-[#312c28] pt-4 text-xs font-bold uppercase tracking-widest"><span>01 / Scopri</span><span>02 / Crea</span><span>03 / Lancia</span></div>
    </div>
  </section>;
}

function Swiss() {
  return <section id="swiss" className="scroll-mt-12 overflow-hidden bg-[#fafafa] text-[#111111]">
    <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-14">
      <div className="grid grid-cols-2 border-y-2 border-black py-4 text-xs font-bold uppercase tracking-[.13em] md:grid-cols-4"><span>RMP WORKS</span><span>CREATOR SYSTEMS</span><span className="hidden md:block">EDITION 01/26</span><span className="text-right">ITALIA ↗</span></div>
      <div className="grid gap-10 py-16 lg:grid-cols-[1.4fr_.6fr] lg:py-24"><div><p className="mb-9 text-xs font-bold uppercase tracking-[.18em] text-[#e22a25]">A / CREATOR BUSINESS</p><h2 className="text-[clamp(4.4rem,9vw,9.5rem)] font-bold leading-[.86] tracking-[-.09em]">Dal video<br/>al <span className="text-[#e22a25]">valore.</span></h2></div><div className="flex flex-col justify-end"><p className="max-w-sm text-2xl font-medium leading-tight">Costruiamo prodotti digitali per persone che hanno già qualcosa di interessante da dire.</p><Link href="/creator-studio" className="mt-8 flex items-center justify-between border-t-2 border-black pt-3 text-sm font-bold uppercase tracking-wider">SCOPRI CREATOR STUDIO <span>↗</span></Link></div></div>
      <div className="grid border-t-2 border-black md:grid-cols-3">{[{n:"01",t:"Analizziamo",d:"Pubblico e competenze"},{n:"02",t:"Realizziamo",d:"Primo prodotto e funnel"},{n:"03",t:"Distribuiamo",d:"Link e contenuti"}].map(s=><div key={s.n} className="border-b-2 border-black px-3 py-7 md:border-r-2 md:px-5 md:last:border-r-0"><span className="text-xs font-bold text-[#e22a25]">{s.n}</span><h3 className="mt-5 text-3xl font-bold tracking-tight">{s.t}</h3><p className="mt-2 text-sm text-[#555]">{s.d}</p></div>)}</div>
    </div>
  </section>;
}

export default function DesignLab() {
  return <main className="bg-[#171717]">
    <div className="sticky top-0 z-20 border-b border-white/20 bg-[#171717]/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-5 py-4"><div><Link href="/" className="text-xs font-bold tracking-[.2em]">← RMP WORKS</Link><p className="mt-1 text-xs text-white/50">Laboratorio grafico / bozza riservata</p></div><nav aria-label="Varianti grafiche" className="flex flex-wrap gap-2">{options.map(o=><a key={o.id} href={`#${o.id}`} className="rounded-full border border-white/30 px-3 py-2 text-xs font-semibold hover:bg-white hover:text-black">{o.n} / {o.name}</a>)}</nav></div>
    </div>
    <div className="mx-auto max-w-[1440px] px-5 py-10 text-white"><p className="text-xs font-bold uppercase tracking-[.2em] text-white/50">Confronto stilistico — stessi obiettivi, linguaggi differenti</p><h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Cinque personalità. Un solo RMP Works.</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-white/65">Non sono template acquistati, ma concept di homepage sviluppati per confronto. Tutti i dati sono illustrativi; nessuna funzionalità di vendita è attiva.</p></div>
    <div className="space-y-8 pb-16">{options.map((o,i)=><div key={o.id}><div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-2 px-5 pb-3 text-xs text-white/65"><span className="font-bold text-white">{o.n} / {o.name}</span><span>{o.note}</span></div>{i===0?<Editorial/>:i===1?<Brutalist/>:i===2?<Control/>:i===3?<Analog/>:<Swiss/>}</div>)}</div>
  </main>;
}
