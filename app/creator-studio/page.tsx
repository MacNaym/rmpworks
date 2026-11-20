import Link from "next/link";
import type { Metadata } from "next";
import { rmpPhone } from "../contact-details";
import {PageShell,HeroMeta,frame,eyebrow,heroTitle,textButton} from "../_components/EditorialShell";
export const metadata:Metadata={title:"Founder 50 € + IVA | RMP Creator Studio",description:"Attivazione Founder per creator indipendenti: pagina personalizzata, lead magnet e primo microprodotto. Richiedi i dettagli del programma."};
const included=[
["01","LA TUA PAGINA","Una pagina pubblica a tuo marchio per presentare il prodotto e guidare il pubblico."],
["02","IL TUO SPAZIO","Uno spazio dedicato sul sottodominio RMP Works del tuo canale."],
["03","IL PRIMO REGALO","Una risorsa gratuita o un quiz semplice, da definire insieme."],
["04","IL MICROPRODOTTO","Un prodotto digitale basato sulle tue competenze e sui materiali che approvi."],
["05","LA VENDITA","Preparazione del percorso di pagamento e della consegna digitale."],
["06","IL LANCIO","Una revisione concordata e istruzioni sintetiche per partire."]
];
const excluded=["Corsi estesi, coaching e programmi premium","Gestione pubblicitaria e crescita dei follower","Sviluppi software su misura o produzione illimitata","Garanzie di guadagno e assistenza illimitata"];
const faq=[
["È pronto da usare oggi?","No. Il programma Founder è una prevendita di attivazione assistita: definiamo materiali, condizioni e data di consegna prima del pagamento."],
["Serve un corso già registrato?","No. Partiamo da una guida, un quiz o un microprodotto semplice. Servono la tua competenza, i materiali necessari e la tua approvazione."],
["Come si dividono i ricavi?","La proposta è 80% al creator e 20% a RMP Works sui ricavi netti come definiti nel contratto. Imposte, rimborsi e commissioni saranno precisati prima dell'attivazione."],
["Mi garantite delle vendite?","No. Realizziamo una struttura e un prodotto concordato. Le vendite dipendono anche dalla domanda e da come lo presenti al tuo pubblico."],
["Posso acquistare subito?","Non ancora. In questa fase raccogliamo manifestazioni di interesse e definiamo le condizioni prima di attivare il checkout."]
];
export default function Founder(){
 return <PageShell active="creator">
  <section className={frame+" border-b-2 border-black pb-12 pt-10 sm:pb-16 sm:pt-14"}>
   <HeroMeta left="Creator Studio / Founder" right="Attivazione assistita / 2026"/>
   <h1 className={heroTitle+" max-w-[1450px]"}>IL TUO PRIMO<br/><span className="text-[#e93625]">PRODOTTO.</span><br/>SUL SERIO.</h1>
  </section>
  <section className="grid border-b-2 border-black lg:grid-cols-[1.07fr_.93fr]">
   <div className="border-b-2 border-black p-6 sm:p-9 lg:border-b-0 lg:border-r-2 lg:p-12">
    <p className={eyebrow+" text-[#e93625]"}>[ PARTIAMO DAL PRIMO PASSO ]</p>
    <h2 className="mt-6 max-w-[670px] text-[clamp(2rem,3.7vw,4.1rem)] font-black leading-[.96] tracking-[-.065em]">Una pagina. Una risorsa gratuita. Un prodotto che porta il tuo nome.</h2>
    <p className="mt-7 max-w-2xl text-base leading-8 text-[#353331]">Tu porti esperienza, contenuti e la conoscenza della tua community. Noi progettiamo con te un primo prodotto digitale e prepariamo il percorso tecnico per presentarlo.</p>
    <div className="mt-9 border-l-2 border-[#e93625] pl-5 text-sm font-semibold leading-7">Non è un servizio che promette follower o ricavi facili. È una prima attivazione, con attività e limiti definiti.</div>
   </div>
   <div className="flex flex-col justify-between bg-[#e93625] p-7 sm:p-10 lg:p-12">
    <div className="flex justify-between border-b-2 border-black pb-4 font-mono text-[10px] font-black uppercase tracking-[.13em]"><span>FIG. 01 / FOUNDER OFFER</span><span>20–30 NOV 2026</span></div>
    <div className="py-12"><p className={eyebrow}>ATTIVAZIONE UNA TANTUM / PREZZO PROPOSTO</p><p className="mt-4 text-[clamp(5.5rem,11vw,10rem)] font-black leading-none tracking-[-.105em]">50 €</p><p className="mt-2 text-2xl font-black uppercase">+ IVA applicabile</p><p className="mt-6 max-w-lg text-sm font-semibold leading-7">Prezzo ordinario pianificato: 169 € + IVA dal 1° dicembre 2026. Non è un prezzo precedente. Formula soggetta alle condizioni definitive.</p></div>
    <div><Link href="/contact" className={textButton+" w-full sm:w-auto"}>CHIEDI L&apos;ATTIVAZIONE ↗</Link><p className="mt-4 text-xs font-semibold leading-6">Nessun pagamento su questa pagina. Prima ricevi attività, condizioni e tempistiche.</p></div>
   </div>
  </section>
  <section className={frame+" py-20 sm:py-24"}>
   <p className={eyebrow+" text-[#e93625]"}>[ IL PACCHETTO / 06 COMPONENTI ]</p>
   <h2 className="mt-5 text-[clamp(3rem,6vw,6.2rem)] font-black uppercase leading-[.87] tracking-[-.075em]">COSA C&apos;È<br/><span className="text-[#e93625]">DENTRO.</span></h2>
   <div className="mt-12 grid border-2 border-black md:grid-cols-2 xl:grid-cols-3">{included.map(([n,title,desc],i)=><article key={n} className={"min-h-60 p-7 "+(i<3?"border-b-2 border-black xl:border-b-0":"")+(i<4&&i>=3?"border-b-2 border-black xl:border-b-0":"")+(i%3!==2?" xl:border-r-2":"")+(i%2===0?" md:border-r-2 xl:border-r-0":"")+(i%3!==2?" xl:border-r-2":"")}>
    <p className="font-mono text-xs font-black text-[#e93625]">{n} / INCLUSO</p><h3 className="mt-8 text-2xl font-black uppercase tracking-[-.045em]">{title}</h3><p className="mt-4 text-sm leading-7 text-[#4a4642]">{desc}</p>
   </article>)}</div>
  </section>
  <section className="grid border-y-2 border-black lg:grid-cols-2">
   <div className="border-b-2 border-black bg-[#171615] p-7 text-[#f4f2ed] sm:p-12 lg:border-b-0 lg:border-r-2">
    <p className={eyebrow+" text-[#ff513c]"}>[ IL PERCORSO ]</p><h2 className="mt-6 text-[clamp(3rem,5vw,5.4rem)] font-black uppercase leading-[.9] tracking-[-.07em]">PRIMA<br/>PARLIAMO.<br/>POI CREIAMO.</h2>
    <ol className="mt-10 space-y-5 border-t border-[#f4f2ed]/40 pt-7 text-sm font-semibold leading-7"><li>01 / Raccontaci il canale e il tuo pubblico.</li><li>02 / Scegliamo il primo prodotto e i materiali necessari.</li><li>03 / Definiamo per iscritto ambito, condizioni e data di consegna.</li><li>04 / Concordiamo attivazione, pagamento e realizzazione.</li></ol>
   </div>
   <div className="p-7 sm:p-12">
    <p className={eyebrow+" text-[#e93625]"}>[ FUORI DAL PACCHETTO ]</p><h2 className="mt-6 text-[clamp(2.8rem,5vw,5.2rem)] font-black uppercase leading-[.9] tracking-[-.07em]">NIENTE<br/>PROMESSE<br/>IMPOSSIBILI.</h2>
    <ul className="mt-10 border-t-2 border-black">{excluded.map(x=><li key={x} className="border-b-2 border-black py-5 text-sm font-bold leading-7">× {x}</li>)}</ul>
   </div>
  </section>
  <section className={frame+" py-20 sm:py-24"}>
   <p className={eyebrow+" text-[#e93625]"}>[ DOMANDE FREQUENTI ]</p><h2 className="mt-5 text-[clamp(3rem,6vw,6rem)] font-black uppercase leading-[.9] tracking-[-.075em]">TUTTO<br/>CHIARO.</h2>
   <div className="mt-10 border-t-2 border-black">{faq.map(([q,a],i)=><article key={q} className="grid gap-4 border-b-2 border-black py-7 md:grid-cols-[60px_.9fr_1.1fr]"><span className="font-mono text-xs font-black text-[#e93625]">{String(i+1).padStart(2,"0")}</span><h3 className="text-xl font-black uppercase leading-tight tracking-[-.04em]">{q}</h3><p className="text-sm leading-7 text-[#353331]">{a}</p></article>)}</div>
  </section>
  <section className="border-t-2 border-black bg-[#e93625] py-14"><div className={frame+" flex flex-wrap items-end justify-between gap-8"}><div><p className={eyebrow}>[ SI PARTE DA UNA CONVERSAZIONE ]</p><h2 className="mt-4 text-[clamp(2.9rem,5.4vw,5.5rem)] font-black uppercase leading-[.89] tracking-[-.075em]">IL PROSSIMO<br/>POTRESTI ESSERE TU.</h2></div><a href={rmpPhone.href} className={textButton}>PARLIAMO DEL TUO CANALE ↗</a></div></section>
 </PageShell>;
}
