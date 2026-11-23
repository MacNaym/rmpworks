import test from "node:test";
import assert from "node:assert/strict";
import { canUseFeature, resolveFeatures, FEATURES } from "../app/lib/creator-entitlements.ts";
const enabled = FEATURES;
test("Free has no paid tools", () => {
  assert.equal(canUseFeature({plan:"free",enabledFeatures:enabled},"creator_desk"),true);
  assert.equal(canUseFeature({plan:"free",enabledFeatures:enabled},"video_optimizer"),false);
  assert.equal(canUseFeature({plan:"free",enabledFeatures:enabled},"competitor_insights"),false);
});
test("Video Optimizer is in Pro, advanced analytics are Pro Plus", () => {
  assert.equal(canUseFeature({plan:"pro",enabledFeatures:enabled},"video_optimizer"),true);
  assert.equal(canUseFeature({plan:"pro",enabledFeatures:enabled},"keyword_research"),false);
  assert.equal(canUseFeature({plan:"pro_plus",enabledFeatures:enabled},"keyword_research"),true);
  assert.equal(canUseFeature({plan:"pro_plus",enabledFeatures:enabled},"video_optimizer"),true);
});
test("standalone purchase only unlocks the purchased module", () => {
  const input={plan:"free", enabledFeatures:enabled, subscriptions:[{feature:"video_optimizer",status:"active"}]};
  assert.equal(canUseFeature(input,"video_optimizer"),true);
  assert.equal(canUseFeature(input,"lead_magnets"),false);
  assert.equal(canUseFeature(input,"keyword_research"),false);
});
test("canceled standalone subscription does not grant access", () => {
  assert.equal(canUseFeature({plan:"free",enabledFeatures:enabled,subscriptions:[{feature:"video_optimizer",status:"canceled"}]},"video_optimizer"),false);
});
test("feature launch switch always wins over bundle and subscription", () => {
  assert.equal(canUseFeature({plan:"pro_plus",enabledFeatures:[]},"keyword_research"),false);
  assert.equal(canUseFeature({plan:"pro",enabledFeatures:[]},"video_optimizer"),false);
  assert.equal(resolveFeatures({plan:"pro_plus",enabledFeatures:[]}).size,1);
});
test("unknown plan fails closed", () => {
  assert.equal(canUseFeature({plan:"unexpected",enabledFeatures:enabled},"video_optimizer"),false);
});
