import Link from "next/link";
import type { Metadata } from "next";
import { Marquee } from "@/components/velora/marquee";
import { rmpPhone } from "./contact-details";

export const metadata: Metadata = {
 title:"RMP Works | Fai video. Vendi idee.",
 description:"RMP Creator Studio aiuta YouTuber e creator di nicchia a creare il primo prodotto digitale. Scopri l'attivazione Founder.",
 openGraph:{title:"Fai video. Vendi idee. | RMP Works",description:"Dai contenuti ai tuoi primi prodotti digitali, senza montare un e-commerce da solo."}
};
const frame="mx-auto max-w-[1450px] px-5 md:px-12";
const steps=[
 {n:"01",title:"Guardiamo cosa chiedono",copy:"Analizziamo i tuoi video e le domande della community. Troviamo un bisogno per cui creare qualcosa di utile."},
 {n:"02",title:"Realizziamo il prodotto",copy:"Prepariamo uno spazio a tuo marchio, una risorsa gratuita e il primo microprodotto, con la tua approvazione."},
 {n:"03",title:"Lo porti al pubblico",copy:"Condividi il link. Il tuo pubblico scopre il prodotto e segue un percorso semplice verso l'acquisto."}
];
const lineup=[
 {n:"00",title:"Gratis",price:"0 €",copy:"Una guida o un quiz per far conoscere il tuo lavoro."},
 {n:"01",title:"Micro",price:"5–15 €",copy:"Un prodotto piccolo, concreto e facile da provare."},
 {n:"02",title:"Next level",price:"29–79 €",copy:"Uno strumento o percorso più strutturato."},
 {n:"03",title:"Premium",price:"Su misura",copy:"Un corso completo quando avrai qualcosa da insegnare davvero."}
];
const ribbon=["CREATOR STUDIO","PRODOTTI DIGITALI","TU CREI","NOI COSTRUIAMO"];
function OriginalNeoBrutalist() {
  return <section id="neo-brutalist" className="scroll-mt-12 overflow-hidden bg-[#f5f1e8] text-black">
    <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-5 md:px-12">
      <div className="flex items-center justify-between border-b-[3px] border-black pb-4 text-xs font-black tracking-tight"><span className="rounded-full bg-black px-4 py-2 text-white">RMP WORKS®</span><span>CREATOR ECONOMY / NO BULLSHIT</span></div>
      <div className="relative py-14 md:py-20"><p className="mb-8 w-fit border-2 border-black bg-[#e7ff4e] px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[5px_5px_0_#000]">Non aspettare un milione di follower</p>
        <h2 className="text-[clamp(4rem,11vw,11rem)] font-black uppercase leading-[.82] tracking-[-.095em]">FAI VIDEO.<br/><span className="text-[#fc4b28]">VENDI</span><br/>IDEE.</h2>
        <div className="mt-14 flex flex-wrap items-end justify-between gap-8 border-t-[3px] border-black pt-7"><p className="max-w-lg text-xl font-bold leading-tight">Hai una nicchia. Noi realizziamo gli strumenti per monetizzarla. La tua prossima entrata inizia da un prodotto.</p><Link href="/creator-studio" className="border-2 border-black bg-[#e7ff4e] px-7 py-4 text-sm font-black uppercase shadow-[7px_7px_0_#000] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-[3px_3px_0_#000]">Entra nel programma ↗</Link></div>
      </div>
      <div className="grid border-t-[3px] border-black pt-4 text-xs font-black uppercase md:grid-cols-3"><span>LEAD</span><span>PRODOTTI</span><span>INCASSI</span></div>
    </div>
  </section>;
}


export default function Home(){
 return <main className="min-h-screen overflow-hidden bg-[#f5f1e8] text-[#111]">
   <OriginalNeoBrutalist/>
   <section id="metodo" className="mt-16 bg-[#111] py-20 text-white sm:mt-24">
     <div className={frame}>
       <p className="font-mono text-xs font-bold uppercase tracking-[.28em] text-[#e7ff4e]">Non partiamo da un corso di 40 ore.</p>
       <h2 className="mt-5 max-w-5xl text-[clamp(3rem,6vw,6.5rem)] font-black uppercase leading-[.9] tracking-[-.075em]">PARTIAMO DA<br/>QUALCOSA CHE SERVE.</h2>
       <div className="mt-14 grid border-[3px] border-white md:grid-cols-3">{steps.map((s,i)=><article key={s.n} className={`p-7 md:p-9 ${i<2?"border-b-[3px] border-white md:border-b-0 md:border-r-[3px]":""}`}>
          <span className="font-mono text-sm font-black text-[#e7ff4e]">{s.n} / PROCESSO</span>
          <h3 className="mt-8 text-3xl font-black uppercase leading-none tracking-[-.04em]">{s.title}</h3>
          <p className="mt-5 text-sm leading-7 text-[#d3d3ce]">{s.copy}</p>
         </article>)}</div>
     </div>
   </section>
   <section className={frame+" py-20 sm:py-28"} id="prodotti">
     <div className="flex flex-wrap items-start justify-between gap-6"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#e34326]">Un percorso, non un catalogo infinito.</p><h2 className="mt-5 text-[clamp(3rem,6vw,6rem)] font-black uppercase leading-[.9] tracking-[-.07em]">PICCOLO<br/>ALL&apos;INIZIO.<br/>TUO PER DAVVERO.</h2></div><p className="max-w-sm border-l-[5px] border-black pl-5 text-base font-bold leading-7">Questi sono esempi di prodotti e fasce di prezzo, non prezzi obbligatori. Decidiamo insieme cosa ha senso per il tuo pubblico.</p></div>
     <div className="mt-12 grid border-[3px] border-black sm:grid-cols-2 xl:grid-cols-4">{lineup.map((x,i)=><article key={x.n} className={`min-h-64 p-6 ${i!==3?"border-b-[3px] border-black xl:border-b-0 xl:border-r-[3px]":""} ${i===1?"bg-[#e7ff4e]":"bg-[#fffdf8]"} ${i===0?"sm:border-r-[3px]":""} ${i===2?"sm:border-r-[3px]":""} ${i===1?"sm:border-b-[3px] xl:border-b-0":""}`}>
       <p className="font-mono text-xs font-black">RMP / {x.n}</p><h3 className="mt-8 text-2xl font-black uppercase">{x.title}</h3><p className="mt-2 text-4xl font-black tracking-tight">{x.price}</p><p className="mt-6 text-sm leading-6">{x.copy}</p>
     </article>)}</div>
   </section>
   <section className="border-y-[5px] border-black bg-[#fc4b28] py-16">
     <div className={frame+" flex flex-wrap items-center justify-between gap-10"}>
       <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.24em]">Founder / Novembre 2026</p><h2 className="mt-4 text-[clamp(3rem,6vw,6rem)] font-black uppercase leading-[.88] tracking-[-.075em]">IL PRIMO PASSO<br/>COSTA 50 € + IVA.</h2><p className="mt-6 text-base font-bold">Attivazione assistita in prevendita. Prima di qualsiasi pagamento concordiamo condizioni, materiali e tempi.</p></div>
       <Link href="/creator-studio" className="inline-flex border-[4px] border-black bg-[#e7ff4e] px-8 py-5 text-sm font-black uppercase shadow-[8px_8px_0_#111] transition-transform hover:-translate-y-1">Vedi cosa comprende ↗</Link>
     </div>
   </section>
   <footer className="bg-[#111] py-12 text-white">
     <div className={frame+" flex flex-wrap items-center justify-between gap-7"}>
       <div><p className="text-2xl font-black tracking-[-.06em]">RMP/WORKS.</p><p className="mt-2 font-mono text-xs text-white/65">© 2026 · Creator Studio</p></div>
       <div className="flex flex-wrap gap-6 text-sm font-bold"><Link href="/creator-studio">Founder</Link><Link href="/contact">Contatti</Link><a href={rmpPhone.href}>{rmpPhone.display}</a></div>
     </div>
   </footer>
 </main>;
}
