// Offline safety tests. No live Supabase writes, email, or payment calls.
// Run: node --experimental-strip-types --test tests/creator-public-gate.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { onRequestGet, onRequestPost } from "../functions/s/[slug].ts";

const release = "explicit-creator-release-v1";
const slug = "creator-pilota";
const base = "https://example-project.supabase.co";
const site = {
  slug, display_name: "Creator Pilota", topic: "Guide pratiche",
  audience: "Hobby e tutorial", channel_url: "https://youtube.com/@demo",
  freebie_title: "Checklist di prova",
};
const ctx = (env = {}, name = slug) => ({
  request: new Request("https://rmpworks.com/s/" + name),
  env, params: { slug: name },
});
const active = () => ({
  RMP_CREATOR_PUBLIC_RELEASE: release,
  RMP_SUPABASE_URL: base,
  RMP_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
});
const withFetch = async (replacement, fn) => {
  const previous = globalThis.fetch;
  globalThis.fetch = replacement;
  try { await fn(); } finally { globalThis.fetch = previous; }
};
const checkClosed = async (response) => {
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-robots-tag"), "noindex,nofollow");
};

test("default-deny: missing release switch never requests Supabase", async () => {
  await withFetch(() => { throw Error("must not fetch"); }, async () => {
    await checkClosed(await onRequestGet(ctx({
      RMP_SUPABASE_URL: base,
      RMP_SUPABASE_PUBLISHABLE_KEY: "test-key",
    })));
  });
});
test("default-deny: wrong release switch stays closed", async () => {
  await checkClosed(await onRequestGet(ctx({ ...active(), RMP_CREATOR_PUBLIC_RELEASE: "true" })));
});
test("default-deny: missing database settings stays closed", async () => {
  await checkClosed(await onRequestGet(ctx({ RMP_CREATOR_PUBLIC_RELEASE: release })));
});
test("default-deny: invalid slug rejected without network access", async () => {
  await withFetch(() => { throw Error("must not fetch"); }, async () => {
    for (const bad of ["A", "../admin", "UPPERCASE", "a", "a".repeat(41), "a_b"]) {
      await checkClosed(await onRequestGet(ctx(active(), bad)));
    }
  });
});
test("default-deny: empty or failed database response remains hidden", async () => {
  await withFetch(async () => new Response("[]", { status: 200 }), async () => {
    await checkClosed(await onRequestGet(ctx(active())));
  });
  await withFetch(async () => new Response("failure", { status: 503 }), async () => {
    await checkClosed(await onRequestGet(ctx(active())));
  });
});
test("when explicitly enabled, query requires matching slug and published=true", async () => {
  let requested;
  await withFetch(async (url, options) => {
    requested = { url: String(url), options };
    return Response.json([site]);
  }, async () => {
    const response = await onRequestGet(ctx(active()));
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Creator Pilota/);
    assert.equal(response.headers.get("x-robots-tag"), "noindex,nofollow");
    assert.match(response.headers.get("content-security-policy"), /form-action 'none'/);
  });
  const url = new URL(requested.url);
  assert.equal(url.searchParams.get("slug"), "eq." + slug);
  assert.equal(url.searchParams.get("published"), "eq.true");
  assert.equal(url.searchParams.get("limit"), "1");
  assert.equal(requested.options.headers.apikey, "test-publishable-key");
});
test("HTML-escapes content from public snapshot", async () => {
  await withFetch(async () => Response.json([{
    ...site, display_name: '<script>alert("x")</script>',
    freebie_title: "<img src=x onerror=alert(1)>",
    channel_url: "javascript:alert(1)",
  }]), async () => {
    const response = await onRequestGet(ctx(active()));
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.ok(!html.includes("<script>"));
    assert.ok(!html.includes("<img src=x"));
    assert.ok(!html.includes("javascript:alert"));
    assert.ok(html.includes("&lt;script&gt;"));
  });
});
test("POST never creates public leads or sites", async () => {
  await checkClosed(await onRequestPost());
});
