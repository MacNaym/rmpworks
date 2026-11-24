/**
 * B9.5 DORMANT Cloudflare TCP socket to a verified implicit-TLS SMTP channel.
 * No route calls this. No credentials or production binding are configured.
 *
 * The connect function is injected for tests; a later Cloudflare-specific
 * entrypoint may inject connect from "cloudflare:sockets" ONLY after approval.
 */
import type {SmtpSecureChannel} from "./creator-smtp-secure-session.ts";

export type CloudflareSocketLike={
 opened:Promise<unknown>;
 readable:ReadableStream<Uint8Array>;
 writable:WritableStream<Uint8Array>;
 close:()=>Promise<void>|void;
};
export type CloudflareConnect=(
 address:{hostname:string;port:number},
 options:{secureTransport:"on";allowHalfOpen:false}
)=>CloudflareSocketLike;

export const SMTP_ENDPOINT={hostname:"smtp.hostinger.com",port:465} as const;
const MAX_LINE=1000;
const MAX_BUFFER=8192;
const MIN_TIMEOUT=100;
const MAX_TIMEOUT=15000;

function deadline<T>(promise:Promise<T>,ms:number,onTimeout:()=>void):Promise<T>{
 let timer:ReturnType<typeof setTimeout>|undefined;
 const timeout=new Promise<never>((_resolve,reject)=>{
  timer=setTimeout(()=>{onTimeout();reject(new Error("SMTP operation timeout"));},ms);
 });
 return Promise.race([promise,timeout]).finally(()=>{if(timer!==undefined)clearTimeout(timer);});
}

/**
 * Open only within a trusted Cloudflare request/queue/cron handler.
 * Closing aborts pending reads and releases stream locks even on exceptions.
 * The caller cannot request an arbitrary hostname or plaintext transport.
 */
export async function openHostingerTlsChannel(
 connect:CloudflareConnect,
 options:{timeoutMs?:number}={}
):Promise<SmtpSecureChannel>{
 if(typeof connect!=="function")throw Error("SMTP connector unavailable");
 const ms=options.timeoutMs??5000;
 if(!Number.isInteger(ms)||ms<MIN_TIMEOUT||ms>MAX_TIMEOUT)
  throw Error("Invalid SMTP timeout");
 let socket:CloudflareSocketLike;
 try{
  socket=connect(SMTP_ENDPOINT,{secureTransport:"on",allowHalfOpen:false});
 }catch{throw Error("SMTP connection unavailable");}
 let closed=false;
 const abort=()=>{try{void socket.close();}catch{}};
 try{
  await deadline(socket.opened,ms,abort);
  if(!socket.readable||!socket.writable)throw Error("Missing socket streams");
 }catch{
  abort();
  throw Error("SMTP TLS handshake unavailable");
 }
 let reader:ReadableStreamDefaultReader<Uint8Array>;
 let writer:WritableStreamDefaultWriter<Uint8Array>;
 try{
  reader=socket.readable.getReader();
  writer=socket.writable.getWriter();
 }catch{
  abort();
  throw Error("SMTP stream initialization failed");
 }
 const decoder=new TextDecoder("utf-8",{fatal:true});
 const encoder=new TextEncoder();
 let buffer="";
 const close=async()=>{
  if(closed)return;
  closed=true;
  // Prevent hanging on graceful flush: socket.close forcibly closes both.
  abort();
  try{await reader.cancel();}catch{}
  try{await writer.abort();}catch{}
  try{reader.releaseLock();}catch{}
  try{writer.releaseLock();}catch{}
 };
 const readLine=async()=>{
  if(closed)throw Error("SMTP channel closed");
  try{
   while(true){
    const idx=buffer.indexOf("\r\n");
    if(idx>=0){
     const line=buffer.slice(0,idx);
     buffer=buffer.slice(idx+2);
     if(line.length>MAX_LINE||/[\r\n]/.test(line))throw Error("Bad SMTP line");
     return line;
    }
    if(buffer.length>MAX_BUFFER)throw Error("SMTP buffer limit");
    const read=await deadline(reader.read(),ms,abort);
    if(read.done)throw Error("SMTP socket closed");
    if(!(read.value instanceof Uint8Array))throw Error("Invalid SMTP bytes");
    // SMTP status replies are 7-bit ASCII; rejecting non-ASCII is safe.
    for(const b of read.value)if(b>127||b===0)throw Error("Invalid SMTP reply bytes");
    buffer+=decoder.decode(read.value,{stream:true});
    if(buffer.length>MAX_BUFFER)throw Error("SMTP buffer limit");
   }
  }catch{
   await close();
   throw Error("SMTP read unavailable");
  }
 };
 const write=async(value:string)=>{
  if(closed)throw Error("SMTP channel closed");
  if(typeof value!=="string"||value.length>100000)
   throw Error("SMTP write rejected");
  try{
   await deadline(writer.write(encoder.encode(value)),ms,abort);
  }catch{
   await close();
   throw Error("SMTP write unavailable");
  }
 };
 return {readLine,write,close};
}
