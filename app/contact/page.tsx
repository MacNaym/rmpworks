import Link from "next/link";
import {FounderLeadForm} from "../_components/FounderLeadForm";
import type { Metadata } from "next";
import { rmpPhone } from "../contact-details";
import {PageShell,HeroMeta,frame,eyebrow,heroTitle,textButton} from "../_components/EditorialShell";
export const metadata:Metadata={title:"Contatti | RMP Creator Studio",description:"Parliamo del tuo canale e del primo prodotto digitale da creare con RMP Creator Studio."};
export default function Contact(){
 return <PageShell active="contact">
  <section className={frame+" border-b-2 border-black pb-12 pt-10 sm:pb-16 sm:pt-14"}>
   <HeroMeta left="Creator Studio / Contatti" right="Il tuo canale / Il prossimo progetto"/>
   <h1 className={heroTitle}>PARLIAMO<br/>DEL <span className="text-[#e93625]">TUO</span><br/>CANALE.</h1>
  </section>
  <section className="grid border-b-2 border-black lg:grid-cols-2">
   <div className="border-b-2 border-black p-7 sm:p-10 lg:border-b-0 lg:border-r-2 lg:p-12">
    <p className={eyebrow+" text-[#e93625]"}>[ INIZIAMO DA UNA DOMANDA ]</p>
    <h2 className="mt-6 text-[clamp(2.1rem,4vw,4.5rem)] font-black leading-[.96] tracking-[-.065em]">Qual è la cosa che i tuoi spettatori ti chiedono più spesso?</h2>
    <p className="mt-8 max-w-xl text-base leading-8 text-[#353331]">Una guida, un modello, un metodo o uno strumento: il primo prodotto può nascere proprio da quella domanda. Non serve cominciare con un corso enorme.</p>
    <div className="mt-10 border-l-2 border-[#e93625] pl-5 font-mono text-xs font-bold uppercase leading-6">PER YOUTUBER / EDUCATOR / CREATOR DI NICCHIA</div>
   </div>
   <div className="relative flex min-h-[450px] flex-col justify-between overflow-hidden bg-[#171615] p-7 text-[#f4f2ed] sm:p-10 lg:p-12">
    <div aria-hidden="true" className="absolute -right-24 top-4 size-72 rounded-full bg-[#e93625] opacity-75 blur-[95px]"/>
    <div className="relative z-10 flex justify-between gap-3 border-b border-[#f4f2ed]/70 pb-4 font-mono text-[10px] font-black uppercase tracking-[.15em]"><span>FIG. 02 / PRIMO CONTATTO</span><span>RMP/26</span></div>
    <div className="relative z-10 py-10"><p className="text-[clamp(3.1rem,5.8vw,6.2rem)] font-black uppercase leading-[.88] tracking-[-.08em]">UN CANALE.<br/><span className="text-[#ff513c]">UN&apos;IDEA.</span><br/>UN PRIMO<br/>PRODOTTO.</p></div>
    <div className="relative z-10 border-t border-[#f4f2ed]/70 pt-6">
     <p className="text-sm leading-7 text-[#d4cec8]">Puoi compilare il modulo oppure chiamarci. Nessuna prenotazione o pagamento automatico.</p>
     <a href={rmpPhone.href} className="mt-7 inline-flex border-2 border-[#f4f2ed] bg-[#f4f2ed] px-6 py-4 font-mono text-xs font-black uppercase text-black hover:bg-[#e93625]">CHIAMA {rmpPhone.display} ↗</a>
    </div>
   </div>
  </section>
  <section className={frame+" py-20 sm:py-24"}>
   <p className={eyebrow+" text-[#e93625]"}>[ PRIMA DI SENTIRCI ]</p>
   <h2 className="mt-5 text-[clamp(2.9rem,6vw,6rem)] font-black uppercase leading-[.87] tracking-[-.075em]">BASTANO<br/>POCHE COSE.</h2>
   <div className="mt-12 grid border-2 border-black md:grid-cols-3">
    {[
     ["01","IL CANALE","Il link del tuo canale e due parole su chi ti segue."],
     ["02","LE DOMANDE","Gli argomenti su cui ricevi più richieste, commenti o messaggi."],
     ["03","IL PUNTO DI PARTENZA","Un&apos;idea di prodotto, anche ancora grezza. Oppure nessuna: la cerchiamo insieme."]
    ].map(([n,t,d],i)=><article key={n} className={"min-h-[260px] p-7 "+(i<2?"border-b-2 border-black md:border-b-0 md:border-r-2":"")}><p className="font-mono text-xs font-black text-[#e93625]">{n} / BRIEF</p><h3 className="mt-10 text-2xl font-black uppercase tracking-[-.04em]">{t}</h3><p className="mt-5 text-sm leading-7 text-[#353331]">{d.replace("&apos;","'")}</p></article>)}
   </div>
  </section>
  <section className={frame+" py-16 sm:py-24"}><FounderLeadForm/></section>
  <section className="border-t-2 border-black bg-[#e93625] py-16"><div className={frame+" flex flex-wrap items-end justify-between gap-8"}><div><p className={eyebrow}>[ PROGRAMMA FOUNDER ]</p><h2 className="mt-5 text-[clamp(2.8rem,5.4vw,5.6rem)] font-black uppercase leading-[.88] tracking-[-.075em]">PARTIAMO<br/>CON 50 € + IVA.</h2><p className="mt-6 max-w-xl text-sm font-bold leading-7">Prezzo proposto per la prima attivazione, soggetto alle condizioni della prevendita.</p></div><Link href="/creator-studio" className={textButton}>COSA COMPRENDE ↗</Link></div></section>
 </PageShell>;
}