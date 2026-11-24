import test from "node:test";
import assert from "node:assert/strict";
import {diagnoseHostingerEgress} from "../diagnostics/_lib/hostinger-egress-diagnostic.ts";
const socket=(opened=Promise.resolve({}))=>({
 opened,readable:new ReadableStream(),writable:new WritableStream(),
 close:async()=>{}
});
test("pin one secondary Hostinger port 587 TCP check with no SMTP writes",async()=>{
 let called=0;
 const r=await diagnoseHostingerEgress((address,options)=>{
  called++;
  assert.deepEqual(address,{hostname:"smtp.hostinger.com",port:587});
  assert.deepEqual(options,{secureTransport:"off",allowHalfOpen:false});
  return socket();
 });
 assert.deepEqual(r,{port465:"tls_failed",port587:"tcp_opened"});
 assert.equal(called,1);
});
test("classifies refused socket without returning remote message",async()=>{
 const r=await diagnoseHostingerEgress(()=>socket(Promise.reject(Error("ECONNREFUSED private detail"))));
 assert.deepEqual(r,{port465:"tls_failed",port587:"tcp_failed",reason587:"refused"});
 assert.equal(JSON.stringify(r).includes("private detail"),false);
});
test("classifies network block without disclosing provider diagnostics",async()=>{
 const r=await diagnoseHostingerEgress(()=>{throw Error("proxy request failed, cannot connect to the specified address")});
 assert.equal(r.reason587,"blocked");
});
test("unknown exception remains sanitized",async()=>{
 const r=await diagnoseHostingerEgress(()=>{throw Error("sensitive provider-specific info")});
 assert.equal(r.reason587,"unknown");
 assert.equal(JSON.stringify(r).includes("sensitive"),false);
});
