"use client";
import {useCallback,useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
type Lead={id:string;full_name:string;email:string;source:string;status:string;created_at:string};
type Api={leads?:Lead[];lead?:Lead;error?:string;ok?:boolean};
const steps=[["new","Nuovo"],["contacted","Contattato"],["qualified","Qualificato"],["converted","Convertito"],["archived","Archiviato"]] as const;
const field="w-full border-2 border-black bg-white p-3 text-base";
export default function CreatorLeads(){
 const [leads,setLeads]=useState<Lead[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [fullName,setFullName]=useState("");
 const [email,setEmail]=useState("");
 const [consent,setConsent]=useState(false);
 const [saving,setSaving]=useState(false);
 const [editing,setEditing]=useState("");
 const load=useCallback(async()=>{
  try{const r=await fetch("/api/creator-leads",{cache:"no-store",credentials:"same-origin"});const j=await r.json() as Api;if(!r.ok)throw Error(j.error||"Impossibile caricare i contatti.");setLeads(j.leads||[]);setError("");}
  catch(e){setError(e instanceof Error?e.message:"Errore imprevisto.");}
  finally{setLoading(false)}
 },[]);
 useEffect(()=>{void load()},[load]);
 async function add(e:FormEvent){e.preventDefault();setSaving(true);setError("");setNotice("");
  try{const r=await fetch("/api/creator-leads",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({full_name:fullName,email,consent})});const j=await r.json() as Api;if(!r.ok)throw Error(j.error||"Contatto non salvato.");setFullName("");setEmail("");setConsent(false);setNotice("Contatto di prova registrato.");await load();}
  catch(e){setError(e instanceof Error?e.message:"Errore imprevisto.");}finally{setSaving(false)}
 }
 async function removeTestLead(id:string){
  if(!window.confirm("Vuoi eliminare definitivamente questo contatto di prova dal CRM? Non potrai recuperarlo."))return;
  setEditing(id);setError("");setNotice("");
  try{
   const r=await fetch("/api/creator-leads",{method:"DELETE",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({id})});
   const j=await r.json() as Api;
   if(!r.ok)throw Error(j.error||"Eliminazione non riuscita.");
   setLeads(prev=>prev.filter(l=>l.id!==id));setNotice("Contatto di prova eliminato definitivamente.");
  }catch(e){setError(e instanceof Error?e.message:"Errore imprevisto.");}finally{setEditing("")}
 }
 async function update(id:string,status:string){setEditing(id);setError("");setNotice("");
  try{const r=await fetch("/api/creator-leads",{method:"PATCH",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({id,status})});const j=await r.json() as Api;if(!r.ok)throw Error(j.error||"Aggiornamento non riuscito.");setLeads(prev=>prev.map(l=>l.id===id?{...l,status}:l));}
  catch(e){setError(e instanceof Error?e.message:"Errore imprevisto.");}finally{setEditing("")}
 }
 return <main className="min-h-screen bg-[#f7f3ea] p-6 text-[#161514] sm:p-10">
 <div className="mx-auto max-w-5xl">
 <p className="font-bold uppercase tracking-widest">RMP WORKS / CREATOR STUDIO</p>
 <h1 className="mt-5 text-4xl font-black uppercase sm:text-6xl">Micro-CRM</h1>
 <p className="mt-5 max-w-3xl text-base leading-8">Qui vedrai i contatti interessati al tuo progetto e potrai seguirli nelle varie fasi. Per ora è un ambiente di prova: non è ancora collegato a una pagina pubblica, e non invia comunicazioni automatiche.</p>
 <div className="mt-6 flex gap-5"><Link href="/creator" className="font-bold underline">← Creator Desk</Link><Link href="/creator/preview" className="font-bold underline">Anteprima spazio</Link></div>
 <div className="mt-10 grid gap-8 lg:grid-cols-[.42fr_.58fr]">
  <section className="border-2 border-black bg-white p-6">
   <h2 className="text-2xl font-black">Inserisci un contatto di prova</h2>
   <p className="mt-3 text-base leading-7">Usa solo un indirizzo che controlli o per cui hai il consenso. Il modulo registra dati di prova: non invia email né autorizza marketing.</p>
   <form className="mt-6 space-y-4" onSubmit={add}>
    <label className="block font-bold">Nome (facoltativo)<input className={field+" mt-2"} maxLength={120} value={fullName} onChange={e=>setFullName(e.target.value)} placeholder="Nome o soprannome"/></label>
    <label className="block font-bold">Email<input type="email" className={field+" mt-2"} required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="persona@esempio.it"/></label>
    <label className="flex items-start gap-3 leading-7"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} className="mt-2" required/><span>Confermo di avere il diritto di utilizzare questi dati per un test privato del CRM. Nessun consenso al marketing.</span></label>
    <button className="w-full border-2 border-black bg-black p-4 font-bold text-white disabled:opacity-40" disabled={saving||!consent}>{saving?"Salvataggio…":"Registra contatto di prova"}</button>
   </form>
  </section>
  <section className="border-2 border-black bg-white p-6">
   <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-2xl font-black">I tuoi contatti</h2><strong>{leads.length} visualizzati</strong></div>
   {loading?<p className="mt-6">Caricamento…</p>:leads.length===0?<p className="mt-6 leading-7">Ancora nessun contatto registrato. Aggiungine uno di prova per verificare il flusso.</p>:
    <ul className="mt-6 space-y-4">{leads.map(l=><li key={l.id} className="border-2 border-black/20 p-4">
     <p className="break-words text-lg font-bold">{l.full_name||l.email}</p>{l.full_name&&<p className="mt-1 break-words">{l.email}</p>}
     <p className="mt-2 text-sm text-[#555]">Origine: {l.source==="preview_test"?"Test privato":l.source} · {new Date(l.created_at).toLocaleDateString("it-IT")}</p>
     <label className="mt-3 block font-semibold">Stato<select className={field+" mt-2"} value={l.status} disabled={editing===l.id} onChange={e=>void update(l.id,e.target.value)}>{steps.map(([v,t])=><option value={v} key={v}>{t}</option>)}</select></label>
     {l.source==="preview_test"&&<button type="button" className="mt-3 text-sm font-semibold text-[#a52217] underline disabled:opacity-40" disabled={editing===l.id} onClick={()=>void removeTestLead(l.id)}>Elimina contatto di prova</button>}
    </li>)}</ul>}
  </section>
 </div>
 {notice&&<p role="status" className="mt-6 border-l-4 border-black pl-4">{notice}</p>}
 {error&&<p role="alert" className="mt-6 border-l-4 border-[#c52215] pl-4">{error}</p>}
 <p className="mt-10 text-sm leading-7">CRM pilota · Non pubblicato sul sottodominio del creator · Nessun checkout attivo.</p>
 </div></main>;
}
