/**
 * B12.2 local ONLY. Generate cryptographically random private trial and AES keys.
 * Writes to a gitignored file; NEVER send it to ChatGPT or commit it.
 * No Cloudflare deployment, API calls, DNS or Supabase writes.
 */
import {randomBytes} from "node:crypto";
import {writeFileSync,existsSync,chmodSync} from "node:fs";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const file=resolve(root,".dev.vars.b12-private");
if(existsSync(file)){
 console.error("BLOCKED: Existing local key file. Never overwrite an AES key with pending outbox events.");
 process.exitCode=1;
}else{
 const quote=(x)=>JSON.stringify(x);
 const values=[
  "# LOCAL SECRET DRAFT — DO NOT COMMIT, SHARE OR DEPLOY AS IS",
  "# Copy values into Cloudflare secrets individually only after approval.",
  "RMP_CREATOR_PRIVATE_KEY="+quote(randomBytes(48).toString("base64url")),
  "RMP_OUTBOX_KEY_ID="+quote("mail-v1"),
  "RMP_OUTBOX_KEY_B64URL="+quote(randomBytes(32).toString("base64url")),
  "# Add RMP_SUPABASE_SERVICE_KEY manually from correct RMP Supabase project dashboard; never use anon/publishable key.",
  "# All runtime trial switches MUST remain unset/false in production until authorized."
 ].join("\n")+"\n";
 try{
  writeFileSync(file,values,{encoding:"utf8",flag:"wx",mode:0o600});
  try{chmodSync(file,0o600)}catch{}
  console.log("PASS: generated independent operator secret and AES-256 key in gitignored local file .dev.vars.b12-private");
  console.log("No secret values printed. No remote configuration changed.");
 }catch{
  console.error("FAILED: cannot create secure local draft file.");
  process.exitCode=1;
 }
}
