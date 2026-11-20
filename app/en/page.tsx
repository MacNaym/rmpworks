import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Creator Studio | RMP Works",
  description: "RMP Works helps independent content creators turn expertise and communities into useful digital products.",
};
export default function EnglishHome(){
 return <main className="min-h-screen bg-[#f7f7f4] text-[#111827]">
  <header className="border-b border-[#dee3eb] bg-white"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6"><Link href="/en" className="font-bold tracking-wider">RMP WORKS</Link><div className="flex items-center gap-6 text-sm"><Link href="/creator-studio">Creator Studio</Link><Link href="/" className="text-[#2563eb]">IT</Link></div></div></header>
  <section className="mx-auto max-w-7xl px-6 py-24 sm:py-32"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#2563eb]">RMP Creator Studio</p><h1 className="mt-7 max-w-6xl text-[clamp(4rem,9vw,9rem)] font-semibold leading-[.92] tracking-[-.08em]">Your audience.<br/><span className="text-[#2563eb]">Your next move.</span></h1><p className="mt-8 max-w-2xl text-xl leading-8 text-[#526176]">You bring your knowledge and community. We help you create your first digital products and a simple path from free value to paid offers.</p><Link href="/creator-studio" className="mt-8 inline-flex rounded-full bg-[#111827] px-6 py-4 text-sm font-semibold text-white">Explore the Founder programme ↗</Link><p className="mt-4 text-xs text-[#64748b]">The detailed programme is currently available in Italian.</p></section>
  <footer className="bg-[#111827] px-6 py-10 text-sm text-white/60"><div className="mx-auto flex max-w-7xl justify-between"><span>© 2026 RMP Works</span><Link href="/contact">Contact</Link></div></footer>
 </main>;
}