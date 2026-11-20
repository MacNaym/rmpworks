import Link from "next/link";
import { rmpPhone } from "@/app/contact-details";

export const paper = "#f4f2ed";
export const red = "#e93625";
export const frame = "mx-auto w-full max-w-[1540px] px-5 sm:px-7 lg:px-10";
export const eyebrow = "font-mono text-[10px] font-black uppercase tracking-[.2em]";
export const heroTitle = "font-sans text-[clamp(3.2rem,8.8vw,10rem)] font-black uppercase leading-[.82] tracking-[-.09em]";
export const textButton = "inline-flex items-center justify-center border-2 border-black bg-black px-6 py-4 font-mono text-[11px] font-black uppercase tracking-[.08em] text-white transition-colors hover:bg-[#e93625] hover:text-black";
export function Brand() {
 return <span className="inline-flex items-center gap-2 text-[13px] font-black tracking-[-.055em] sm:text-[15px]"><span className="grid size-5 place-items-center border border-black bg-[#ee3323] text-[10px] font-black text-white sm:size-6">R</span>RMP<span className="-ml-1 text-[#ee3323]">/</span>WORKS<span className="-ml-1 text-[#ee3323]">®</span></span>;
}
export function SiteHeader({active}:{active?:string}) {
 const links=[{href:"/about",label:"Studio",id:"about"},{href:"/creator-studio",label:"Founder",id:"creator"},{href:"/contact",label:"Contatti",id:"contact"},{href:"/en",label:"EN",id:"en"}];
 return <><div className="flex min-h-6 items-center justify-between gap-3 border-b-2 border-black bg-[#e93625] px-5 py-1 font-mono text-[8px] font-bold uppercase tracking-[.2em] text-black sm:px-8 sm:text-[9px]"><span>✳ NOV 2026 / FOUNDER EDITION</span><span className="hidden sm:block">DESIGN • BUILD • NO SHORTCUTS</span><span className="sm:hidden">CREATOR STUDIO</span></div><header className="border-b-2 border-black"><div className={frame+" flex min-h-[64px] flex-wrap items-center justify-between gap-4 py-3"}><Link href="/" aria-label="RMP Works — homepage"><Brand/></Link><nav aria-label="Navigazione principale" className="order-3 flex w-full flex-wrap gap-4 font-mono text-[10px] font-black uppercase tracking-[.1em] md:order-2 md:w-auto md:gap-7">{links.map(x=><Link key={x.id} href={x.href} aria-current={active===x.id?"page":undefined} className={active===x.id?"underline decoration-2 underline-offset-4":"hover:underline"}>{x.label}</Link>)}</nav><Link href="/contact" className="order-2 border-2 border-black bg-black px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[.1em] text-white transition-colors hover:bg-[#e93625] hover:text-black md:order-3">PARLIAMONE ↗</Link></div></header></>;
}
export function SiteFooter(){
 return <footer className="border-t-2 border-black bg-[#f4f2ed]"><div className={frame+" flex flex-wrap items-center justify-between gap-6 py-9"}><Link href="/" aria-label="Torna alla homepage RMP Works"><Brand/></Link><nav aria-label="Navigazione footer" className="flex flex-wrap gap-6 font-mono text-[10px] font-black uppercase"><Link href="/about">Studio</Link><Link href="/creator-studio">Founder</Link><Link href="/contact">Contatti</Link><Link href="/en">EN</Link><Link href="/privacy">Privacy</Link><a href={rmpPhone.href}>Telefono</a></nav><span className="font-mono text-[9px] text-[#68635d]">© 2026 RMP WORKS</span></div></footer>;
}
export function PageShell({children,active}:{children:React.ReactNode,active?:string}){
 return <main className="min-h-screen overflow-x-hidden bg-[#f4f2ed] text-[#101010]"><div className="border-x-2 border-black"><SiteHeader active={active}/>{children}<SiteFooter/></div></main>;
}
export function HeroMeta({left,right,center="EST. 2026 / ITALIA / ONLINE"}:{left:string,right:string,center?:string}){
 return <div className="mb-9 grid grid-cols-2 gap-3 font-mono text-[9px] font-bold uppercase tracking-[.16em] text-[#68635d] sm:mb-12 md:grid-cols-3"><span><span className="text-[#e93625]">✳</span> {left}</span><span className="hidden text-center md:block">{center}</span><span className="text-right"><span className="text-[#e93625]">●</span> {right}</span></div>;
}
