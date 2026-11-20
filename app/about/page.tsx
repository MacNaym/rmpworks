import Link from "next/link";
import type { Metadata } from "next";
import {PageShell,HeroMeta,frame,eyebrow,heroTitle,textButton} from "../_components/EditorialShell";
export const metadata:Metadata={title:"Lo studio | RMP Works",description:"RMP Works è uno studio indipendente che aiuta creator e divulgatori a trasformare le proprie competenze in prodotti digitali utili."};
const principles=[
 ["01","IL CONTENUTO VIENE PRIMA","Non inventiamo competenze né corsi che non esistono. Partiamo dalle cose che già conosci e dalle persone che ti seguono."],
 ["02","PICCOLO È UN VANTAGGIO","Prima una risorsa, poi un prodotto semplice. Solo dopo, quando esiste domanda, valutiamo un progetto più grande."],
 ["03","NESSUNA FORMULA MAGICA","Niente promesse di guadagni automatici. Creiamo strumenti, contenuti e percorsi tecnici che puoi davvero usare."],
 ["04","IL PROGETTO È TUO","Il marchio e i contenuti del creator restano al centro. Il nostro ruolo è aiutarti a renderli un prodotto presentabile e acquistabile."]
];
export default function About(){
 return <PageShell active="about">
  <section className={frame+" border-b-2 border-black pb-12 pt-10 sm:pb-16 sm:pt-14"}>
   <HeroMeta left="RMP Works / Studio indipendente" right="Design / Build / Creator Economy"/>
   <h1 className={heroTitle}>NIENTE<br/>ARIA <span className="text-[#e93625]">FRITTA.</span><br/>COSE VERE.</h1>
  </section>
  <section className="grid border-b-2 border-black lg:grid-cols-2">
   <div className="border-b-2 border-black p-7 sm:p-10 lg:border-b-0 lg:border-r-2 lg:p-12">
    <p className={eyebrow+" text-[#e93625]"}>[ CHI SIAMO ]</p>
    <h2 className="mt-6 text-[clamp(2.2rem,4vw,4.5rem)] font-black leading-[.98] tracking-[-.06em]">Uno studio indipendente per chi crea contenuti e vuole costruirci qualcosa.</h2>
    <p className="mt-8 max-w-xl text-base leading-8 text-[#353331]">RMP Works sviluppa progetti e strumenti digitali. Con Creator Studio lavoriamo al fianco di YouTuber, divulgatori e creator di nicchia per progettare il loro primo prodotto digitale.</p>
    <p className="mt-5 max-w-xl text-base leading-8 text-[#353331]">Non serve una community gigantesca. Serve capire cosa può essere davvero utile alle persone che già ascoltano.</p>
   </div>
   <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden bg-[#171615] p-7 text-[#f4f2ed] sm:p-10 lg:p-12">
    <div className="flex justify-between border-b border-[#f4f2ed]/60 pb-5 font-mono text-[10px] font-bold uppercase tracking-widest"><span>FIG. 03 / STUDIO NOTES</span><span>RMP/26</span></div>
    <p className="py-14 text-[clamp(3.3rem,6vw,7rem)] font-black uppercase leading-[.86] tracking-[-.075em]">MENO<br/>FUFFA.<br/><span className="text-[#ff513c]">PIÙ</span><br/>PRODOTTI.</p>
    <p className="border-t border-[#f4f2ed]/60 pt-5 font-mono text-[10px] font-black uppercase tracking-[.15em]">INDIPENDENTE / CONCRETO / SU MISURA</p>
   </div>
  </section>
  <section className={frame+" py-20 sm:py-24"}>
   <p className={eyebrow+" text-[#e93625]"}>[ QUATTRO PRINCIPI ]</p>
   <h2 className="mt-5 text-[clamp(2.9rem,6vw,6.5rem)] font-black uppercase leading-[.87] tracking-[-.075em]">COME<br/>LAVORIAMO.</h2>
   <div className="mt-12 border-t-2 border-black">{principles.map(([n,t,d])=><article key={n} className="grid gap-4 border-b-2 border-black py-8 md:grid-cols-[65px_.85fr_1.15fr]"><p className="font-mono text-xs font-black text-[#e93625]">{n}</p><h3 className="max-w-sm text-2xl font-black uppercase leading-tight tracking-[-.045em]">{t}</h3><p className="max-w-2xl text-sm leading-7 text-[#353331]">{d}</p></article>)}</div>
  </section>
  <section className="border-t-2 border-black bg-[#e93625] py-16"><div className={frame+" flex flex-wrap items-end justify-between gap-9"}><div><p className={eyebrow}>[ RMP CREATOR STUDIO ]</p><h2 className="mt-5 text-[clamp(3rem,5.6vw,6rem)] font-black uppercase leading-[.86] tracking-[-.08em]">IL PROSSIMO<br/>PROGETTO È IL TUO?</h2></div><Link href="/creator-studio" className={textButton}>SCOPRI CREATOR STUDIO ↗</Link></div></section>
 </PageShell>;
}