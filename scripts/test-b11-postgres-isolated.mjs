/**
 * B11 disposable PostgreSQL migration verification. NO Supabase connection.
 * Requires Docker. Does NOT create host mounts, ports or a durable volume.
 * The container has --network none and is removed after the test.
 *
 * Windows PowerShell, from repository root:
 *   node scripts/test-b11-postgres-isolated.mjs
 */
import {spawnSync} from "node:child_process";
import {readFileSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {randomBytes} from "node:crypto";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const id="rmp-b11-pg-"+randomBytes(6).toString("hex");
const image="postgres:16.8";
const files=[
 "tests/fixtures/b11-postgres-bootstrap.sql",
 "docs/creator-studio/2026-11-24-b11-consolidated-migration-CANDIDATE.sql",
 "tests/fixtures/b11-postgres-assertions.sql"
];
function docker(args,extra={}){
 const result=spawnSync("docker",args,{encoding:"utf8",timeout:90000,...extra});
 if(result.error)throw new Error("Docker unavailable: "+result.error.message);
 if(result.status!==0)throw new Error(
  "Docker command failed (exit "+result.status+"): "+
  String(result.stderr||result.stdout||"").slice(0,1600));
 return result;
}
function psql(file){
 const sql=readFileSync(resolve(root,file),"utf8");
 const r=docker(["exec","-i",id,"psql","-X","-v","ON_ERROR_STOP=1",
  "-U","postgres","-d","postgres"],{input:sql});
 console.log("PASS: "+file);
 const notices=(r.stderr||"").split("\n").filter(x=>x.includes("NOTICE"));
 for(const notice of notices)console.log(notice);
}
let launched=false;
try{
 console.log("B11 disposable PostgreSQL 16.8; no host ports, no mounts, no network");
 const started=docker(["run","--rm","-d","--name",id,
  "--network","none",
  "-e","POSTGRES_PASSWORD=disposable-B11-only",
  image],{timeout:120000});
 if(!started.stdout.trim())throw new Error("Container did not start");
 launched=true;
 let ready=false;
 for(let n=0;n<50;n++){
  const check=spawnSync("docker",["exec",id,"pg_isready","-U","postgres"],{
   encoding:"utf8",timeout:4000
  });
  if(check.status===0){ready=true;break;}
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,400);
 }
 if(!ready)throw new Error("Temporary PostgreSQL did not become ready");
 for(const f of files)psql(f);
 console.log("B11 ISOLATED POSTGRESQL PASS. NO production database was touched.");
}catch(e){
 console.error("B11 ISOLATED POSTGRESQL FAILED: "+(e instanceof Error?e.message:"unknown"));
 process.exitCode=1;
}finally{
 if(launched){
  spawnSync("docker",["rm","-f",id],{stdio:"ignore",timeout:12000});
 }
}
