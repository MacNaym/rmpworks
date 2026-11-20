import Link from "next/link";
import type { Metadata } from "next";
import { rmpPhone } from "../contact-details";
export const metadata: Metadata = {
  title: "Contatti Creator Studio | RMP Works",
  description: "Contatta RMP Creator Studio per progetti, prodotti e collaborazioni con content creator.",
};
const frame="mx-auto w-full max-w-6xl px-5 sm:px-8 lg:px-12";
export default function ContactPage(){
 return <main className="min-h-screen bg-[#f8fafc] text-[#111827]">
   <header className="border-b border-[#e2e8f0] bg-white"><div className={`${frame} flex min-h-20 items-center justify-between`}><Link href="/" className="font-bold tracking-tight">RMP WORKS</Link><Link href="/" className="text-sm text-[#475569]">← Home</Link></div></header>
   <section className={`${frame} py-20 sm:py-28`}>
     <p className="text-xs font-bold uppercase tracking-widest text-[#2563eb]">Creator Studio / Contatti</p>
     <h1 className="mt-5 max-w-4xl text-[clamp(3.5rem,8vw,7rem)] font-semibold leading-[.95] tracking-[-.065em]">Facciamo qualcosa di concreto.</h1>
     <p className="mt-7 max-w-3xl text-lg leading-8 text-[#526176]">Hai un canale e vuoi creare il tuo primo prodotto digitale? Iniziamo dal tuo pubblico e dal risultato che puoi aiutare le persone a ottenere.</p>
     <div className="mt-12 max-w-2xl rounded-2xl border border-[#dce5f3] bg-white p-8">
       <h2 className="text-2xl font-semibold">Parliamo del tuo canale</h2>
       <p className="mt-3 leading-7 text-[#526176]">Per ora il contatto diretto è telefonico. Il modulo dedicato arriverà con la fase di onboarding.</p>
       <a className="mt-7 inline-flex rounded-full bg-[#111827] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d4ed8]" href={rmpPhone.href}>Chiama {rmpPhone.display}</a>
     </div>
   </section>
   <footer className="bg-[#111827] py-10 text-sm text-white/70"><div className={`${frame} flex flex-wrap justify-between gap-5`}><span>© 2026 RMP Works</span><div className="flex gap-5"><Link href="/creator-studio">Creator Studio</Link><Link href="/design-lab">Design Lab</Link></div></div></footer>
 </main>;
}
