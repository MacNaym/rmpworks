import test from "node:test";
import assert from "node:assert/strict";
import {consumeCreatorRateLimit} from "../functions/_lib/creator-rate-limit.ts";
const secret="test-only-secret-value-32-characters-long";
const request=(overrides={})=>({
 secret,clientIp:"203.0.113.12",tenantId:"creator_123",action:"public_lead",
 maxRequests:2,windowSeconds:60,nowMs:120000,...overrides
});
function fakeD1() {
 const buckets=new Map();
 const calls=[];
 const db={prepare(sql) {
  assert.match(sql,/ON CONFLICT\(bucket_key,window_start\) DO UPDATE/);
  assert.match(sql,/WHERE hits < \?4/);
  return {bind(key,start,expiry,max) {
   calls.push({key,start,expiry,max});
   return {async first() {
    const name=key+":"+start;const count=buckets.get(name)||0;
    if(count>=max)return null;
    buckets.set(name,count+1);return {hits:count+1};
   }};
  }};
 }};
 return {db,calls,buckets};
}
test("configuration missing rejects before DB access",async()=>{
 const {db}=fakeD1();
 assert.deepEqual(await consumeCreatorRateLimit(request({db,secret:undefined})),{allowed:false,reason:"unavailable"});
 assert.deepEqual(await consumeCreatorRateLimit(request({db,clientIp:undefined})),{allowed:false,reason:"unavailable"});
 assert.deepEqual(await consumeCreatorRateLimit(request({db:undefined})),{allowed:false,reason:"unavailable"});
});
test("accepts up to limit and rejects the next request",async()=>{
 const f=fakeD1(),req=request({db:f.db});
 assert.equal((await consumeCreatorRateLimit(req)).allowed,true);
 assert.equal((await consumeCreatorRateLimit(req)).allowed,true);
 assert.deepEqual(await consumeCreatorRateLimit(req),{allowed:false,reason:"limited"});
 assert.equal(f.calls.length,3);
});
test("fixed window resets; tenant and action remain isolated",async()=>{
 const f=fakeD1(),r=request({db:f.db,maxRequests:1});
 assert.equal((await consumeCreatorRateLimit(r)).allowed,true);
 assert.equal((await consumeCreatorRateLimit(r)).allowed,false);
 assert.equal((await consumeCreatorRateLimit({...r,nowMs:180000})).allowed,true);
 assert.equal((await consumeCreatorRateLimit({...r,tenantId:"creator_234"})).allowed,true);
 assert.equal((await consumeCreatorRateLimit({...r,action:"lead_download"})).allowed,true);
 const keys=f.calls.map(call=>call.key);assert.equal(new Set(keys).size,3);
});
test("bucket key is a pseudonym and never contains IP or tenant",async()=>{
 const f=fakeD1();await consumeCreatorRateLimit(request({db:f.db}));
 assert.match(f.calls[0].key,/^[a-f0-9]{64}$/);
 assert.equal(f.calls[0].key.includes("203.0.113.12"),false);
 assert.equal(f.calls[0].key.includes("creator_123"),false);
});
test("invalid rates and untrusted identifiers fail closed",async()=>{
 const f=fakeD1();
 for(const changes of [{maxRequests:0},{maxRequests:1.5},{windowSeconds:0},{tenantId:"x/y"},{action:"public-lead"},{clientIp:"x-forwarded-for:1.1.1.1"}]){
  assert.equal((await consumeCreatorRateLimit(request({db:f.db,...changes}))).allowed,false);
 }
 assert.equal(f.calls.length,0);
});
test("D1 errors reject rather than allow",async()=>{
 const db={prepare(){throw Error("database unavailable")}};
 assert.deepEqual(await consumeCreatorRateLimit(request({db})),{allowed:false,reason:"unavailable"});
});
