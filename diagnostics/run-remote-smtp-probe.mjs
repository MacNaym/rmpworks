/**
 * B9.8 — one-shot remote-development SMTP TLS/EHLO probe.
 *
 * Does not deploy a permanent Worker, add a route or send email.
 * An ephemeral secret is written to diagnostics/.dev.vars, ignored by Git,
 * and deleted on exit. Only the diagnostic Worker receives it.
 *
 * Precondition: Wrangler login completed on the current PC.
 * Run from repo root:
 *   node diagnostics/run-remote-smtp-probe.mjs
 */
import {randomBytes} from "node:crypto";
import {spawn,spawnSync} from "node:child_process";
import {existsSync,writeFileSync,rmSync} from "node:fs";
import {dirname,join} from "node:path";
import {fileURLToPath} from "node:url";

const dir=dirname(fileURLToPath(import.meta.url));
const devVars=join(dir,".dev.vars");
const url="http://127.0.0.1:8798/";
const sleep=(ms)=>new Promise(resolve=>setTimeout(resolve,ms));
const timeoutMs=120000;
let processHandle;
let output="";
let key;
const addOutput=(chunk)=>{
  output=(output+String(chunk)).slice(-5000);
};
async function main(){
  if(existsSync(devVars))throw Error("Found existing diagnostics/.dev.vars; will not overwrite it");
  key=randomBytes(32).toString("hex");
  writeFileSync(devVars,
    'RMP_SMTP_PROBE_ENABLED="true"\nRMP_SMTP_PROBE_KEY="'+key+'"\n',
    {encoding:"utf8",mode:0o600,flag:"wx"});
  // Never put the ephemeral secret into a command line or process environment.
  const args=["--yes","wrangler","dev","--remote","--config","wrangler.toml",
    "--ip","127.0.0.1","--port","8798"];
  const executable=process.platform==="win32"?"cmd.exe":"npx";
  const cmdArgs=process.platform==="win32"
    ? ["/d","/s","/c","npx "+args.join(" ")]
    : args;
  processHandle=spawn(executable,cmdArgs,{
    cwd:dir,stdio:["ignore","pipe","pipe"],windowsHide:true
  });
  processHandle.stdout.on("data",addOutput);
  processHandle.stderr.on("data",addOutput);
  let exited=false;
  processHandle.on("exit",()=>{exited=true});
  processHandle.on("error",e=>{addOutput(e?.message||"Process error");exited=true});
  let ready=false;
  const until=Date.now()+timeoutMs;
  while(Date.now()<until){
    if(exited)break;
    try{
      // No credentials: the endpoint returns 404 and does NOT open SMTP.
      const r=await fetch(url,{method:"GET",signal:AbortSignal.timeout(1500)});
      if(r.status===404||r.status===503){ready=true;break}
    }catch{}
    await sleep(650);
  }
  if(!ready)throw Error("Remote preview did not become ready; check Wrangler login");
  const r=await fetch(url,{
    method:"POST",
    headers:{"x-rmp-probe-key":key},
    signal:AbortSignal.timeout(20000)
  });
  const payload=await r.json();
  if(!payload||typeof payload.status!=="string"||
     !["connected","unavailable","rejected","disabled"].includes(payload.status))
    throw Error("Unexpected diagnostic response");
  // Deliberately no logs / response dump: print only sanitized structured fields.
  const result={
    status:payload.status,
    phase:String(payload.phase||"unknown"),
    tlsOpened:payload.tlsOpened===true,
    greetingAccepted:payload.greetingAccepted===true,
    ehloAccepted:payload.ehloAccepted===true,
    ...(payload.egress&&typeof payload.egress==="object"?{
      egress:{
        port465:payload.egress.port465==="tls_failed"?"tls_failed":"unknown",
        port587:payload.egress.port587==="tcp_opened"?"tcp_opened":"tcp_failed",
        ...(typeof payload.egress.reason587==="string"?{
          reason587:["timeout","refused","blocked","tls","dns","unreachable","unknown"].includes(payload.egress.reason587)?payload.egress.reason587:"unknown"
        }:{})
      }
    }:{})
  };
  process.stdout.write("B9.8 SMTP TLS/EHLO diagnostic: "+JSON.stringify(result)+"\n");
  if(result.status!=="connected")process.exitCode=2;
}
async function cleanup(){
  if(processHandle?.pid){
    if(process.platform==="win32"){
      // The child is cmd.exe, so Windows must terminate the process tree.
      spawnSync("taskkill",["/PID",String(processHandle.pid),"/T","/F"],
        {stdio:"ignore",windowsHide:true,timeout:5000});
    }else{
      try{processHandle.kill("SIGTERM")}catch{}
    }
  }
  try{rmSync(devVars,{force:true})}catch{}
  key=undefined;
}
try{
  await main();
}catch(e){
  // Never print environment variables, key, or raw provider traffic.
  process.stderr.write("B9.8 probe not completed: "+
    (e instanceof Error?e.message:"Unknown error")+"\n");
  if(output.includes("login")||output.includes("Login")||output.includes("authorization"))
    process.stderr.write("Wrangler may require authentication: run npx wrangler login separately.\n");
  process.exitCode=1;
}finally{
  await cleanup();
}
