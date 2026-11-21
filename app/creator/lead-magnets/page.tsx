"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";

type Brief={id:string;display_name:string;topic:string;audience:string;lead_magnet_idea:string;channel_url:string};
type Magnet={id:string;format:"checklist"|"mini_guide";title:string;subtitle:string;content:string;status:"draft"|"approved";version:number;updated_at:string};
type Response={ok?:boolean;account?:Brief;items?:Magnet[];item?:Magnet;error?:string};
type Idea={format:"checklist"|"mini_guide";title:string;subtitle:string;content:string};
const field="mt-2 w-full border-2 border-black bg-[#fffefa] px-4 py-3 text-base";
function proposals(b:Brief):Idea[]{
 const topic=(b.topic||"il tuo argomento").trim().slice(0,90),audience=(b.audience||"la tua community").trim().slice(0,120);
 const name=(b.display_name||"Creator").trim().slice(0,70);
 return [
  {format:"checklist",title:"Checklist essenziale: "+topic,subtitle:"Una lista pratica per "+audience,content:"CHECKLIST DI PARTENZA\n\n☐ Chiarisci cosa vuoi ottenere nell'ambito: "+topic+".\n☐ Individua ciò che hai già e ciò che ti manca.\n☐ Prepara gli strumenti e le informazioni indispensabili.\n☐ Scegli un primo passo semplice da completare oggi.\n☐ Verifica i risultati e annota cosa migliorare.\n\nNOTE E RISORSE UTILI\nAggiungi qui esempi reali, consigli pratici e fonti verificate.\n\nCreato con "+name+". Bozza da verificare, non ancora pronta alla distribuzione."},
  {format:"mini_guide",title:"Mini-guida per iniziare: "+topic,subtitle:"Primi passi chiari e concreti, pensati per "+audience,content:"INTRODUZIONE\nA chi è rivolta questa mini-guida e quale problema risolve? Scrivi un esempio concreto tratto dalla tua esperienza.\n\n1. PRIMA DI COMINCIARE\nSpiega le conoscenze e gli strumenti necessari senza dare nulla per scontato.\n\n2. IL METODO PASSO DOPO PASSO\nDescrivi tre azioni concrete, con istruzioni verificabili e un esempio per ogni azione.\n\n3. ERRORI COMUNI DA EVITARE\nElenca gli errori che hai visto davvero, perché accadono e come prevenirli.\n\n4. IL PROSSIMO PASSO\nSuggerisci una piccola attività che il lettore possa mettere in pratica oggi.\n\nRISORSE\nAggiungi collegamenti e crediti dopo averli verificati.\n\nBozza editoriale di "+name+": sostituisci le istruzioni con contenuti reali prima di approvare."},
  {format:"checklist",title:"Prima di scegliere: "+topic,subtitle:"Cosa controllare e quali domande fare prima di decidere",content:"PRIMA DI PRENDERE UNA DECISIONE\n\n☐ Definisci il tuo obiettivo concreto.\n☐ Stabilisci limiti di tempo, budget o difficoltà.\n☐ Scrivi almeno tre alternative realistiche.\n☐ Confronta vantaggi e svantaggi usando gli stessi criteri.\n☐ Cerca una fonte affidabile per ogni informazione importante.\n☐ Chiedi un parere se la scelta è complessa.\n☐ Annota la decisione e la motivazione.\n\nSCHEDE DI CONFRONTO\nAlternativa A: ...\nAlternativa B: ...\nAlternativa C: ...\n\nPersonalizza questa bozza per il tuo pubblico e verifica tutti i consigli prima della distribuzione."}
 ];
}
export default function MagnetBuilder(){
 const [account,setAccount]=useState<Brief|null>(null);
 const [items,setItems]=useState<Magnet[]>([]);
 const [selected,setSelected]=useState<Magnet|null>(null);
 const [title,setTitle]=useState("");const [subtitle,setSubtitle]=useState("");const [content,setContent]=useState("");
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
 const [error,setError]=useState(""),[notice,setNotice]=useState("");
 const load=useCallback(async()=>{try{
  const r=await fetch("/api/creator-lead-magnets",{cache:"no-store",credentials:"same-origin"});const j=await r.json() as Response;
  if(!r.ok)throw Error(j.error||"Impossibile caricare i documenti.");
  setAccount(j.account||null);setItems(j.items||[]);setError("");
 }catch(e){setError(e instanceof Error?e.message:"Errore di connessione.");}finally{setLoading(false)}},[]);
 useEffect(()=>{void load()},[load]);
 const select=(x:Magnet)=>{setSelected(x);setTitle(x.title);setSubtitle(x.subtitle);setContent(x.content);setError("");setNotice("");};
 async function create(idea:Idea){setBusy(true);setError("");setNotice("");try{
  const r=await fetch("/api/creator-lead-magnets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(idea)});
  const j=await r.json() as Response;if(!r.ok||!j.item)throw Error(j.error||"Creazione non riuscita.");
  setItems(prev=>[j.item!,...prev]);select(j.item);setNotice("Bozza creata. Modifica e verifica i contenuti prima di approvarla.");
 }catch(e){setError(e instanceof Error?e.message:"Errore imprevisto.");}finally{setBusy(false)}}
 async function save(status:"draft"|"approved"){if(!selected)return;setBusy(true);setError("");setNotice("");
  try{const r=await fetch("/api/creator-lead-magnets",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:selected.id,version:selected.version,title,subtitle,content,status})});
   const j=await r.json() as Response;if(!r.ok||!j.item)throw Error(j.error||"Salvataggio non riuscito.");
   setItems(prev=>prev.map(item=>item.id===j.item!.id?j.item!:item));select(j.item);
   setNotice(status==="approved"?"Versione approvata internamente. Nessuna pubblicazione automatica.":"Bozza salvata.");
  }catch(e){setError(e instanceof Error?e.message:"Errore imprevisto.");}finally{setBusy(false)}
 }
 const changed=selected&&(title!==selected.title||subtitle!==selected.subtitle||content!==selected.content);
 const print=()=>{if(!selected)return;if(changed){setError("Salva prima le modifiche, poi apri la stampa.");return;}if(selected.status!=="approved"){setError("Approva il documento prima di esportarlo.");return;}window.print();};
 const ideas=account?proposals(account):[];
 return <main className="min-h-screen bg-[#f3efe6] p-5 text-[#171615] sm:p-10">
 <div className="mx-auto max-w-6xl">
  <div className="no-print">
   <p className="font-bold uppercase tracking-widest">RMP WORKS / CREATOR STUDIO</p>
   <h1 className="mt-4 text-4xl font-black uppercase sm:text-6xl">Lead Magnet Studio</h1>
   <p className="mt-5 max-w-3xl text-base leading-8">Crea checklist e mini-guide partendo dal tuo brief, personalizza il contenuto, approva la versione e usa la funzione di stampa per salvarla in PDF. <strong>Solo ambiente privato.</strong></p>
   <div className="mt-5 flex flex-wrap gap-6"><Link href="/creator" className="font-semibold underline">← Creator Desk</Link><Link href="/creator/leads" className="font-semibold underline">Micro-CRM</Link></div>
   {loading&&<p className="mt-8">Caricamento…</p>}
   {!loading&&account&&<section className="mt-10">
    <h2 className="text-2xl font-black">Tre idee dal tuo brief</h2>
    <p className="mt-2 text-base leading-7">Queste sono proposte strutturate generate usando gli argomenti del brief: <strong>non sono ancora un'analisi AI del canale</strong>. Il contenuto contiene tracce da completare e verificare.</p>
    <div className="mt-5 grid gap-4 md:grid-cols-3">{ideas.map((x,i)=><article key={i} className="flex flex-col border-2 border-black bg-white p-5">
     <p className="font-bold uppercase text-sm">{x.format==="checklist"?"Checklist":"Mini-guida"} / Proposta {i+1}</p>
     <h3 className="mt-4 text-xl font-black">{x.title}</h3><p className="mt-3 flex-1 text-base leading-7">{x.subtitle}</p>
     <button disabled={busy} onClick={()=>void create(x)} className="mt-5 border-2 border-black bg-black px-4 py-3 font-bold text-white disabled:opacity-40">Crea una bozza privata</button>
    </article>)}</div>
   </section>}
   {items.length>0&&<section className="mt-10"><h2 className="text-2xl font-black">Le tue bozze</h2><div className="mt-4 flex flex-wrap gap-3">{items.map(x=><button key={x.id} onClick={()=>select(x)} className={"max-w-full border-2 border-black px-4 py-3 text-left "+(selected?.id===x.id?"bg-[#ffdf4e]":"bg-white")}><span className="block font-bold">{x.title}</span><span className="mt-1 block text-sm">{x.status==="approved"?"Approvato":"Bozza"} · v{x.version} · {x.format==="checklist"?"Checklist":"Mini-guida"}</span></button>)}</div></section>}
  </div>
  {selected&&<section className="mt-10 border-2 border-black bg-white">
   <div className="no-print border-b-2 border-black p-6"><h2 className="text-2xl font-black">Editor del documento</h2><p className="mt-2 text-base leading-7">Correggi le informazioni e aggiungi contenuti originali. Se modifichi un documento approvato, torna in bozza prima di approvarne la nuova versione.</p>
   <div className="mt-6 space-y-4"><label className="block font-bold">Titolo<input className={field} value={title} maxLength={180} onChange={e=>setTitle(e.target.value)}/></label>
    <label className="block font-bold">Sottotitolo<input className={field} value={subtitle} maxLength={300} onChange={e=>setSubtitle(e.target.value)}/></label>
    <label className="block font-bold">Testo del documento<textarea className={field+" min-h-96 font-mono leading-7"} value={content} maxLength={20000} onChange={e=>setContent(e.target.value)}/></label>
   </div>
   <div className="mt-5 flex flex-wrap gap-3"><button disabled={busy||!changed&&selected.status==="draft"} onClick={()=>void save("draft")} className="border-2 border-black bg-white px-5 py-3 font-bold disabled:opacity-40">Salva come bozza</button>
   <button disabled={busy||content.trim().length<80} onClick={()=>void save("approved")} className="border-2 border-black bg-[#ffdf4e] px-5 py-3 font-bold disabled:opacity-40">Approva versione</button>
   <button disabled={busy||selected.status!=="approved"||!!changed} onClick={print} className="border-2 border-black bg-black px-5 py-3 font-bold text-white disabled:opacity-40">Stampa / Salva come PDF</button></div>
   <p className="mt-3 text-sm leading-6">L'approvazione è solo interna: non attiva download pubblici, email, lead magnet o vendite. La stampa si apre solo per una versione approvata e salvata.</p>
   </div>
   <article className="print-document mx-auto max-w-3xl p-8 sm:p-12">
    <p className="text-sm font-bold uppercase tracking-widest">{account?.display_name||"Creator"} · Risorsa gratuita</p>
    <h2 className="mt-5 break-words text-3xl font-black">{title}</h2>
    <p className="mt-3 text-lg">{subtitle}</p>
    <div className="mt-8 whitespace-pre-wrap break-words text-base leading-8">{content}</div>
    <p className="mt-12 border-t border-black pt-5 text-sm">© {new Date().getFullYear()} {account?.display_name} · Creato con RMP Works</p>
   </article>
  </section>}
  <div className="no-print">{error&&<p role="alert" className="mt-7 border-l-4 border-red-700 pl-4 text-base">{error}</p>}{notice&&<p role="status" className="mt-7 border-l-4 border-green-700 pl-4 text-base">{notice}</p>}<p className="mt-10 text-sm">MVP editoriale privato. Le bozze non costituiscono contenuti verificati o disponibili al pubblico.</p></div>
 </div>
 <style jsx global>{`@media print { body { background:#fff !important; } .no-print {display:none !important;} .print-document {display:block !important;max-width:100% !important;border:none !important;padding:0 !important;} main {background:#fff !important;padding:0 !important;} .print-document h2 {break-after:avoid;} @page {size:A4;margin:18mm;} }`}</style>
 </main>;
}
