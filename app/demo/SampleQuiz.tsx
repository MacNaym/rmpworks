"use client";
import {useState} from "react";
const questions=[
 {title:"Cosa ti blocca quando scatti?",options:[{label:"Non so come usare la luce",key:"luce"},{label:"Le foto sembrano piatte",key:"composizione"},{label:"In manuale mi perdo",key:"tecnica"}]},
 {title:"Con cosa fotografi più spesso?",options:[{label:"Smartphone",key:"phone"},{label:"Reflex / mirrorless",key:"camera"},{label:"Un po’ entrambi",key:"both"}]},
 {title:"Quanto tempo puoi dedicarci?",options:[{label:"10 minuti al giorno",key:"short"},{label:"Un paio d’ore a settimana",key:"medium"},{label:"Sto imparando con calma",key:"slow"}]}
];
export default function SampleQuiz(){
 const [step,setStep]=useState(0);
 const [answers,setAnswers]=useState<string[]>([]);
 const done=step===questions.length;
 const first=answers[0]||"luce";
 const result=first==="luce"?{name:"PARTI DALLA LUCE.",body:"Per i prossimi 7 giorni scegli un soggetto e fotografalo sempre dalla stessa posizione, cambiando solo luce e orario."}:first==="composizione"?{name:"PARTI DALL’INQUADRATURA.",body:"Scatta 10 foto dello stesso soggetto, provando diagonali, spazi vuoti e punti di vista diversi."}:{name:"PARTI DAI TRE CONTROLLI.",body:"Scegli una situazione semplice e prova a cambiare un parametro per volta: ISO, tempo, apertura."};
 return <div className="mt-8 border-2 border-[#171615] bg-[#f5f0e5] p-6 text-[#171615] sm:p-9">
  <div className="flex items-center justify-between gap-4 border-b-2 border-[#171615] pb-4 font-mono text-[10px] font-black uppercase tracking-widest"><span>MINI TEST / DIMOSTRAZIONE</span><span>{done?"RISULTATO":String(step+1).padStart(2,"0")+" / 03"}</span></div>
  {!done?<><h3 className="mt-9 text-[clamp(1.6rem,3.5vw,2.6rem)] font-black uppercase leading-[.96] tracking-[-.06em]">{questions[step].title}</h3><div className="mt-8 grid gap-3">{questions[step].options.map(o=><button key={o.key} type="button" className="border-2 border-[#171615] bg-white p-4 text-left text-sm font-bold transition-colors hover:bg-[#df4b32] hover:text-white focus-visible:outline-4" onClick={()=>{setAnswers(prev=>[...prev,o.key]);setStep(step+1)}}>{o.label}<span className="float-right">↗</span></button>)}</div></>:<><p className="mt-8 font-mono text-xs font-black text-[#df4b32]">IL TUO PRIMO ESERCIZIO</p><h3 className="mt-3 text-[clamp(2.1rem,4vw,3.6rem)] font-black uppercase leading-[.91] tracking-[-.065em]">{result.name}</h3><p className="mt-6 max-w-xl text-base leading-7">{result.body}</p><button type="button" className="mt-8 border-b-2 border-[#171615] pb-2 font-mono text-xs font-black uppercase" onClick={()=>{setStep(0);setAnswers([])}}>RIPROVA IL TEST ↺</button></>}
  <p className="mt-7 border-t border-[#171615]/30 pt-4 text-[11px] leading-5 text-[#5e5851]">Esempio interattivo: non raccoglie email, non salva risposte e non fornisce una valutazione professionale.</p>
 </div>;
}
