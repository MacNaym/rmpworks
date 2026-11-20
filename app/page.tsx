import Link from "next/link";
import type { Metadata } from "next";
import { Marquee } from "@/components/velora/marquee";
import { rmpPhone } from "./contact-details";

export const metadata: Metadata = {
 title:"RMP Works | Il tuo canale. Il tuo business.",
 description:"RMP Creator Studio aiuta YouTuber e creator di nicchia a creare il primo prodotto digitale. Scopri l'attivazione Founder.",
 openGraph:{title:"Il tuo canale. Il tuo business. | RMP Works",description:"Dai contenuti ai tuoi primi prodotti digitali, senza montare un e-commerce da solo."}
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
export default function Home(){
 return <main className="min-h-screen overflow-hidden bg-[#f7f1e5] text-[#111]">
   <header className="border-b-[4px] border-black">
     <div className={frame+" flex min-h-20 flex-wrap items-center justify-between gap-4 py-3"}>
       <Link href="/" className="bg-black px-3 py-2 text-xl font-black tracking-[-.075em] text-white sm:text-2xl">RMP/WORKS.</Link>
       <nav aria-label="Navigazione" className="flex flex-wrap items-center gap-4 text-xs font-black uppercase sm:gap-7">
         <a href="#metodo" className="hover:underline">Come funziona</a>
         <Link href="/creator-studio" className="hover:underline">Founder</Link>
         <Link href="/contact" className="border-[2px] border-black bg-[#faff4e] px-4 py-3 shadow-[4px_4px_0_#111] transition-transform hover:-translate-y-1">Contattaci ↗</Link>
       </nav>
     </div>
   </header>
   <section className={frame}>
     <div className="grid border-x-[4px] border-b-[4px] border-black lg:grid-cols-[1.36fr_.64fr]">
       <div className="px-5 pb-14 pt-14 sm:px-9 lg:border-r-[4px] lg:border-black lg:py-20">
         <p className="mb-8 inline-block -rotate-2 border-[3px] border-black bg-[#ff7456] px-4 py-3 text-xs font-black uppercase shadow-[5px_5px_0_#111] sm:text-sm">Per creator che vogliono costruire qualcosa di loro.</p>
         <h1 className="text-[clamp(3.55rem,8.2vw,9rem)] font-black uppercase leading-[.85] tracking-[-.105em]">IL TUO<br/>CANALE.<br/><span className="text-[#f25535]">IL TUO</span><br/>BUSINESS.</h1>
         <p className="mt-11 max-w-[660px] text-lg font-bold leading-snug sm:text-2xl">Hai già un pubblico che ti ascolta. Ti aiutiamo a creare qualcosa che possa acquistare.</p>
         <p className="mt-5 max-w-2xl text-sm leading-7 sm:text-base">Dall&apos;idea al primo prodotto digitale: pagina personalizzata, risorsa gratuita e percorso di vendita. Tu porti la competenza. Noi la struttura.</p>
         <div className="mt-9 flex flex-wrap gap-4">
           <Link href="/creator-studio" className="inline-flex min-h-14 items-center justify-center border-[3px] border-black bg-[#faff4e] px-6 py-4 text-sm font-black uppercase shadow-[6px_6px_0_#111] transition-transform hover:-translate-y-1">Scopri l&apos;offerta Founder ↗</Link>
           <a href="#metodo" className="inline-flex min-h-14 items-center border-b-[3px] border-black px-3 py-4 text-sm font-black uppercase">Come funziona ↓</a>
         </div>
       </div>
       <aside className="flex flex-col justify-between border-t-[4px] border-black bg-[#faff4e] px-6 py-12 lg:border-t-0 lg:px-9">
         <p className="text-xs font-black uppercase tracking-[.2em]">RMP creator studio / edizione 001</p>
         <div className="mx-auto my-12 w-full max-w-[400px] -rotate-[5deg] border-[4px] border-black bg-white p-6 shadow-[11px_12px_0_#111] sm:p-9">
           <p className="text-xs font-black uppercase tracking-widest">Il prodotto che ancora non hai lanciato</p>
           <p className="mt-9 text-[clamp(2.9rem,5vw,5rem)] font-black uppercase leading-[.9] tracking-[-.075em]">FACCIAMOLO<br/>ESISTERE.</p>
           <div className="mt-9 border-t-[3px] border-black pt-4 text-xs font-black uppercase">Il tuo nome. Le tue competenze.</div>
         </div>
         <p className="text-base font-bold leading-relaxed">Non vendiamo follower o promesse di guadagni facili. Costruiamo prodotti utili, insieme a chi sa già creare contenuti.</p>
       </aside>
     </div>
     <div className="border-x-[4px] border-b-[4px] border-black py-5">
       <Marquee repeat={3} fade={false} className="[--gap:2.5rem] [--duration:29s]">{ribbon.map(x=><span key={x} className="whitespace-nowrap text-xl font-black uppercase italic tracking-tight">✳ {x}</span>)}</Marquee>
     </div>
   </section>
   <section id="metodo" className="mt-16 bg-[#111] py-20 text-white sm:mt-24">
     <div className={frame}>
       <p className="font-mono text-xs font-bold uppercase tracking-[.28em] text-[#faff4e]">Non partiamo da un corso di 40 ore.</p>
       <h2 className="mt-5 max-w-5xl text-[clamp(3rem,6vw,6.5rem)] font-black uppercase leading-[.9] tracking-[-.075em]">PARTIAMO DA<br/>QUALCOSA CHE SERVE.</h2>
       <div className="mt-14 grid border-[3px] border-white md:grid-cols-3">{steps.map((s,i)=><article key={s.n} className={`p-7 md:p-9 ${i<2?"border-b-[3px] border-white md:border-b-0 md:border-r-[3px]":""}`}>
          <span className="font-mono text-sm font-black text-[#faff4e]">{s.n} / PROCESSO</span>
          <h3 className="mt-8 text-3xl font-black uppercase leading-none tracking-[-.04em]">{s.title}</h3>
          <p className="mt-5 text-sm leading-7 text-[#d3d3ce]">{s.copy}</p>
         </article>)}</div>
     </div>
   </section>
   <section className={frame+" py-20 sm:py-28"} id="prodotti">
     <div className="flex flex-wrap items-start justify-between gap-6"><div><p className="text-xs font-black uppercase tracking-[.2em] text-[#e34326]">Un percorso, non un catalogo infinito.</p><h2 className="mt-5 text-[clamp(3rem,6vw,6rem)] font-black uppercase leading-[.9] tracking-[-.07em]">PICCOLO<br/>ALL&apos;INIZIO.<br/>TUO PER DAVVERO.</h2></div><p className="max-w-sm border-l-[5px] border-black pl-5 text-base font-bold leading-7">Questi sono esempi di prodotti e fasce di prezzo, non prezzi obbligatori. Decidiamo insieme cosa ha senso per il tuo pubblico.</p></div>
     <div className="mt-12 grid border-[3px] border-black sm:grid-cols-2 xl:grid-cols-4">{lineup.map((x,i)=><article key={x.n} className={`min-h-64 p-6 ${i!==3?"border-b-[3px] border-black xl:border-b-0 xl:border-r-[3px]":""} ${i===1?"bg-[#faff4e]":"bg-[#fffdf8]"} ${i===0?"sm:border-r-[3px]":""} ${i===2?"sm:border-r-[3px]":""} ${i===1?"sm:border-b-[3px] xl:border-b-0":""}`}>
       <p className="font-mono text-xs font-black">RMP / {x.n}</p><h3 className="mt-8 text-2xl font-black uppercase">{x.title}</h3><p className="mt-2 text-4xl font-black tracking-tight">{x.price}</p><p className="mt-6 text-sm leading-6">{x.copy}</p>
     </article>)}</div>
   </section>
   <section className="border-y-[5px] border-black bg-[#f25436] py-16">
     <div className={frame+" flex flex-wrap items-center justify-between gap-10"}>
       <div className="max-w-3xl"><p className="text-xs font-black uppercase tracking-[.24em]">Founder / Novembre 2026</p><h2 className="mt-4 text-[clamp(3rem,6vw,6rem)] font-black uppercase leading-[.88] tracking-[-.075em]">IL PRIMO PASSO<br/>COSTA 50 € + IVA.</h2><p className="mt-6 text-base font-bold">Attivazione assistita in prevendita. Prima di qualsiasi pagamento concordiamo condizioni, materiali e tempi.</p></div>
       <Link href="/creator-studio" className="inline-flex border-[4px] border-black bg-[#faff4e] px-8 py-5 text-sm font-black uppercase shadow-[8px_8px_0_#111] transition-transform hover:-translate-y-1">Vedi cosa comprende ↗</Link>
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
