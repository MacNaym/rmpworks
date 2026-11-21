"use client";
import {useCallback,useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
type Product={id:string;title:string;description:string;price_cents:number;fulfillment_notes:string;status:"draft"|"ready_for_review";updated_at:string};
type Answer={products?:Product[];product?:Product;error?:string;ok?:boolean};
const input="mt-2 w-full border-2 border-black bg-white px-4 py-3 text-base";
export default function ProductDrafts(){
 const [items,setItems]=useState<Product[]>([]);
 const [selected,setSelected]=useState<string>("");
 const [title,setTitle]=useState(""),[description,setDescription]=useState(""),[price,setPrice]=useState("9"),[delivery,setDelivery]=useState("");
 const [pending,setPending]=useState(false),[loading,setLoading]=useState(true);
 const [error,setError]=useState(""),[notice,setNotice]=useState("");
 const load=useCallback(async()=>{
  try{const r=await fetch("/api/creator-products",{cache:"no-store",credentials:"same-origin"});const j=await r.json() as Answer;if(!r.ok)throw Error(j.error||"Impossibile caricare le bozze.");setItems(j.products||[]);setError("");}
  catch(e){setError(e instanceof Error?e.message:"Errore imprevisto.");}finally{setLoading(false)}
 },[]);
 useEffect(()=>{void load()},[load]);
 const pick=(p:Product)=>{setSelected(p.id);setTitle(p.title);setDescription(p.description);setPrice((p.price_cents/100).toFixed(2));setDelivery(p.fulfillment_notes);setNotice("");setError("");};
 const reset=()=>{setSelected("");setTitle("");setDescription("");setPrice("9");setDelivery("");setNotice("");setError("");};
 async function submit(e:FormEvent){e.preventDefault();setPending(true);setError("");setNotice("");
  try{
   const euros=Number(price.replace(",","."));
   const cents=Math.round(euros*100);
   if(!Number.isFinite(euros)||Math.abs(euros*100-cents)>0.001||cents<300||cents>9900)throw Error("Indica un prezzo fra 3 e 99 €, con massimo due decimali.");
   const data={title,description,fulfillment_notes:delivery,price_cents:cents,status:"draft",...(selected?{id:selected}:{})};
   const r=await fetch("/api/creator-products",{method:selected?"PATCH":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data),credentials:"same-origin"});
   const j=await r.json() as Answer;if(!r.ok||!j.product)throw Error(j.error||"Salvataggio non riuscito.");
   setItems(prev=>[j.product!,...prev.filter(x=>x.id!==j.product!.id)]);pick(j.product);setNotice("Bozza salvata. Non è acquistabile e non è visibile al pubblico.");
  }catch(e){setError(e instanceof Error?e.message:"Errore imprevisto.");}finally{setPending(false)}
 }
 async function sendReview(){
  const p=items.find(x=>x.id===selected);if(!p)return;
  if(p.title!==title||p.description!==description||p.fulfillment_notes!==delivery||p.price_cents!==Math.round(Number(price.replace(",","."))*100)){setError("Salva prima le modifiche, poi invia in revisione.");return;}
  setPending(true);setError("");setNotice("");
  try{const r=await fetch("/api/creator-products",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({...p,status:"ready_for_review"}),credentials:"same-origin"});const j=await r.json() as Answer;if(!r.ok||!j.product)throw Error(j.error||"Impossibile inviare in revisione.");setItems(prev=>prev.map(x=>x.id===p.id?j.product!:x));setNotice("Richiesta di revisione registrata. Nessuna pubblicazione o checkout attivati.");}
  catch(e){setError(e instanceof Error?e.message:"Errore imprevisto.");}finally{setPending(false)}
 }
 return <main className="min-h-screen bg-[#f7f3ea] p-6 text-black sm:p-10"><div className="mx-auto max-w-6xl">
  <p className="font-bold uppercase tracking-widest">RMP WORKS / CREATOR STUDIO</p><h1 className="mt-5 text-4xl font-black uppercase sm:text-6xl">Primo microprodotto</h1>
  <p className="mt-5 max-w-3xl text-base leading-8">Prepara una proposta vendibile: titolo, descrizione, prezzo e modalità di consegna. Le bozze restano private. <strong>Nessun checkout reale è attivo.</strong></p>
  <div className="mt-5 flex flex-wrap gap-5"><Link className="font-bold underline" href="/creator">← Creator Desk</Link><Link className="font-bold underline" href="/creator/lead-magnets">Lead Magnet Studio</Link></div>
  <div className="mt-10 grid gap-6 lg:grid-cols-[.33fr_.67fr]"><section className="border-2 border-black bg-white p-5">
   <h2 className="text-2xl font-black">Bozze prodotti</h2><button type="button" onClick={reset} className="mt-4 border-2 border-black bg-black px-4 py-3 font-bold text-white">+ Nuova bozza</button>
   {loading?<p className="mt-5">Caricamento…</p>:items.length===0?<p className="mt-5 text-base">Nessuna bozza ancora.</p>:<ul className="mt-5 space-y-3">{items.map(p=><li key={p.id}><button className={"w-full border-2 border-black p-4 text-left "+(selected===p.id?"bg-[#ffdf4e]":"bg-[#f7f3ea]")} onClick={()=>pick(p)}><strong>{p.title}</strong><span className="mt-2 block text-sm">{(p.price_cents/100).toLocaleString("it-IT",{style:"currency",currency:"EUR"})} · {p.status==="draft"?"Bozza":"In revisione"}</span></button></li>)}</ul>}
  </section>
  <section className="border-2 border-black bg-white p-6 sm:p-8"><h2 className="text-2xl font-black">{selected?"Modifica prodotto":"Nuovo prodotto"}</h2>
   <form className="mt-6 space-y-4" onSubmit={submit}>
    <label className="block font-semibold">Nome del prodotto<input value={title} onChange={e=>setTitle(e.target.value)} maxLength={180} minLength={3} required placeholder="Es. Guida pratica alla stampa 3D" className={input}/></label>
    <label className="block font-semibold">Descrizione<textarea value={description} onChange={e=>setDescription(e.target.value)} maxLength={3000} rows={5} placeholder="A chi è destinato? Cosa imparerà o riceverà?" className={input}/></label>
    <label className="block font-semibold">Prezzo previsto in euro (3–99)<input type="text" inputMode="decimal" value={price} onChange={e=>setPrice(e.target.value)} required placeholder="9,00" className={input}/></label>
    <label className="block font-semibold">Materiale e consegna previsti<textarea value={delivery} onChange={e=>setDelivery(e.target.value)} rows={4} maxLength={3000} placeholder="Es. PDF da 20 pagine, disponibile tramite link dopo il pagamento; contenuti da preparare e approvare." className={input}/></label>
    <button disabled={pending} className="w-full border-2 border-black bg-black p-4 font-bold text-white disabled:opacity-50">{pending?"Salvataggio…":"Salva bozza privata"}</button>
   </form>
   {selected&&<button disabled={pending} onClick={()=>void sendReview()} className="mt-4 w-full border-2 border-black bg-[#ffdf4e] p-4 font-bold disabled:opacity-50">Invia in revisione a RMP Works</button>}
   <p className="mt-5 text-sm leading-7">Questo catalogo prepara la vendita, ma non permette di acquistare. Il contratto, la fiscalità, il pagamento e la consegna saranno collaudati separatamente.</p>
  </section></div>
  {error&&<p role="alert" className="mt-7 border-l-4 border-red-700 pl-4">{error}</p>}{notice&&<p role="status" className="mt-7 border-l-4 border-green-700 pl-4">{notice}</p>}
 </div></main>;
}
