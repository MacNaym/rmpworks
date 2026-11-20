"use client";
import {useEffect,useState} from "react";
type State="initial"|"processing"|"paid"|"pending"|"failed"|"expired"|"invalid"|"unavailable";
type Result={status:State;currency?:string;amount_total?:number;amount_tax?:number};
export default function FounderOrderStatus(){
 const [status,setStatus]=useState<State>("initial");
 const [details,setDetails]=useState<Result|null>(null);
 const [attempts,setAttempts]=useState(0);
 useEffect(()=>{
  const params=new URLSearchParams(window.location.search);
  const id=params.get("session_id")||"";
  if(!/^cs_test_[A-Za-z0-9]{15,180}$/.test(id)){setStatus("invalid");return;}
  let stopped=false;let timer:ReturnType<typeof setTimeout>|undefined;
  let n=0;
  const query=async()=>{
   try{
    const r=await fetch("/api/founder-order?session_id="+encodeURIComponent(id),{cache:"no-store"});
    const data=(await r.json()) as Result;
    if(stopped)return;
    const next=data.status||"unavailable";
    setStatus(next);setDetails(data);n++;setAttempts(n);
    if((next==="processing"||next==="pending")&&n<8)timer=setTimeout(query,2500);
   }catch{if(!stopped){setStatus("unavailable");}}
  };
  void query();
  return()=>{stopped=true;if(timer)clearTimeout(timer)};
 },[]);
 const fmt=(v:number)=>new Intl.NumberFormat("it-IT",{style:"currency",currency:"EUR"}).format(v/100);
 const map:Record<State,{heading:string,copy:string}>={
  initial:{heading:"VERIFICA IN CORSO",copy:"Stiamo consultando il registro ordini."},
  processing:{heading:"IN ATTESA DI CONFERMA",copy:"Il webhook Stripe potrebbe richiedere qualche secondo. Questa pagina non conferma un pagamento."},
  paid:{heading:"PAGAMENTO TEST CONFERMATO",copy:"Stripe ha confermato il pagamento e il nostro server l'ha registrato. Questo è un acquisto simulato: non genera addebiti reali né attiva servizi."},
  pending:{heading:"PAGAMENTO IN ELABORAZIONE",copy:"L'operazione non è ancora confermata. Non è prevista alcuna attivazione prima della conferma server."},
  failed:{heading:"PAGAMENTO NON RIUSCITO",copy:"Il registro segnala un errore. Non è stata attivata alcuna prestazione."},
  expired:{heading:"SESSIONE SCADUTA",copy:"Il pagamento non risulta concluso. Non è stata attivata alcuna prestazione."},
  invalid:{heading:"NESSUN ORDINE DA VERIFICARE",copy:"Questa pagina si può aprire anche direttamente. Per vedere la conferma occorre tornare qui da un Checkout Stripe valido."},
  unavailable:{heading:"VERIFICA TEMPORANEAMENTE NON DISPONIBILE",copy:"Non possiamo confermare l'esito in questo momento. Il nostro sistema non assume mai che un redirect equivalga a un pagamento riuscito."},
 };
 const current=map[status];
 return <section role="status" aria-live="polite" className="mt-8 border-2 border-black bg-[#fffefa] p-6 sm:p-8">
  <p className="font-mono text-[10px] font-black uppercase tracking-[.14em] text-[#e93625]">[ ESITO CONTROLLATO DAL SERVER / SANDBOX ]</p>
  <h3 className="mt-5 text-[clamp(1.6rem,3vw,2.8rem)] font-black uppercase leading-[.98] tracking-[-.06em]">{current.heading}</h3>
  <p className="mt-5 max-w-xl text-sm leading-7 text-[#353331]">{current.copy}</p>
  {status==="paid"&&details?.amount_total!==undefined&&<div className="mt-7 border-t-2 border-black pt-5 text-sm font-semibold">
    <p>Totale di prova: {fmt(details.amount_total)}</p>
    {details.amount_tax!==undefined&&<p>Di cui IVA: {fmt(details.amount_tax)}</p>}
  </div>}
  {(status==="processing"||status==="pending")&&attempts>=8&&<p className="mt-5 text-xs">La verifica automatica è terminata; aggiorna la pagina per controllare ancora.</p>}
  <p className="mt-7 border-t border-black/20 pt-4 font-mono text-[10px] font-semibold uppercase">Nessun documento fiscale o contratto è generato da questa pagina.</p>
 </section>;
}
