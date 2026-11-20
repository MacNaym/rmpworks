import Link from "next/link";
import type { Metadata } from "next";
import {PageShell,HeroMeta,frame,eyebrow,heroTitle,textButton} from "../_components/EditorialShell";
export const metadata:Metadata={title:"Creator Studio | RMP Works",description:"RMP Works helps independent creators turn their expertise into useful digital products, landing pages and resources for their audiences."};
export default function EnglishHome(){
 return <PageShell active="en">
  <section className={frame+" border-b-2 border-black pb-12 pt-10 sm:pb-16 sm:pt-14"}>
   <HeroMeta left="Independent creator studio" right="Your audience / Your business" center="EST. 2026 / ITALY / ONLINE"/>
   <h1 className={heroTitle}>YOUR<br/>AUDIENCE.<br/><span className="text-[#e93625]">MORE</span><br/>THAN VIEWS.</h1>
  </section>
  <section className="grid border-b-2 border-black lg:grid-cols-2">
   <div className="border-b-2 border-black p-7 sm:p-10 lg:border-b-0 lg:border-r-2 lg:p-12">
    <p className={eyebrow+" text-[#e93625]"}>[ WHAT WE BUILD ]</p>
    <h2 className="mt-6 text-[clamp(2.2rem,4vw,4.6rem)] font-black leading-[.97] tracking-[-.06em]">Your knowledge deserves a product people can actually use.</h2>
    <p className="mt-8 max-w-xl text-base leading-8 text-[#353331]">RMP Creator Studio works with independent YouTubers, educators and niche creators to build a first digital product. A branded page, a free resource and a clear way to share it with your community.</p>
    <p className="mt-5 text-sm leading-7 text-[#353331]">The Founder programme and commercial terms are currently available in Italian.</p>
    <div className="mt-9 flex flex-wrap gap-5"><Link href="/creator-studio" className={textButton}>VIEW FOUNDER PROGRAMME ↗</Link><Link href="/" className="inline-flex items-center border-b-2 border-black font-mono text-xs font-black uppercase">VERSIONE ITALIANA ↗</Link></div>
   </div>
   <div className="flex min-h-[400px] flex-col justify-between bg-[#171615] p-7 text-[#f4f2ed] sm:p-12">
    <p className="flex justify-between border-b border-[#f4f2ed]/60 pb-5 font-mono text-[10px] font-black uppercase"><span>FIG. 04 / CREATOR ECONOMY</span><span>RMP/26</span></p>
    <p className="py-12 text-[clamp(3.5rem,6vw,7rem)] font-black uppercase leading-[.86] tracking-[-.07em]">MAKE<br/>SOMETHING<br/><span className="text-[#ff513c]">WORTH</span><br/>SELLING.</p>
    <p className="border-t border-[#f4f2ed]/60 pt-5 font-mono text-[10px] font-black uppercase">CONTENT / SKILL / DIGITAL PRODUCTS</p>
   </div>
  </section>
  <section className={frame+" py-20"}>
   <p className={eyebrow+" text-[#e93625]"}>[ HOW IT WORKS ]</p>
   <h2 className="mt-5 text-[clamp(2.9rem,6vw,6rem)] font-black uppercase leading-[.88] tracking-[-.07em]">START SMALL.<br/>BUILD SOMETHING REAL.</h2>
   <div className="mt-12 grid border-2 border-black md:grid-cols-3">{[["01","FIND A NEED","Start with questions your audience is already asking."],["02","BUILD THE PRODUCT","Create a useful free resource and a simple first offer with your approval."],["03","LAUNCH IT","Put it online under your name and share it with your community."]].map(([n,t,d],i)=><article key={n} className={"min-h-[245px] p-7 "+(i<2?"border-b-2 border-black md:border-b-0 md:border-r-2":"")}><p className="font-mono text-xs font-black text-[#e93625]">{n} / STEP</p><h3 className="mt-10 text-2xl font-black uppercase">{t}</h3><p className="mt-5 text-sm leading-7 text-[#353331]">{d}</p></article>)}</div>
  </section>
 </PageShell>;
}