/**
 * B12.2 offline safety preflight: configuration review WITHOUT reading secrets.
 * No network. No email or database calls.
 */
import {readFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const files=[
 "functions/api/creator-private-lead-intake.ts",
 "functions/api/creator-private-confirm-email.ts",
 "functions/api/creator-private-outbox-dispatch.ts"
];
let failed=false;
const check=(ok,label)=>{
 console.log((ok?"PASS":"FAIL")+": "+label);
 if(!ok)failed=true;
};
const ts=JSON.parse(readFileSync(resolve(root,"tsconfig.json"),"utf8"));
check(ts.compilerOptions.noEmit===true&&ts.compilerOptions.allowImportingTsExtensions===true,
 "TypeScript permits .ts imports in noEmit mode");
const ignored=readFileSync(resolve(root,".gitignore"),"utf8");
check(ignored.split(/\r?\n/).some(x=>x.trim()===".dev.vars*"),
 "Local Cloudflare secret drafts are gitignored");
for(const f of files){
 const source=readFileSync(resolve(root,f),"utf8");
 check(source.includes("privateAuthorized(ctx)"),f+" checks private auth first");
 check(source.includes("onRequestPost"),f+" has POST handler");
}
const dispatch=readFileSync(resolve(root,files[2]),"utf8");
check(dispatch.includes('RMP_CREATOR_PUBLIC_RELEASE:"true"')&&
 dispatch.indexOf("privateAuthorized(ctx)")<dispatch.indexOf("dispatchOneResendOutbox("),
 "Private dispatcher overrides public gate only after private auth");
const intake=readFileSync(resolve(root,files[0]),"utf8");
check(intake.includes("RMP_CREATOR_INTAKE_ENABLED")&&
 intake.includes("creator_site_snapshots"),"Intake requires independent gate and creator snapshot lookup");
const confirmation=readFileSync(resolve(root,files[1]),"utf8");
check(confirmation.includes("onRequestGet")&&confirmation.includes("405"),
 "GET confirmation cannot redeem tokens");
const configKeys=["RMP_CREATOR_PRIVATE_TRIAL","RMP_CREATOR_PRIVATE_KEY",
 "RMP_CREATOR_INTAKE_ENABLED","RMP_CREATOR_CONFIRMATION_ENABLED",
 "RMP_CONFIRMATION_DISPATCH_ENABLED","RMP_SUPABASE_SERVICE_KEY",
 "RMP_OUTBOX_KEY_B64URL","RESEND_API_KEY"];
const guards=readFileSync(resolve(root,"functions/_lib/creator-private-route-guards.ts"),"utf8");
check(configKeys.filter(x=>x!=="RESEND_API_KEY").every(x=>guards.includes(x)),
 "Expected server-only bindings described in guard contract");
console.log(failed?"B12.2 PREFLIGHT FAILED":"B12.2 PREFLIGHT PASS — offline only");
if(failed)process.exitCode=1;
