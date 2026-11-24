/**
 * B10.1 — Explicitly authorized ONE-TIME Resend HTTP smoke test.
 *
 * Run locally with a scoped Sending Access API key in process.env.RESEND_API_KEY.
 * The Cloudflare Pages secret is intentionally NOT accessible from this CLI.
 * No production deployment, no database or creator lead access, no extra SDK.
 *
 * A marker is written BEFORE calling the provider, preventing accidental
 * resends even if the HTTP response is lost. Never remove the marker and
 * retry without separate authorization.
 */
import {openSync,closeSync,writeFileSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";
const directory=dirname(fileURLToPath(import.meta.url));
const marker=join(directory,".resend-b10-smoke-attempted");
const API="https://api.resend.com/emails";
const from="RMP Works <noreply@rmpworks.com>";
const to=["noreply@rmpworks.com"];
const cc=["luigi.pes84@gmail.com"];
const subject="[RMP Works] Test invio Resend B10";
const body={
 from,to,cc,subject,
 text:"Test autorizzato RMP Works B10. Questa email verifica l'invio tramite Resend e la ricezione su Hostinger e Gmail. Nessuna registrazione o acquisto è stato effettuato.",
 html:"<p><strong>Test autorizzato RMP Works B10.</strong></p><p>Questa email verifica l'invio tramite Resend e la ricezione su Hostinger e Gmail.</p><p>Nessuna registrazione o acquisto è stato effettuato.</p>"
};
const IDEMPOTENCY_KEY="rmpworks-b10-test-single-2026-11-24-v1";
const apiKey=process.env.RESEND_API_KEY;
if(process.env.RMP_TEST_SEND_APPROVED!=="YES"){
 console.error("INVIO BLOCCATO: manca autorizzazione locale RMP_TEST_SEND_APPROVED=YES.");
 process.exitCode=1;
}else if(typeof apiKey!=="string"||!/^re_[A-Za-z0-9_-]{8,256}$/.test(apiKey)){
 console.error("INVIO BLOCCATO: RESEND_API_KEY assente o non valida; nessuna richiesta effettuata.");
 process.exitCode=1;
}else{
 try{
  // One attempt per workspace. No credentials or PII are stored.
  const fd=openSync(marker,"wx",0o600);
  try{
   writeFileSync(fd,"B10.1 Resend single-test attempt recorded\n",{encoding:"utf8"});
  }finally{closeSync(fd);}
 }catch{
  console.error("INVIO BLOCCATO: tentativo già registrato o marker non scrivibile. Nessuna richiesta effettuata.");
  process.exitCode=1;
 }
 if(!process.exitCode){
  try{
   const response=await fetch(API,{
    method:"POST",
    headers:{
     "Authorization":"Bearer "+apiKey,
     "Content-Type":"application/json",
     "Idempotency-Key":IDEMPOTENCY_KEY
    },
    body:JSON.stringify(body),
    signal:AbortSignal.timeout(12000)
   });
   // Do not dump the response body; provider errors can include details.
   if(response.ok){
    const data=await response.json().catch(()=>null);
    if(typeof data?.id==="string"&&data.id.length>0){
     console.log("RESEND ACCEPTED: richiesta accettata dal provider. Verificare recapito su Gmail e Hostinger.");
    }else{
     console.error("ESITO INCERTO: Resend ha risposto 2xx ma manca un ID valido. Non ripetere automaticamente.");
     process.exitCode=2;
    }
   }else{
    console.error("RESEND REJECTED: HTTP "+response.status+". Nessun nuovo tentativo automatico.");
    process.exitCode=2;
   }
  }catch{
   console.error("ESITO INCERTO: timeout o rete. Non ripetere automaticamente: l'email potrebbe essere stata accettata.");
   process.exitCode=2;
  }
 }
}
