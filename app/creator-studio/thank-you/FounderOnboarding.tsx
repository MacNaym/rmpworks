"use client";
import {useState,type FormEvent} from "react";
type Phase="idle"|"sending"|"complete"|"error";
export default function FounderOnboarding(){
 const [phase,setPhase]=useState<Phase>("idle");
 const [error,setError]=useState("");
 async function onSubmit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(phase==="sending")return;
  const form=event.currentTarget;
  const values=new FormData(form);
  const session_id=new URLSearchParams(window.location.search).get("session_id")||"";
  setPhase("sending");setError("");
  try{
   const response=await fetch("/api/founder-onboarding",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
    session_id,creator_name:values.get("creator_name"),creator_email:values.get("creator_email"),
    channel_url:values.get("channel_url"),project_goal:values.get("project_goal"),acknowledge:values.get("acknowledge")==="on"
   })});
   const body=await response.json() as {ok?:boolean;error?:string};
   if(!response.ok||!body.ok)throw new Error(body.error||"Invio non riuscito.");
   setPhase("complete");
  }catch(e){setError(e instanceof Error?e.message:"Errore sconosciuto.");setPhase("error")}
 }
 const base="mt-2 w-full border-2 border-black bg-[#f4f2ed] px-4 py-3 text-sm text-black outline-offset-4 focus:outline-[#e93625]";
 const label="block font-mono text-[10px] font-black uppercase tracking-[.12em]";
 return <section className="mt-8 border-2 border-black bg-[#f4f2ed] p-6 sm:p-8">
  <p className="font-mono text-[10px] font-black uppercase tracking-[.14em] text-[#e93625]">[ ONBOARDING DEMO / SOLO ORDINI TEST PAGATI ]</p>
  <h3 className="mt-5 text-[clamp(1.6rem,3vw,2.6rem)] font-black uppercase leading-[.95] tracking-[-.055em]">ORA RACCONTACI IL TUO PROGETTO.</h3>
  <p className="mt-4 text-sm leading-7">Questo questionario dimostra come partirebbe l'attivazione Creator Studio. Non avvia una prestazione né genera obblighi reali. Inserisci solo dati di prova non sensibili.</p>
  {phase==="complete"?<p role="status" className="mt-6 border-l-4 border-[#e93625] pl-4 text-sm font-black leading-7">Questionario demo registrato nel database RMP Works. Nessun servizio è stato attivato.</p>:
  <form className="mt-8 space-y-5" onSubmit={onSubmit}>
   <div><label htmlFor="onboard-name" className={label}>Nome creator / brand *</label><input id="onboard-name" name="creator_name" className={base} required minLength={2} maxLength={100} placeholder="Nome del canale"/></div>
   <div><label htmlFor="onboard-email" className={label}>Email del pagamento test *</label><input id="onboard-email" name="creator_email" type="email" className={base} required maxLength={254} placeholder="Usa la stessa email inserita su Stripe"/></div>
   <div><label htmlFor="onboard-link" className={label}>Link del canale *</label><input id="onboard-link" name="channel_url" type="url" className={base} required maxLength={500} placeholder="https://youtube.com/@canale"/></div>
   <div><label htmlFor="onboard-goal" className={label}>Che prodotto vuoi creare? *</label><textarea id="onboard-goal" name="project_goal" className={base+" min-h-28 resize-y"} required minLength={10} maxLength={1000} placeholder="Raccontaci in poche righe quali sono le richieste più frequenti della community."/></div>
   <label className="flex items-start gap-3 text-xs leading-6"><input name="acknowledge" type="checkbox" required className="mt-1 size-4 accent-[#e93625]"/>Confermo che è una simulazione senza attivazione reale e che non invierò informazioni riservate.</label>
   {phase==="error"&&<p role="alert" className="border-l-4 border-[#e93625] pl-4 text-sm">{error}</p>}
   <button type="submit" disabled={phase==="sending"} className="w-full border-2 border-black bg-black px-5 py-4 font-mono text-[11px] font-black uppercase tracking-wider text-white hover:bg-[#e93625] hover:text-black disabled:opacity-50">{phase==="sending"?"INVIO IN CORSO…":"SALVA ONBOARDING DEMO ↗"}</button>
  </form>}
 </section>;
}
