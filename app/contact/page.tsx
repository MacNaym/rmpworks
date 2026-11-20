import Link from "next/link";
import type { Metadata } from "next";
import { rmpPhone } from "../contact-details";
export const metadata:Metadata={title:"Contattaci | RMP Creator Studio",description:"Hai un canale YouTube e vuoi creare il tuo primo prodotto digitale? Parliamone con RMP Creator Studio."};
const frame="mx-auto max-w-[1240px] px-5 md:px-12";
export default function Contact(){
 return <main className="flex min-h-screen flex-col bg-[#f7f1e5] text-[#111]">
  <header className="border-b-[4px] border-black"><div className={frame+" flex min-h-20 flex-wrap items-center justify-between gap-4 py-3"}><Link href="/" className="bg-black px-3 py-2 text-xl font-black tracking-[-.08em] text-white">RMP/WORKS.</Link><Link href="/" className="text-xs font-black uppercase underline decoration-[3px] underline-offset-8">← Torna al sito</Link></div></header>
  <section className={frame+" grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.15fr_.85fr]"}>
   <div><p className="inline-block border-[3px] border-black bg-[#faff4e] px-4 py-2 text-xs font-black uppercase shadow-[4px_4px_0_#111]">Creator Studio / Contatti</p><h1 className="mt-9 text-[clamp(3.8rem,8vw,8rem)] font-black uppercase leading-[.85] tracking-[-.095em]">PARLIAMO<br/>DEL TUO<br/><span className="text-[#f25436]">CANALE.</span></h1><p className="mt-9 max-w-xl text-lg font-bold leading-8">Che cosa chiedono più spesso i tuoi spettatori? Potrebbe essere proprio il punto di partenza del primo prodotto.</p></div>
   <aside className="border-[4px] border-black bg-[#faff4e] p-7 shadow-[10px_10px_0_#111] sm:p-10"><p className="font-mono text-xs font-black uppercase tracking-[.22em]">Partiamo da una conversazione</p><h2 className="mt-7 text-4xl font-black uppercase leading-none tracking-tight">UN PROGETTO.<br/>UN PRIMO PASSO.</h2><p className="mt-7 text-sm font-semibold leading-7">Raccontaci chi sei, di cosa parli sul canale e quale problema del tuo pubblico vorresti risolvere. Per il momento il contatto è telefonico.</p><a href={rmpPhone.href} className="mt-8 inline-flex w-full justify-center border-[3px] border-black bg-black px-5 py-5 text-center text-sm font-black uppercase text-white">Chiama {rmpPhone.display} ↗</a><p className="mt-5 text-xs font-semibold">Nessun acquisto obbligatorio e nessuna promessa di vendite.</p></aside>
  </section>
  <footer className="bg-[#111] py-8 text-white"><div className={frame+" flex flex-wrap justify-between gap-5 text-xs font-bold uppercase"}><span>© 2026 RMP Works</span><Link href="/creator-studio">Scopri il programma Founder</Link></div></footer>
 </main>;
}