import type {Metadata} from "next";
import {PageShell,HeroMeta,frame,eyebrow} from "../_components/EditorialShell";
import CreatorPortal from "../_components/CreatorPortal";
export const metadata:Metadata={title:"Area Creator | RMP Works",description:"Accedi all'area privata RMP Creator Studio per completare il brief e seguire il tuo progetto.",robots:{index:false,follow:false}};
export default function CreatorPage(){
 return <PageShell active="creator">
 <section className={frame+" border-b-2 border-black pb-12 pt-12"}>
  <HeroMeta left="Creator Studio / Area Privata" right="Account / Onboarding"/>
  <p className={eyebrow+" text-[#e93625]"}>[ AREA CLIENTI / ACCESSO RISERVATO ]</p>
  <h1 className="mt-6 text-[clamp(3.3rem,8vw,9rem)] font-black uppercase leading-[.83] tracking-[-.085em]">IL TUO<br/><span className="text-[#e93625]">CREATOR DESK.</span></h1>
  <p className="mt-7 max-w-2xl text-sm leading-8">Una sola area per la tua identità, il brief e i prossimi passi. Accesso esclusivo ai creator che hanno completato la procedura d'acquisto prevista.</p>
 </section>
 <section className={frame+" py-12 sm:py-20"}><CreatorPortal/></section>
 </PageShell>
}