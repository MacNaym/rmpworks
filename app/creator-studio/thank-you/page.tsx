import Link from "next/link";
import FounderOrderStatus from "./FounderOrderStatus";
import type { Metadata } from "next";
import { PageShell, HeroMeta, frame, eyebrow } from "../../_components/EditorialShell";

export const metadata: Metadata = {
  title: "Richiesta di pagamento ricevuta | RMP Creator Studio",
  description: "Il tuo pagamento di prova Founder è stato inviato. Il team RMP Works verifica la transazione prima di avviare il servizio.",
  robots: { index: false, follow: false },
};

export default function FounderThanks() {
  return <PageShell active="creator">
    <section className={frame + " border-b-2 border-black pb-14 pt-12 sm:pb-20 sm:pt-16"}>
      <HeroMeta left="Creator Studio / Checkout" right="Pagamenti / Conferma"/>
      <p className={eyebrow + " text-[#e93625]"}>[ TEST CHECKOUT / NON È UN ACQUISTO REALE ]</p>
      <h1 className="mt-5 text-[clamp(3.1rem,8.7vw,9.5rem)] font-black uppercase leading-[.83] tracking-[-.085em]">
        GRANDE.<br/><span className="text-[#e93625]">CI SIAMO.</span>
      </h1>
    </section>
    <section className="grid border-b-2 border-black lg:grid-cols-2">
      <div className="border-b-2 border-black p-7 sm:p-11 lg:border-b-0 lg:border-r-2">
        <p className={eyebrow + " text-[#e93625]"}>[ COSA SUCCEDE ORA ]</p>
        <h2 className="mt-6 text-[clamp(2rem,4vw,4rem)] font-black leading-[.96] tracking-[-.065em]">Il checkout è finito. Ora verifichiamo il pagamento.</h2>
        <p className="mt-7 max-w-xl text-base leading-8 text-[#353331]">Se hai completato il pagamento di prova su Stripe, riceveremo un evento di conferma nel nostro sistema. Arrivare su questa pagina, da solo, non dimostra che il pagamento sia riuscito.</p>
        <FounderOrderStatus/>
        <div className="mt-9 border-l-2 border-[#e93625] pl-5 text-sm font-semibold leading-7">
          Questa è una simulazione sandbox. Non è stato addebitato denaro reale e non viene attivato alcun servizio.
        </div>
      </div>
      <div className="bg-[#171615] p-7 text-[#f4f2ed] sm:p-11">
        <p className={eyebrow + " text-[#ff513c]"}>[ I PROSSIMI TRE PASSI ]</p>
        <ol className="mt-10 border-t border-[#f4f2ed]/60">
          {[["01","CONFERMA STRIPE","Stripe comunica l'esito del pagamento al nostro server."],["02","REGISTRO ORDINI","Registriamo l'operazione verificata nel database RMP Works."],["03","ATTIVAZIONE REALE","Quando il servizio sarà in vendita, seguiranno le istruzioni di onboarding secondo le condizioni concordate."]].map(([n,t,d])=>
            <li key={n} className="grid gap-2 border-b border-[#f4f2ed]/50 py-6 sm:grid-cols-[3rem_1fr]">
              <span className="font-mono text-xs font-black text-[#ff513c]">{n}</span>
              <div><h3 className="text-xl font-black uppercase tracking-[-.045em]">{t}</h3><p className="mt-2 text-sm leading-7 text-[#d4cec8]">{d}</p></div>
            </li>
          )}
        </ol>
        <Link href="/creator-studio" className="mt-9 inline-block border-2 border-[#f4f2ed] bg-[#f4f2ed] px-6 py-4 font-mono text-xs font-black uppercase text-black hover:bg-[#e93625]">
          TORNA AL CREATOR STUDIO ↗
        </Link>
      </div>
    </section>
  </PageShell>;
}
