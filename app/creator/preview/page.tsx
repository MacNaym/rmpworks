"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import LeadMagnetPreviewForm from "../../_components/LeadMagnetPreviewForm";

type Profile={display_name:string;channel_url:string;slug:string;topic:string;audience:string;lead_magnet_idea:string;micro_product_idea:string;premium_product_idea:string;style_notes:string;inspiration_channels:string;status:string};
export default function CreatorPreview(){
 const [p,setP]=useState<Profile|null>(null);
 const [error,setError]=useState("");
 useEffect(()=>{let active=true;(async()=>{try{
  const r=await fetch("/api/creator-profile",{cache:"no-store",credentials:"same-origin"});
  if(!r.ok)throw new Error(r.status===401?"Devi accedere prima al Creator Desk.":"Impossibile recuperare il tuo brief.");
  const j=await r.json() as {account:Profile|null};
  if(!j.account)throw new Error("Completa e salva il brief per vedere l'anteprima.");
  if(active)setP(j.account);
 }catch(e){if(active)setError(e instanceof Error?e.message:"Errore temporaneo.");}})();return()=>{active=false}},[]);
 if(!p)return <main className="min-h-screen bg-[#f7f3ea] p-8 text-black"><div className="mx-auto max-w-3xl"><p className="text-sm font-bold uppercase tracking-widest">RMP WORKS / ANTEPRIMA PRIVATA</p><h1 className="mt-10 text-4xl font-black">{error||"Caricamento del brief…"}</h1><Link className="mt-8 inline-block underline" href="/creator">Torna al Creator Desk</Link></div></main>;
 return <main className="min-h-screen bg-[#f7f3ea] text-[#161514]">
  <div className="border-b-2 border-black bg-[#161514] px-6 py-3 text-center text-sm font-bold text-white">ANTEPRIMA PRIVATA · NON PUBBLICATA · NESSUNA VENDITA ATTIVA</div>
  <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-7"><strong className="text-2xl font-black">{p.display_name}</strong><Link href="/creator" className="font-bold underline">← Torna al Creator Desk</Link></header>
  <section className="border-y-2 border-black bg-[#ffdf4e]"><div className="mx-auto max-w-6xl px-6 py-20 sm:py-28"><p className="text-base font-bold uppercase tracking-widest">IL MIO SPAZIO CREATOR</p><h1 className="mt-5 break-words text-5xl font-black uppercase leading-none sm:text-7xl">{p.display_name}</h1><p className="mt-8 max-w-2xl text-lg leading-8">{p.topic||"Benvenuto nella mia community."}</p><p className="mt-4 max-w-2xl text-base leading-8">{p.audience||"Contenuti e risorse pensate per te."}</p><a className="mt-9 inline-block border-2 border-black bg-black px-7 py-4 font-bold text-white" href={p.channel_url} target="_blank" rel="noopener noreferrer">Scopri il mio canale ↗</a></div></section>
  <section className="mx-auto max-w-6xl px-6 py-16"><h2 className="mb-8 text-4xl font-black uppercase">Risorse e prodotti</h2><div className="grid gap-5 md:grid-cols-3">
   <article className="border-2 border-black bg-white p-7"><p className="font-bold uppercase text-sm">01 / GRATIS</p><h3 className="mt-5 text-2xl font-black">Un regalo per te</h3><p className="mt-4 text-base leading-7">{p.lead_magnet_idea||"Risorsa gratuita in preparazione."}</p><p className="mt-7 text-sm font-semibold">In preparazione</p></article>
   <article className="border-2 border-black bg-white p-7"><p className="font-bold uppercase text-sm">02 / MICROPRODOTTO</p><h3 className="mt-5 text-2xl font-black">Parti da qui</h3><p className="mt-4 text-base leading-7">{p.micro_product_idea||"Prodotto digitale in preparazione."}</p><p className="mt-7 text-sm font-semibold">Non acquistabile</p></article>
   <article className="border-2 border-black bg-white p-7"><p className="font-bold uppercase text-sm">03 / IN FUTURO</p><h3 className="mt-5 text-2xl font-black">Esperienza completa</h3><p className="mt-4 text-base leading-7">{p.premium_product_idea||"Progetto premium da definire."}</p><p className="mt-7 text-sm font-semibold">Da sviluppare insieme</p></article>
  </div></section>
  <LeadMagnetPreviewForm creatorName={p.display_name}/>
  <footer className="border-t-2 border-black px-6 py-8 text-center text-sm">Bozza visiva generata dal brief · {p.slug}.rmpworks.com è soltanto il sottodominio richiesto · RMP Works</footer>
 </main>;
}
