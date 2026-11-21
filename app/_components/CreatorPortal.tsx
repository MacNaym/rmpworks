"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";

type Profile={
 id?:string;display_name:string;channel_url:string;slug:string;topic:string;audience:string;
 lead_magnet_idea:string;micro_product_idea:string;premium_product_idea:string;style_notes:string;inspiration_channels:string;
 onboarding_step?:number;status?:string;
};
const empty:Profile={display_name:"",channel_url:"",slug:"",topic:"",audience:"",lead_magnet_idea:"",micro_product_idea:"",premium_product_idea:"",style_notes:"",inspiration_channels:""};
type AuthState="loading"|"unavailable"|"logged_out"|"email_sent"|"authenticated";
type Step={tag:string;title:string;subtitle:string};
const steps:Step[]=[
 {tag:"IDENTITÀ",title:"CHI SEI?",subtitle:"Partiamo dal nome con cui ti conosce la tua community."},
 {tag:"CANALE",title:"A CHI PARLI?",subtitle:"Il canale e le persone a cui vuoi essere utile."},
 {tag:"SPAZIO",title:"LA TUA CASA.",subtitle:"Scegli il nome pubblico del tuo futuro spazio creator."},
 {tag:"PRODOTTI",title:"COSA VENDI?",subtitle:"Partiamo da un regalo utile e arriviamo al primo microprodotto."},
 {tag:"RIEPILOGO",title:"CI SIAMO.",subtitle:"Controlla le informazioni, poi salva il tuo brief."},
];
const input="mt-2 w-full border-2 border-black bg-[#fffefa] px-4 py-3 text-sm outline-offset-4 focus:outline-[#e93625]";
const label="block font-mono text-[10px] font-black uppercase tracking-[.12em]";
function InputField({id,title,value,onChange,placeholder="",required=true}:{id:string;title:string;value:string;onChange:(s:string)=>void;placeholder?:string;required?:boolean}){
 return <div><label htmlFor={id} className={label}>{title}{required?" *":""}</label><input id={id} name={id} required={required} value={value} onChange={e=>onChange(e.target.value)} className={input} placeholder={placeholder} maxLength={500}/></div>;
}
function AreaField({id,title,value,onChange,placeholder=""}:{id:string;title:string;value:string;onChange:(s:string)=>void;placeholder?:string}){
 return <div><label htmlFor={id} className={label}>{title}</label><textarea id={id} value={value} onChange={e=>onChange(e.target.value)} className={input+" min-h-28 resize-y"} placeholder={placeholder} maxLength={1000}/></div>;
}
export default function CreatorPortal(){
 const [auth,setAuth]=useState<AuthState>("loading");
 const [email,setEmail]=useState("");
 const [token,setToken]=useState("");
 const [message,setMessage]=useState("");
 const [busy,setBusy]=useState(false);
 const [step,setStep]=useState(0);
 const [profile,setProfile]=useState<Profile>(empty);
 const [saved,setSaved]=useState(false);
 const [error,setError]=useState("");
 const change=(key:keyof Profile,v:string)=>setProfile(p=>({...p,[key]:v}));
 async function loadProfile(){
  const r=await fetch("/api/creator-profile",{cache:"no-store"});
  if(r.status===401){setAuth("logged_out");return;}
  if(!r.ok)throw new Error("Impossibile caricare la scheda.");
  const json=await r.json() as {account?:Profile|null};
  if(json.account){setProfile({...empty,...json.account});setSaved(true);}
 }
 useEffect(()=>{
  let mounted=true;
  (async()=>{
   try{
    const r=await fetch("/api/creator-auth",{cache:"no-store"});
    const j=await r.json() as {configured?:boolean;authenticated?:boolean;email?:string};
    if(!mounted)return;
    if(!r.ok||!j.configured){setAuth("unavailable");return;}
    if(j.authenticated){setEmail(j.email||"");setAuth("authenticated");await loadProfile();}
    else setAuth("logged_out");
   }catch{if(mounted)setAuth("unavailable")}
  })();return()=>{mounted=false};
 },[]);
 async function authRequest(action:"request"|"verify"|"logout"){
  setBusy(true);setError("");setMessage("");
  try{
   const r=await fetch("/api/creator-auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,email,token})});
   const j=await r.json() as {error?:string};
   if(!r.ok)throw new Error(j.error||"Operazione non riuscita.");
   if(action==="request"){setAuth("email_sent");setMessage("Ti abbiamo inviato un codice email. Controlla anche la cartella spam.");}
   if(action==="verify"){setAuth("authenticated");setToken("");await loadProfile();}
   if(action==="logout"){setProfile(empty);setSaved(false);setEmail("");setAuth("logged_out");}
  }catch(e){setError(e instanceof Error?e.message:"Errore di connessione.");}
  finally{setBusy(false)}
 }
 const next=()=>{
  setError("");
  if(step===0&&profile.display_name.trim().length<2){setError("Inserisci il nome del creator.");return;}
  if(step===1){
   try{const u=new URL(profile.channel_url);if(u.protocol!=="https:")throw Error();}catch{setError("Inserisci un indirizzo HTTPS valido del canale.");return;}
   if(profile.topic.trim().length<3){setError("Indica l'argomento del canale.");return;}
  }
  if(step===2&&!/^[a-z0-9][a-z0-9-]{2,39}$/.test(profile.slug)){setError("Usa 3-40 lettere minuscole, numeri o trattini per il sottodominio.");return;}
  if(step===2&&profile.inspiration_channels.trim()){
   const refs=profile.inspiration_channels.split("\n").map(x=>x.trim()).filter(Boolean);
   if(refs.length<3||refs.length>5){setError("Inserisci da 3 a 5 canali, uno per riga, oppure lascia il campo vuoto.");return;}
  }
  setStep(s=>Math.min(4,s+1));
 };
 async function save(event:FormEvent){
  event.preventDefault();setBusy(true);setError("");
  try{
   const r=await fetch("/api/creator-profile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(profile)});
   const j=await r.json() as {ok?:boolean;error?:string;account?:Profile};
   if(!r.ok||!j.ok)throw new Error(j.error||"Impossibile salvare.");
   setProfile(p=>({...p,...j.account}));setSaved(true);
  }catch(e){setError(e instanceof Error?e.message:"Errore durante il salvataggio.");}
  finally{setBusy(false)}
 }
 if(auth==="loading")return <div role="status" className="border-2 border-black p-8 font-mono text-xs font-bold uppercase">Verifica accesso in corso…</div>;
 if(auth==="unavailable")return <div className="border-2 border-black bg-[#fffefa] p-8 sm:p-12"><p className="font-mono text-[10px] font-black uppercase text-[#e93625]">[ AREA CREATOR / IN PREPARAZIONE ]</p><h2 className="mt-6 text-4xl font-black uppercase tracking-[-.06em]">IL TUO SPAZIO STA PRENDENDO FORMA.</h2><p className="mt-6 max-w-xl text-sm leading-7">Stiamo completando l'ambiente di autenticazione dedicato. Non è ancora possibile creare account o salvare informazioni. Il pagamento Founder reale è disattivato.</p><Link href="/creator-studio" className="mt-8 inline-block border-2 border-black bg-black px-6 py-4 font-mono text-xs font-black text-white">TORNA AL CREATOR STUDIO ↗</Link></div>;
 if(auth!=="authenticated")return <div className="grid border-2 border-black bg-[#fffefa] md:grid-cols-2">
  <div className="border-b-2 border-black p-8 md:border-b-0 md:border-r-2 md:p-12"><p className="font-mono text-[10px] font-black uppercase tracking-[.15em] text-[#e93625]">[ ACCESSO RISERVATO / FOUNDER ]</p><h2 className="mt-6 text-[clamp(2.4rem,5vw,5rem)] font-black uppercase leading-[.88] tracking-[-.07em]">BENVENUTO<br/>A BORDO.</h2><p className="mt-7 text-sm leading-7">Usa l'email dell'acquisto Founder verificato. Ti inviamo un codice monouso: niente password da ricordare. L'accesso è limitato ai clienti idonei.</p></div>
  <div className="p-8 md:p-12">
   {auth==="logged_out"?<form onSubmit={e=>{e.preventDefault();void authRequest("request")}}><label htmlFor="login-email" className={label}>Email usata per l'acquisto</label><input id="login-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required className={input}/><button disabled={busy} className="mt-6 w-full border-2 border-black bg-black p-4 font-mono text-xs font-black uppercase text-white disabled:opacity-50">INVIA CODICE ↗</button></form>:
   <form onSubmit={e=>{e.preventDefault();void authRequest("verify")}}><p className="mb-5 text-sm">{message}</p><label htmlFor="otp-code" className={label}>Codice ricevuto via email</label><input id="otp-code" inputMode="numeric" pattern="[0-9]{6,8}" autoComplete="one-time-code" value={token} onChange={e=>setToken(e.target.value)} required className={input}/><button disabled={busy} className="mt-6 w-full border-2 border-black bg-black p-4 font-mono text-xs font-black uppercase text-white disabled:opacity-50">ENTRA NELLA TUA AREA ↗</button><button type="button" className="mt-4 text-xs underline" onClick={()=>setAuth("logged_out")}>Cambia email</button></form>}
   {error&&<p role="alert" className="mt-5 border-l-4 border-[#e93625] pl-3 text-sm">{error}</p>}
  </div>
 </div>;
 return <div className="border-2 border-black bg-[#fffefa]">
  <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black p-5 sm:p-7"><div><p className="font-mono text-[10px] font-black uppercase text-[#e93625]">[ CREATOR DESK / AREA PRIVATA ]</p><p className="mt-2 text-sm font-semibold">{email}</p></div><button className="border-b-2 border-black pb-1 font-mono text-xs font-bold uppercase" onClick={()=>void authRequest("logout")} disabled={busy}>Esci ↗</button></div>
  {saved?<section className="p-7 sm:p-12">
   <p className="font-mono text-[10px] font-black uppercase text-[#e93625]">[ DASHBOARD / BRIEF SALVATO ]</p>
   <h2 className="mt-5 text-[clamp(2.2rem,5vw,5rem)] font-black uppercase leading-[.88] tracking-[-.07em]">{profile.display_name}</h2>
   <p className="mt-6 max-w-2xl text-sm leading-7">La scheda del tuo progetto è registrata. Il sito pubblico, il CRM e i prodotti non sono ancora attivati: il brief sarà esaminato prima dell'avvio dei lavori.</p>
   <div className="mt-5"><a className="inline-block border-2 border-black bg-[#e93625] px-6 py-4 font-bold text-black" href="/creator/preview">VEDI ANTEPRIMA DEL TUO SPAZIO ↗</a> <a className="ml-0 mt-3 inline-block border-2 border-black bg-black px-6 py-4 font-bold text-white sm:ml-3" href="/creator/leads">APRI MICRO-CRM ↗</a> <a className="ml-0 mt-3 inline-block border-2 border-black bg-white px-6 py-4 font-bold text-black sm:ml-3" href="/creator/lead-magnets">GENERA LEAD MAGNET ↗</a><p className="mt-2 text-sm">Anteprima privata: non è ancora il sottodominio pubblico.</p></div><div className="mt-10 grid gap-4 sm:grid-cols-3">{[["STATO",profile.status||"onboarding"],["SPAZIO DESIDERATO",profile.slug+".rmpworks.com"],["PRIMO PRODOTTO",profile.micro_product_idea||"Da definire"]].map(([k,v])=><div className="border-2 border-black p-5" key={k}><p className="font-mono text-[10px] font-black uppercase text-[#e93625]">{k}</p><p className="mt-4 break-words text-sm font-semibold">{v}</p></div>)}</div>
   <button className="mt-8 border-2 border-black bg-black px-6 py-4 font-mono text-xs font-black uppercase text-white" onClick={()=>{setSaved(false);setStep(0)}}>MODIFICA IL BRIEF ↗</button>
  </section>:
  <section className="grid lg:grid-cols-[.38fr_.62fr]">
   <aside className="border-b-2 border-black bg-[#171615] p-7 text-white lg:border-b-0 lg:border-r-2 lg:p-10">
    <p className="font-mono text-[10px] font-black uppercase text-[#ff513c]">[ IL TUO PERCORSO ]</p>
    <h2 className="mt-6 text-[clamp(2.2rem,4vw,4.5rem)] font-black uppercase leading-[.9] tracking-[-.06em]">CINQUE<br/>PASSI.<br/><span className="text-[#ff513c]">UN PROGETTO.</span></h2>
    <ol className="mt-10 space-y-3">{steps.map((s,i)=><li key={s.tag} className={"flex items-center gap-3 border-b border-white/20 pb-3 font-mono text-[10px] font-bold uppercase "+(i===step?"text-[#ff513c]":"text-[#bcb7b2]")}><span>{String(i+1).padStart(2,"0")}</span>{s.tag}</li>)}</ol>
   </aside>
   <div className="p-7 sm:p-10">
    <p className="font-mono text-xs font-black text-[#e93625]">STEP {String(step+1).padStart(2,"0")} / 05 — {steps[step].tag}</p>
    <h2 className="mt-5 text-[clamp(2.2rem,4vw,4.3rem)] font-black uppercase leading-[.9] tracking-[-.065em]">{steps[step].title}</h2>
    <p className="mt-5 text-sm leading-7">{steps[step].subtitle}</p>
    <div className="mt-9 space-y-6">
     {step===0&&<InputField id="creator-display" title="Nome creator / brand" value={profile.display_name} onChange={v=>change("display_name",v)} placeholder="Come ti conosce il pubblico?"/>}
     {step===1&&<><InputField id="creator-channel" title="Link del canale" value={profile.channel_url} onChange={v=>change("channel_url",v)} placeholder="https://youtube.com/@..."/><InputField id="creator-topic" title="Argomento principale" value={profile.topic} onChange={v=>change("topic",v)}/><AreaField id="creator-audience" title="A chi ti rivolgi?" value={profile.audience} onChange={v=>change("audience",v)}/></>}
     {step===2&&<><InputField id="creator-slug" title="Sottodominio desiderato" value={profile.slug} onChange={v=>change("slug",v.toLowerCase().replace(/[^a-z0-9-]/g,""))} placeholder="nomecreator"/><p className="font-mono text-xs">ANTEPRIMA: {profile.slug||"nomecreator"}.rmpworks.com</p>
      <div className="border-2 border-black/20 bg-[#f5f3ee] p-5" aria-label="Mini guida allo stile grafico">
       <p className="font-bold">Non sei un designer? Nessun problema.</p>
       <p className="mt-2 leading-7">Puoi raccontarci in parole semplici: che atmosfera vuoi (divertente, professionale, energica), quali colori preferisci, un sito che ti piace e cosa vuoi evitare. Non serve conoscere termini tecnici.</p>
       <button type="button" className="mt-4 border-2 border-black bg-white px-4 py-3 font-semibold underline underline-offset-4" onClick={()=>{if(!profile.style_notes.trim())change("style_notes","Non ho riferimenti visivi precisi. Preferisco uno stile moderno, leggibile e adatto al mio pubblico. Vorrei ricevere 2-3 proposte tra cui scegliere, evitando testi piccoli e pagine affollate.");}}>Non lo so: proponetemi voi uno stile</button>
       <p className="mt-3 text-sm">Il suggerimento non sostituisce le tue risposte se hai già scritto qualcosa.</p>
      </div>
      <AreaField id="creator-style" title="Stile e riferimenti visivi (facoltativo)" value={profile.style_notes} onChange={v=>change("style_notes",v)} placeholder="Es. colori blu e nero, atmosfera amichevole, niente animazioni..." />
      <div className="border-2 border-black/20 p-5">
       <p className="font-bold">Quali canali ti piacciono?</p>
       <p className="mt-2 leading-7">Indicaci da 3 a 5 canali YouTube, Twitch o altri creator che trovi belli da vedere. <strong>Non devono appartenere alla tua nicchia.</strong> Possiamo usarli per capire colori, ritmo, tono e atmosfera, senza copiarli.</p>
       <p className="mt-2 text-sm">Scrivi un canale per riga, con nome o link. È facoltativo: se non hai esempi puoi lasciare vuoto.</p>
       <AreaField id="creator-inspiration-channels" title="3–5 canali di ispirazione (facoltativo)" value={profile.inspiration_channels} onChange={v=>change("inspiration_channels",v)} placeholder={"Es. https://youtube.com/@canale1\nCanale che adoro per i colori\nCreator che mi piace per la grafica"} />
      </div></>}
     {step===3&&<>
      <div className="border-2 border-black/20 bg-[#f5f3ee] p-5">
       <p className="font-bold">Non devi inventarti i prodotti da solo.</p>
       <p className="mt-2 leading-7">Un regalo gratuito raccoglie contatti; un prodotto economico offre un primo acquisto semplice; un premium è un progetto più importante da valutare insieme. Ecco tre modi per partire:</p>
       <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" className="border-2 border-black bg-white p-3 text-left font-semibold" onClick={()=>{
         setProfile(p=>({...p,lead_magnet_idea:p.lead_magnet_idea||"Vorrei un quiz, una checklist o una mini guida gratuita utile al mio pubblico.",micro_product_idea:p.micro_product_idea||"Vorrei un piccolo prodotto digitale (5-19 euro), per esempio una guida pratica, un template o una raccolta di risorse.",premium_product_idea:p.premium_product_idea||"In futuro valuterei un corso completo o un kit avanzato da realizzare insieme a RMP Works."}));}}>
         Mostrami esempi di prodotti
        </button>
        <button type="button" className="border-2 border-black bg-white p-3 text-left font-semibold" onClick={()=>{
         setProfile(p=>({...p,lead_magnet_idea:p.lead_magnet_idea||"Non ho idee precise: vorrei discuterne con RMP Works per scegliere una risorsa gratuita adatta al mio pubblico.",micro_product_idea:p.micro_product_idea||"Vorrei discutere con RMP Works alcune proposte di microprodotti prima di sceglierne uno.",premium_product_idea:p.premium_product_idea||"Vorrei valutare insieme a RMP Works se un prodotto premium ha senso per la mia community."}));}}>
         Preferisco parlarne con RMP Works
        </button>
        <button type="button" className="border-2 border-black bg-white p-3 text-left font-semibold sm:col-span-2" onClick={()=>{
         setProfile(p=>({...p,lead_magnet_idea:p.lead_magnet_idea||"Chiedo a RMP Works di analizzare il mio canale e suggerire 2-3 lead magnet coerenti.",micro_product_idea:p.micro_product_idea||"Chiedo a RMP Works una ricerca sul pubblico e sulle opportunità di microprodotti digitali, con proposte e motivazioni da approvare.",premium_product_idea:p.premium_product_idea||"Vorrei ricevere proposte di prodotti premium basate sulle esigenze del pubblico, da valutare e approvare prima di svilupparle."}));}}>
         Fate una ricerca e proponetemi voi le idee
        </button>
       </div>
       <p className="mt-4 leading-7">I suggerimenti sono un punto di partenza: possiamo discuterne insieme. Nessun prodotto viene creato, promesso o pubblicato automaticamente senza la tua approvazione.</p>
       <p className="mt-2 text-sm">I pulsanti compilano soltanto i campi vuoti: non cancellano ciò che hai già scritto. Puoi modificare tutto.</p>
      </div>
      <AreaField id="creator-lead" title="Risorsa gratuita / quiz" value={profile.lead_magnet_idea} onChange={v=>change("lead_magnet_idea",v)} placeholder="Es. checklist, mini guida o quiz per il mio pubblico" />
      <AreaField id="creator-micro" title="Primo microprodotto" value={profile.micro_product_idea} onChange={v=>change("micro_product_idea",v)} placeholder="Es. PDF pratico, template o risorse digitali" />
      <AreaField id="creator-premium" title="Prodotto premium futuro" value={profile.premium_product_idea} onChange={v=>change("premium_product_idea",v)} placeholder="Es. guida completa, corso o pacchetto avanzato" />
     </>}
     {step===4&&<form onSubmit={save} className="space-y-4 text-sm"><div className="border-2 border-black p-5"><p><strong>Creator:</strong> {profile.display_name}</p><p className="mt-2"><strong>Canale:</strong> {profile.channel_url}</p><p className="mt-2"><strong>Sottodominio desiderato:</strong> {profile.slug}.rmpworks.com</p><p className="mt-2"><strong>Primo prodotto:</strong> {profile.micro_product_idea||"Da definire"}</p></div><p className="text-xs leading-6">Il salvataggio invia il brief alla tua area privata; non pubblica automaticamente il sottodominio e non costituisce un ordine.</p><button disabled={busy} className="w-full border-2 border-black bg-[#e93625] p-4 font-mono text-xs font-black uppercase text-black disabled:opacity-50">{busy?"SALVATAGGIO…":"SALVA IL BRIEF ↗"}</button></form>}
    </div>
    {error&&<p role="alert" className="mt-6 border-l-4 border-[#e93625] pl-4 text-sm">{error}</p>}
    {step<4&&<div className="mt-10 flex items-center justify-between gap-4"><button className="font-mono text-xs font-black uppercase disabled:opacity-40" disabled={step===0} onClick={()=>{setError("");setStep(s=>Math.max(0,s-1))}}>← INDIETRO</button><button className="border-2 border-black bg-black px-6 py-4 font-mono text-xs font-black uppercase text-white" onClick={next}>CONTINUA ↗</button></div>}
    {step===4&&<button className="mt-6 font-mono text-xs font-bold underline" onClick={()=>setStep(3)}>← Rivedi le risposte</button>}
   </div>
  </section>}
 </div>;
}
