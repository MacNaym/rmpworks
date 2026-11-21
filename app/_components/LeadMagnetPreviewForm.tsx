"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";

type Result={ok?:boolean;error?:string};
type Magnet={id:string;title:string;status:string};
export default function LeadMagnetPreviewForm({creatorName}:{creatorName:string}){
 const [name,setName]=useState("");
 const [email,setEmail]=useState("");
 const [consent,setConsent]=useState(false);
 const [pending,setPending]=useState(false);
 const [notice,setNotice]=useState("");
 const [error,setError]=useState("");
 const [magnets,setMagnets]=useState<Magnet[]>([]);
 const [magnetId,setMagnetId]=useState("");
 const [deliveredId,setDeliveredId]=useState("");
 useEffect(()=>{let active=true;(async()=>{try{const r=await fetch("/api/creator-lead-magnets",{cache:"no-store",credentials:"same-origin"});if(!r.ok)return;const j=await r.json() as {items?:Magnet[]};if(active)setMagnets((j.items||[]).filter(m=>m.status==="approved"));}catch{}})();return()=>{active=false}},[]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setPending(true);setError("");setNotice("");setDeliveredId("");
  try{
   const r=await fetch("/api/creator-leads",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({full_name:name,email,consent})});
   const result=await r.json() as Result;
   if(!r.ok)throw new Error(result.error||"Non è stato possibile registrare il contatto.");
   setNotice("Contatto di prova registrato nel CRM! Nessuna email è stata inviata.");
   if(magnetId)setDeliveredId(magnetId);
   setName("");setEmail("");setConsent(false);
  }catch(e){setError(e instanceof Error?e.message:"Errore di connessione.")}
  finally{setPending(false)}
 }
 return <section className="border-t-2 border-black bg-[#e8ede8] px-6 py-16">
  <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
   <div>
    <p className="font-bold uppercase tracking-widest">Anteprima lead magnet</p>
    <h2 className="mt-5 text-4xl font-black uppercase sm:text-5xl">Costruiamo la tua community.</h2>
    <p className="mt-6 text-lg leading-8">Qui i visitatori potranno lasciare un contatto per ricevere una risorsa gratuita di {creatorName}. Per ora stiamo collaudando soltanto la registrazione nel micro-CRM.</p>
    <p className="mt-5 border-l-4 border-black pl-4 text-base leading-7"><strong>Solo test privato:</strong> nessuna newsletter, nessun messaggio automatico e nessuna risorsa inviata. Questo modulo non è accessibile al pubblico senza login.</p>
   </div>
   <form onSubmit={submit} className="space-y-4 border-2 border-black bg-white p-6 sm:p-8">
    <h3 className="text-2xl font-black">Testa il modulo d'iscrizione</h3>
    <label className="block font-semibold">Nome (facoltativo)
     <input value={name} onChange={e=>setName(e.target.value)} maxLength={120} placeholder="Come ti chiami?" className="mt-2 w-full border-2 border-black p-3 text-base"/>
    </label>
    <label className="block font-semibold">Indirizzo email
     <input type="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} required placeholder="tu@esempio.it" className="mt-2 w-full border-2 border-black p-3 text-base"/>
    </label>
    <label className="flex items-start gap-3 text-base leading-7">
     <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required className="mt-2"/>
     <span>Confermo di utilizzare un indirizzo che controllo o per cui sono autorizzato a registrare dati di prova nel CRM privato di RMP Works. Questo non è consenso a ricevere marketing.</span>
    </label>
    {magnets.length>0&&<label className="block font-semibold">Risorsa gratuita da consegnare nel test (facoltativa)
     <select value={magnetId} onChange={e=>setMagnetId(e.target.value)} className="mt-2 w-full border-2 border-black p-3 text-base"><option value="">Non consegnare una risorsa</option>{magnets.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select>
    </label>}
    <button disabled={pending||!consent} className="w-full border-2 border-black bg-black px-5 py-4 text-base font-bold text-white disabled:opacity-40">{pending?"Registrazione…":"Registra lead di prova"}</button>
    {notice&&<div role="status" className="border-l-4 border-green-700 pl-4 text-base leading-7">{notice}<p className="mt-3"><Link href="/creator/leads" className="font-bold underline">Verifica il contatto nel CRM</Link></p>{deliveredId&&<p className="mt-3"><a className="font-bold underline" href={"/api/creator-lead-magnet-download?id="+encodeURIComponent(deliveredId)}>Scarica la risorsa approvata (HTML stampabile)</a></p>}</div>}
    {error&&<p role="alert" className="border-l-4 border-red-700 pl-4 text-base leading-7">{error}</p>}
   </form>
  </div>
 </section>;
}
