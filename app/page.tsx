import Link from "next/link";
import type { Metadata } from "next";
import { rmpPhone } from "./contact-details";

export const metadata: Metadata = {
  title: "RMP Works | Il tuo canale vale più delle views",
  description: "RMP Creator Studio crea con te prodotti digitali, pagine di vendita e risorse gratuite per trasformare la tua competenza in una proposta acquistabile.",
  openGraph: {
    title: "IL TUO CANALE VALE PIÙ DELLE VIEWS. | RMP Works",
    description: "Non vendiamo follower. Costruiamo con te prodotti digitali utili alla tua community.",
  },
};

const process = [
  { number: "01", title: "TROVIAMO UN BISOGNO.", description: "Partiamo dai tuoi contenuti, dalle domande del pubblico e da ciò che sai fare davvero." },
  { number: "02", title: "CREIAMO IL PRODOTTO.", description: "Progettiamo una risorsa gratuita e il primo microprodotto con i tuoi materiali e la tua approvazione." },
  { number: "03", title: "LO METTIAMO ONLINE.", description: "Prepariamo il percorso tecnico e una pagina a tuo nome, pronta da condividere con la community." },
];
const products = [
  { number: "01", label: "FREE ENTRY", title: "RISORSA GRATUITA", price: "0 €", detail: "Un quiz o una guida che faccia capire subito il valore dei tuoi contenuti." },
  { number: "02", label: "FIRST SALE", title: "MICROPRODOTTO", price: "5–15 €", detail: "Un piccolo prodotto digitale per risolvere un problema concreto." },
  { number: "03", label: "NEXT STEP", title: "PRODOTTO AVANZATO", price: "29–79 €", detail: "Un percorso più completo, quando il primo prodotto ha trovato il suo pubblico." },
  { number: "04", label: "LATER", title: "PREMIUM", price: "SU PROGETTO", detail: "Un corso o uno strumento avanzato, solo se ha senso costruirlo." },
];
const frame = "mx-auto w-full max-w-[1540px] px-5 sm:px-7 lg:px-10";

function Brand() {
  return <span className="inline-flex items-center gap-2 text-[13px] font-black tracking-[-.055em] sm:text-[15px]">
    <span className="grid size-5 place-items-center border border-black bg-[#ee3323] text-[10px] font-black text-white sm:size-6">R</span>
    RMP<span className="-ml-1 text-[#ee3323]">/</span>WORKS<span className="-ml-1 text-[#ee3323]">®</span>
  </span>;
}

export default function Home() {
  return <main className="min-h-screen overflow-x-hidden bg-[#f4f2ed] text-[#101010]">
    <div className="border-x-2 border-black">
      <div className="flex min-h-6 items-center justify-between gap-3 border-b-2 border-black bg-[#e93625] px-5 py-1 font-mono text-[8px] font-bold uppercase tracking-[.2em] text-black sm:px-8 sm:text-[9px]">
        <span>✳ NOV 2026 / FOUNDER EDITION / POSTI LIMITATI</span>
        <span className="hidden sm:block">DESIGN • BUILD • NO SHORTCUTS</span>
        <span className="sm:hidden">CREATOR STUDIO</span>
      </div>
      <header className="border-b-2 border-black">
        <div className={frame+" flex min-h-[64px] items-center justify-between gap-4 py-3"}>
          <Link href="/" aria-label="RMP Works — homepage"><Brand/></Link>
          <nav className="hidden items-center gap-7 font-mono text-[10px] font-black uppercase tracking-[.13em] md:flex" aria-label="Navigazione principale">
            <a href="#cosa-facciamo" className="hover:underline">Cosa facciamo</a>
            <a href="#metodo" className="hover:underline">Metodo</a>
            <Link href="/about" className="hover:underline">Studio</Link>
            <Link href="/creator-studio" className="hover:underline">Founder</Link>
            <Link href="/demo" className="hover:underline">Demo</Link>
            <Link href="/en" className="hover:underline">EN</Link>
            <Link href="/contact" className="hover:underline">Contatti</Link>
          </nav>
          <Link href="/contact" className="border-2 border-black bg-black px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[.1em] text-white transition-colors hover:bg-[#e93625] hover:text-black sm:px-6">PARLIAMONE ↗</Link>
        </div>
      </header>

      <section aria-labelledby="hero-title" className={frame+" border-b-2 border-black pb-10 pt-9 sm:pb-12 sm:pt-12 lg:pb-16 lg:pt-14"}>
        <div className="mb-8 grid grid-cols-2 gap-2 font-mono text-[9px] font-bold uppercase tracking-[.18em] text-[#68635d] sm:mb-12 md:grid-cols-3">
          <span><span className="text-[#e93625]">✳</span> STUDIO INDIPENDENTE PER CREATOR</span>
          <span className="hidden text-center md:block">EST. 2026 / ITALIA / ONLINE</span>
          <span className="text-right"><span className="text-[#e93625]">●</span> IL TUO PUBBLICO / IL TUO BUSINESS</span>
        </div>
        <h1 id="hero-title" className="font-sans text-[clamp(2.25rem,10.7vw,11.6rem)] font-black uppercase leading-[.79] tracking-[-.095em]">
          <span className="block whitespace-nowrap">IL TUO CANALE</span>
          <span className="block whitespace-nowrap">VALE <span className="text-[#e93625]">PIÙ</span></span>
          <span className="block whitespace-nowrap">DELLE VIEWS.</span>
        </h1>
      </section>

      <section id="cosa-facciamo" className="grid border-b-2 border-black lg:grid-cols-2">
        <div className="border-b-2 border-black p-6 sm:p-8 lg:border-b-0 lg:border-r-2 lg:p-10">
          <p className="font-mono text-[10px] font-black uppercase tracking-[.22em] text-[#e93625]">[ COSA COSTRUIAMO ]</p>
          <h2 className="mt-6 max-w-[680px] text-[clamp(1.8rem,3.5vw,3.5rem)] font-black leading-[1.01] tracking-[-.058em]">Non ti servono altri follower per iniziare. Ti serve qualcosa di utile da offrire.</h2>
          <p className="mt-7 max-w-xl text-base leading-7 text-[#353331]">Con RMP Creator Studio trasformiamo la tua competenza in prodotti digitali. Una pagina a tuo nome, una risorsa gratuita e il tuo primo prodotto da proporre alla community.</p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link href="/creator-studio" className="border-2 border-black bg-[#e93625] px-6 py-4 font-mono text-[11px] font-black uppercase tracking-[.07em] text-white hover:bg-black">SCOPRI IL PROGRAMMA FOUNDER ↗</Link>
            <a href="#metodo" className="border-b-2 border-black pb-1 font-mono text-[10px] font-black uppercase tracking-[.1em]">COME FUNZIONA ↓</a>
          </div>
        </div>
        <div className="relative flex min-h-[410px] items-center overflow-hidden bg-[#1a1918] p-7 sm:p-10 lg:p-12">
          <div aria-hidden="true" className="absolute inset-0 bg-[repeating-linear-gradient(135deg,transparent_0px,transparent_9px,#ffffff09_10px,#ffffff09_12px)]"/>
          <div aria-hidden="true" className="absolute -right-28 -top-24 size-[470px] rounded-full bg-[#e93625] opacity-90 blur-[105px]"/>
          <div className="relative z-10 w-full border-2 border-[#f4f2ed] bg-[#111]/40 p-7 text-[#f4f2ed] sm:p-9">
            <div className="flex justify-between gap-3 border-b border-[#f4f2ed]/60 pb-4 font-mono text-[10px] font-bold uppercase tracking-[.14em]"><span>FIG. 01 / CREATOR ECONOMY</span><span>RMP/26</span></div>
            <p className="mt-9 text-[clamp(2.4rem,5.3vw,5.8rem)] font-black uppercase leading-[.85] tracking-[-.08em]">NON SOLO<br/>CONTENUTI.<br/><span className="text-[#ff513c]">PRODOTTI.</span></p>
            <div className="mt-10 flex flex-wrap justify-between gap-3 border-t border-[#f4f2ed]/60 pt-4 font-mono text-[10px] font-black uppercase"><span>IDEA → PRODOTTO → PUBBLICO</span><span>↗</span></div>
          </div>
        </div>
      </section>

      <section id="metodo" className={frame+" py-20 sm:py-24"}>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div><p className="font-mono text-[10px] font-black uppercase tracking-[.22em] text-[#e93625]">[ IL METODO ]</p><h2 className="mt-5 text-[clamp(2.8rem,6.4vw,6.8rem)] font-black uppercase leading-[.85] tracking-[-.075em]">DALLA TUA<br/>NICCHIA AL<br/>PRIMO PRODOTTO.</h2></div>
          <p className="max-w-xs border-l-2 border-[#e93625] pl-5 text-sm font-semibold leading-7">Partiamo in piccolo. Nessun corso infinito, nessun investimento alla cieca e nessuna promessa di guadagni facili.</p>
        </div>
        <div className="mt-12 grid border-2 border-black md:grid-cols-3">{process.map((s,i)=><article key={s.number} className={"min-h-[260px] p-7 "+(i<2?"border-b-2 border-black md:border-b-0 md:border-r-2":"")}>
          <span className="font-mono text-xs font-black text-[#e93625]">{s.number} / FASE</span>
          <h3 className="mt-12 text-2xl font-black uppercase leading-[.95] tracking-[-.05em]">{s.title}</h3>
          <p className="mt-6 text-sm leading-7 text-[#4a4642]">{s.description}</p>
        </article>)}</div>
      </section>

      <section className="border-y-2 border-black bg-[#171615] py-20 text-[#f4f2ed]">
        <div className={frame}>
          <p className="font-mono text-[10px] font-black uppercase tracking-[.22em] text-[#ff513c]">[ PRODUCT LADDER ]</p>
          <h2 className="mt-5 text-[clamp(2.8rem,6.5vw,7rem)] font-black uppercase leading-[.87] tracking-[-.07em]">UN PRODOTTO.<br/><span className="text-[#ff513c]">POI IL PROSSIMO.</span></h2>
          <div className="mt-12 grid border-2 border-[#f4f2ed] sm:grid-cols-2 lg:grid-cols-4">{products.map((p,i)=><article key={p.number} className={"p-6 "+(i<3?"border-b-2 border-[#f4f2ed] lg:border-b-0 lg:border-r-2":"")+(i===0||i===2?" sm:border-r-2":"")+(i===1?" sm:border-b-2 lg:border-b-0":"")}>
            <span className="font-mono text-[10px] font-bold text-[#ff513c]">{p.number} / {p.label}</span>
            <h3 className="mt-10 text-xl font-black uppercase tracking-[-.035em]">{p.title}</h3>
            <p className="mt-3 text-3xl font-black">{p.price}</p>
            <p className="mt-6 text-sm leading-6 text-[#c9c4bb]">{p.detail}</p>
          </article>)}</div>
          <p className="mt-5 font-mono text-[10px] uppercase text-[#c9c4bb]">Le fasce di prezzo sono esempi. Decidiamo insieme cosa è sensato per il tuo pubblico.</p>
        </div>
      </section>

      <section className="border-b-2 border-black bg-[#e93625] py-20 text-black">
        <div className={frame+" grid items-end gap-9 lg:grid-cols-[1fr_auto]"}>
          <div><p className="font-mono text-[10px] font-black uppercase tracking-[.2em]">[ FOUNDER / NOVEMBRE 2026 ]</p><h2 className="mt-6 text-[clamp(3rem,7vw,7.5rem)] font-black uppercase leading-[.83] tracking-[-.085em]">IL PRIMO PASSO.<br/>50 € + IVA.</h2><p className="mt-6 max-w-xl text-sm font-bold leading-7">Attivazione assistita in prevendita, non checkout immediato. Definiamo materiali, condizioni e data di consegna prima del pagamento.</p></div>
          <Link href="/creator-studio" className="inline-flex border-2 border-black bg-black px-8 py-5 font-mono text-xs font-black uppercase tracking-[.08em] text-white hover:bg-[#f4f2ed] hover:text-black">VEDI COSA INCLUDE ↗</Link>
        </div>
      </section>

      <footer className="border-b-2 border-black bg-[#f4f2ed]">
        <div className={frame+" flex flex-wrap items-center justify-between gap-5 py-8"}>
          <Link href="/" aria-label="RMP Works — homepage"><Brand/></Link>
          <div className="flex flex-wrap gap-6 font-mono text-[10px] font-black uppercase tracking-[.08em]">
            <Link href="/about">Studio</Link><Link href="/demo">Demo</Link><Link href="/privacy">Privacy</Link><Link href="/creator-studio">Founder</Link><Link href="/contact">Contatti</Link><Link href="/en">EN</Link><a href={rmpPhone.href}>Chiama</a>
          </div>
          <span className="font-mono text-[9px] text-[#68635d]">© 2026 RMP WORKS</span>
        </div>
      </footer>
    </div>
  </main>;
}
