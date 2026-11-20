import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Creator Studio | RMP Works", description: "Turn your creative expertise into useful digital products with RMP Works Creator Studio." };
const frame = "mx-auto max-w-[1240px] px-5 md:px-12";
export default function EnglishHome() {
 return <main className="min-h-screen overflow-hidden bg-[#f7f1e5] text-[#111]">
   <header className="border-b-[4px] border-black"><div className={frame+" flex min-h-20 flex-wrap items-center justify-between gap-4 py-3"}>
     <Link href="/" className="bg-black px-3 py-2 text-xl font-black tracking-[-.08em] text-white">RMP/WORKS.</Link>
     <div className="flex items-center gap-5 text-xs font-black uppercase"><Link href="/" className="underline decoration-[3px] underline-offset-8">Italiano</Link><Link href="/contact" className="border-[2px] border-black bg-[#faff4e] px-4 py-3 shadow-[4px_4px_0_#111]">Contact ↗</Link></div>
   </div></header>
   <section className={frame+" grid border-x-[4px] border-b-[4px] border-black lg:grid-cols-[1.3fr_.7fr]"}>
     <div className="px-5 py-16 sm:px-10 lg:border-r-[4px] lg:border-black lg:py-24">
       <p className="inline-block -rotate-2 border-[3px] border-black bg-[#faff4e] px-4 py-3 text-xs font-black uppercase shadow-[5px_5px_0_#111]">For independent content creators.</p>
       <h1 className="mt-12 text-[clamp(3.3rem,7.4vw,8.4rem)] font-black uppercase leading-[.85] tracking-[-.09em]">YOUR<br/>CHANNEL.<br/><span className="text-[#f25436]">YOUR</span><br/>BUSINESS.</h1>
       <p className="mt-10 max-w-xl text-xl font-bold leading-snug">You already create content that matters. We help you turn that knowledge into your first digital product.</p>
       <p className="mt-5 max-w-xl text-sm leading-7">A page under your name, a useful free resource and a clear path to your first small digital product. No guaranteed sales, no magic promises.</p>
       <Link href="/creator-studio" className="mt-9 inline-flex border-[3px] border-black bg-[#faff4e] px-7 py-5 text-sm font-black uppercase shadow-[6px_6px_0_#111]">Explore Founder programme ↗</Link>
       <p className="mt-5 text-xs font-semibold">The Founder programme and the contact page are currently available in Italian.</p>
     </div>
     <aside className="flex flex-col justify-between gap-12 border-t-[4px] border-black bg-[#faff4e] p-9 lg:border-t-0">
       <p className="font-mono text-xs font-black uppercase tracking-[.2em]">Creator Studio / Edition 001</p>
       <div className="-rotate-[5deg] border-[4px] border-black bg-white p-7 shadow-[10px_10px_0_#111]"><p className="text-xs font-black uppercase">The first product you haven't launched yet</p><h2 className="mt-10 text-5xl font-black uppercase leading-[.9] tracking-[-.065em]">LET'S<br/>BUILD IT.</h2></div>
       <p className="text-sm font-bold leading-7">Your expertise. Your audience. Our product-building support.</p>
     </aside>
   </section>
   <section className="bg-[#111] py-20 text-white"><div className={frame}>
     <p className="font-mono text-xs font-black uppercase tracking-widest text-[#faff4e]">How it works</p><h2 className="mt-5 text-[clamp(3rem,6vw,6rem)] font-black uppercase leading-[.88] tracking-[-.07em]">START SMALL.<br/>BUILD SOMETHING USEFUL.</h2>
     <div className="mt-10 grid border-[3px] border-white md:grid-cols-3">{[["01","LISTEN","Find the questions your community keeps asking."],["02","MAKE","Build a useful small product with your approval."],["03","LAUNCH","Share one simple path from free value to the product."]].map(([n,t,c],i)=><div key={n} className={"p-7 "+(i<2?"border-b-[3px] border-white md:border-r-[3px] md:border-b-0":"")}><p className="text-[#faff4e]">{n}</p><h3 className="mt-5 text-3xl font-black">{t}</h3><p className="mt-4 text-sm leading-7 text-white/80">{c}</p></div>)}</div>
   </div></section>
   <footer className="bg-[#f25436] py-10"><div className={frame+" flex flex-wrap items-center justify-between gap-6"}><p className="text-lg font-black uppercase">RMP / Creator Studio</p><Link href="/contact" className="border-[3px] border-black bg-[#faff4e] px-6 py-4 text-sm font-black uppercase shadow-[5px_5px_0_#111]">Start a conversation ↗</Link></div></footer>
 </main>;
}
