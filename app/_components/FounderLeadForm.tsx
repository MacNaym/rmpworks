"use client";
import {useState, type FormEvent} from "react";
import Link from "next/link";
type Status="idle"|"sending"|"success"|"error";
export function FounderLeadForm(){
 const [status,setStatus]=useState<Status>("idle");
 const [error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(status==="sending")return;
  const form=e.currentTarget;
  const values=new FormData(form);
  const payload={
   name:String(values.get("name")||""),
   email:String(values.get("email")||""),
   channel:String(values.get("channel")||""),
   note:String(values.get("note")||""),
   website:String(values.get("website")||""),
   privacy:values.get("privacy")==="on",
   marketing:values.get("marketing")==="on",
  };
  setStatus("sending");setError("");
  try{
   const response=await fetch("/api/founder",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const result=(await response.json()) as {ok?:boolean,error?:string};
   if(!response.ok||!result.ok)throw new Error(result.error||"Invio non riuscito.");
   setStatus("success");form.reset();
  }catch(err){setStatus("error");setError(err instanceof Error?err.message:"Errore di connessione.");}
 }
 const input="mt-2 w-full border-2 border-black bg-[#f4f2ed] px-4 py-3 text-sm outline-offset-4 placeholder:text-[#77716b] focus:outline-[#e93625]";
 const label="block font-mono text-[10px] font-black uppercase tracking-[.11em]";
 return <div id="richiesta-founder" className="border-2 border-black bg-[#fffefa] p-6 sm:p-9">
  <p className="font-mono text-[10px] font-black uppercase tracking-[.18em] text-[#e93625]">[ CONTATTO DIRETTO / FOUNDER ]</p>
  <h2 className="mt-5 text-[clamp(2.2rem,3.8vw,4.3rem)] font-black uppercase leading-[.91] tracking-[-.075em]">RACCONTACI<br/>IL TUO CANALE.</h2>
  {status==="success"?<div role="status" className="mt-8 border-l-4 border-[#e93625] pl-5"><p className="text-lg font-black">RICHIESTA RICEVUTA.</p><p className="mt-2 text-sm leading-7">Abbiamo registrato i tuoi dati. Ti contatteremo dopo aver valutato il progetto. Questa richiesta non è un acquisto né una prenotazione vincolante.</p><button type="button" className="mt-5 border-b-2 border-black font-mono text-xs font-black uppercase" onClick={()=>setStatus("idle")}>Invia un altro contatto ↗</button></div>:
  <form onSubmit={submit} className="mt-8 space-y-5">
   <div><label className={label} htmlFor="founder-name">Nome *</label><input className={input} id="founder-name" name="name" autoComplete="name" minLength={2} maxLength={100} required placeholder="Come ti chiami?"/></div>
   <div><label className={label} htmlFor="founder-email">Email *</label><input className={input} id="founder-email" name="email" type="email" autoComplete="email" maxLength={254} required placeholder="La tua email"/></div>
   <div><label className={label} htmlFor="founder-channel">Link del canale *</label><input className={input} id="founder-channel" name="channel" type="url" required maxLength={500} placeholder="https://youtube.com/@..."/></div>
   <div><label className={label} htmlFor="founder-note">Raccontaci il progetto (facoltativo)</label><textarea className={input+" min-h-28 resize-y"} id="founder-note" name="note" maxLength={1200} placeholder="Di cosa parla il tuo canale? Che prodotto vorresti creare?"/></div>
   <div aria-hidden="true" className="absolute -left-[10000px] -top-[10000px]"><label htmlFor="founder-website">Non compilare</label><input id="founder-website" name="website" tabIndex={-1} autoComplete="off"/></div>
   <label className="flex items-start gap-3 text-xs leading-6"><input type="checkbox" name="privacy" required className="mt-1 size-4 accent-[#e93625]"/><span>Ho letto l&apos;<Link href="/privacy" className="font-bold underline">informativa privacy</Link> e chiedo di essere ricontattato per questa richiesta. *</span></label>
   <label className="flex items-start gap-3 text-xs leading-6"><input type="checkbox" name="marketing" className="mt-1 size-4 accent-[#e93625]"/><span>Facoltativo: desidero ricevere aggiornamenti sulle iniziative e sulle offerte RMP Works. Posso revocare il consenso.</span></label>
   {status==="error"&&<p role="alert" className="border-l-4 border-[#e93625] pl-4 text-sm font-semibold">{error}</p>}
   <button type="submit" disabled={status==="sending"} className="w-full border-2 border-black bg-black px-6 py-5 font-mono text-xs font-black uppercase tracking-wider text-white hover:bg-[#e93625] hover:text-black disabled:opacity-60">{status==="sending"?"INVIO IN CORSO…":"INVIA LA RICHIESTA ↗"}</button>
   <p className="text-xs leading-6 text-[#56524e]">Nessun pagamento ora. Non inserire dati sensibili nel messaggio.</p>
  </form>}
 </div>;
}
