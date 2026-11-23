import test from "node:test";
import assert from "node:assert/strict";
import { originOk, emailOk, authCookies, deleteCookies, configured, respond } from "../functions/_lib/creator-auth.ts";

test("cross-site POST origins must fail", () => {
 const url="https://rmpworks.com/api/creator-leads";
 for(const origin of ["https://attacker.example","https://rmpworks.com.evil.test","http://rmpworks.com","null"]){
  assert.equal(originOk(new Request(url,{headers:{Origin:origin}})),false);
 }
 assert.equal(originOk(new Request(url)),false);
 assert.equal(originOk(new Request(url,{headers:{Origin:"https://rmpworks.com"}})),true);
});
test("email input accepts standard addresses but rejects malformed values", () => {
 for(const value of ["not-an-email","a@","@domain.com","a b@example.com","x".repeat(250)+"@a.io"])assert.equal(emailOk(value),false);
 assert.equal(emailOk("person@example.com"),true);
});
test("Supabase configuration rejects non-HTTPS and unexpected hostnames", () => {
 for(const base of ["http://demo.supabase.co","https://evil.example","https://project.supabase.co.attacker.test"]){
  assert.equal(configured({RMP_SUPABASE_URL:base,RMP_SUPABASE_PUBLISHABLE_KEY:"demo"}),false);
 }
 assert.equal(configured({RMP_SUPABASE_URL:"https://demo.supabase.co",RMP_SUPABASE_PUBLISHABLE_KEY:"demo"}),true);
});
test("auth cookie and clearing cookie use Secure, HttpOnly and SameSite", () => {
 const headers=authCookies({access_token:"test-token",refresh_token:"test-refresh",expires_in:100000});
 const cookies=headers.getSetCookie();
 assert.equal(cookies.length,2);
 for(const cookie of cookies){assert.match(cookie,/HttpOnly/);assert.match(cookie,/Secure/);assert.match(cookie,/SameSite=Lax/);}
 assert.match(cookies[0],/Max-Age=3600/);
 for(const cookie of deleteCookies().getSetCookie())assert.match(cookie,/Max-Age=0/);
});
test("API responses avoid caching and content sniffing", () => {
 const response=respond(403,{error:"forbidden"});
 assert.equal(response.status,403);
 assert.match(response.headers.get("cache-control"),/no-store/);
 assert.equal(response.headers.get("x-content-type-options"),"nosniff");
});
