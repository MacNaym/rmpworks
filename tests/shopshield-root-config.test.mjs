import test from "node:test";
import assert from "node:assert/strict";
import { shopShieldStoreId } from "../app/shopshield-config.ts";

test("ShopShield stays disabled when not configured", () => {
  for (const value of [undefined, "", " ", "shopshield.io", "localhost", "rmpworks.pages.dev"]) {
    assert.equal(shopShieldStoreId(value), null);
  }
});
test("root domain must match the verified store id", () => {
  assert.equal(shopShieldStoreId("rmpworks.com"), "rmpworks.com");
  assert.equal(shopShieldStoreId(" rmpworks.com "), "rmpworks.com");
});
test("unreviewed tenant domains and script injection cannot be configured", () => {
  for (const value of ["foo.rmpworks.com", "www.rmpworks.com", "rmpworks.com/other", "rmpworks.com\" onload=\"alert(1)"]) {
    assert.equal(shopShieldStoreId(value), null);
  }
});
