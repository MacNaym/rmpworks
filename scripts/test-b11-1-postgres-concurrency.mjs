/**
 * B11.1 — disposable PostgreSQL concurrency test, entirely offline.
 * No Supabase URL/key, no host port, network none, no mounts or volumes.
 * Verifies SELECT FOR UPDATE SKIP LOCKED doesn't double-claim a job
 * while another transaction holds that row's lock.
 */
import {spawn,spawnSync} from "node:child_process";
import {readFileSync} from "node:fs";
import {randomBytes} from "node:crypto";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const id="rmp-b11-concurrent-"+randomBytes(5).toString("hex");
const image="postgres:16.8";
const psqlArgs=["exec","-i",id,"psql","-X","-A","-t","-v","ON_ERROR_STOP=1","-U","postgres","-d","postgres"];
function command(args,{input,timeout=90000}={}){
 const result=spawnSync("docker",args,{encoding:"utf8",input,timeout});
 if(result.error||result.status!==0)
  throw Error("Docker command failed: "+String(result.error?.message||result.stderr||result.stdout).slice(0,1500));
 return result.stdout;
}
function sql(text){return command(psqlArgs,{input:text});}
function fixture(path){
 sql(readFileSync(resolve(root,path),"utf8"));
 console.log("PASS: "+path);
}
function pause(ms){Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,ms);}
let running=false;
try{
 console.log("B11.1 concurrency: disposable PostgreSQL, network none, no host ports/mounts");
 command(["run","--rm","-d","--name",id,"--network","none",
  "-e","POSTGRES_PASSWORD=b11-test-disposable",image],{timeout:120000});
 running=true;
 let ready=false;
 for(let i=0;i<55;i++){
  const status=spawnSync("docker",["exec",id,"pg_isready","-U","postgres"],{encoding:"utf8",timeout:3000});
  if(status.status===0){ready=true;break;}
  pause(300);
 }
 if(!ready)throw Error("Postgres not ready");
 fixture("tests/fixtures/b11-postgres-bootstrap.sql");
 fixture("docs/creator-studio/2026-11-24-b11-consolidated-migration-CANDIDATE.sql");
 fixture("tests/fixtures/b11-1-concurrent-leads.sql");
 const locker=spawn("docker",psqlArgs,{stdio:["pipe","pipe","pipe"]});
 let stdout="",stderr="",locked=false,lockerExited=false;
 locker.stdout.setEncoding("utf8");
 locker.stderr.setEncoding("utf8");
 locker.stdout.on("data",chunk=>{stdout+=chunk;if(stdout.includes("LOCKED"))locked=true;});
 locker.stderr.on("data",chunk=>{stderr+=chunk;});
 locker.on("exit",()=>{lockerExited=true;});
 const lockSQL="BEGIN;\n"+
  "SELECT id FROM public.creator_confirmation_outbox WHERE event_id=repeat('1',64) FOR UPDATE;\n"+
  "SELECT 'LOCKED';\n"+
  "SELECT pg_sleep(8);\n"+
  "ROLLBACK;\n";
 locker.stdin.end(lockSQL);
 const t=Date.now();
 while(!locked&&!lockerExited&&Date.now()-t<5000)pause(50);
 if(!locked)throw Error("Could not establish held row lock: "+stderr.slice(0,200));
 // The next transaction must SKIP the locked first job and claim the other.
 const second=sql("SELECT event_id FROM public.creator_claim_confirmation_mail();\n").trim();
 if(second!=="2".repeat(64))
  throw Error("SKIP LOCKED failed to claim second job exactly once");
 console.log("PASS: concurrent dispatcher skipped first row held by independent transaction");
 // Wait until transaction releases first job, then claim it.
 const started=Date.now();
 while(!lockerExited&&Date.now()-started<11000)pause(100);
 if(!lockerExited)throw Error("Locker did not exit");
 const first=sql("SELECT event_id FROM public.creator_claim_confirmation_mail();\n").trim();
 if(first!=="1".repeat(64))throw Error("First job was not available after lock release");
 const none=sql("SELECT count(*) FROM public.creator_claim_confirmation_mail();\n").trim();
 if(none!=="0")throw Error("An already-claimed job was claimed again");
 console.log("PASS: released job claimed once, no duplicate claims");
 console.log("B11.1 ISOLATED CONCURRENCY PASS. NO production database was touched.");
}catch(e){
 console.error("B11.1 ISOLATED CONCURRENCY FAILED: "+(e instanceof Error?e.message:"unknown"));
 process.exitCode=1;
}finally{
 if(running)spawnSync("docker",["rm","-f",id],{stdio:"ignore",timeout:12000});
}
