import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeCreatorSlug,resolveCreatorHost,validateProduct,splitCreatorRevenue,validateLeadInput,canPublishProduct} from './core.mjs';

test('creator slug canonicalization',()=>{
  assert.equal(normalizeCreatorSlug('  VecchiSalvataggi '),'vecchisalvataggi');
  for (const value of ['admin','creator-studio','a','a--b','a.b','-bad','bad-','a'.repeat(42),'a/b']) assert.equal(normalizeCreatorSlug(value),null,value);
});
test('tenant routing respects root, creator and reserved domains',()=>{
  assert.deepEqual(resolveCreatorHost('rmpworks.com'),{kind:'marketing'});
  assert.deepEqual(resolveCreatorHost('www.rmpworks.com'),{kind:'marketing'});
  assert.deepEqual(resolveCreatorHost('VecchiSalvataggi.RMPWORKS.COM:443'),{kind:'creator',slug:'vecchisalvataggi'});
  for (const host of ['admin.rmpworks.com','one.two.rmpworks.com','rmpworks.com.evil.test','https://a.rmpworks.com','invalid','a.rmpworks.com']) assert.equal(resolveCreatorHost(host),null,host);
});
test('free lead magnet and priced products',()=>{
  assert.equal(validateProduct({stage:'lead_magnet',status:'draft',title:'Guida',priceCents:0,currency:'eur'}).priceCents,0);
  assert.throws(()=>validateProduct({stage:'lead_magnet',status:'draft',title:'Guida',priceCents:100,currency:'eur'}));
  assert.throws(()=>validateProduct({stage:'micro',status:'draft',title:'Kit',priceCents:0,currency:'eur'}));
  assert.equal(validateProduct({stage:'micro',status:'review',title:'Kit',priceCents:900,currency:'eur'}).priceCents,900);
});
test('70/30 and 80/20 splits preserve every cent',()=>{
  assert.deepEqual(splitCreatorRevenue(1001,8000),{creatorCents:800,rmpCents:201});
  assert.deepEqual(splitCreatorRevenue(1001,7000),{creatorCents:700,rmpCents:301});
  assert.deepEqual(splitCreatorRevenue(0),{creatorCents:0,rmpCents:0});
  assert.throws(()=>splitCreatorRevenue(-1));
  assert.throws(()=>splitCreatorRevenue(100,9000));
});
test('lead marketing opt-in is optional, but explicit',()=>{
  assert.deepEqual(validateLeadInput({email:' A@Example.COM ',source:'quiz',marketingConsent:false}),{email:'a@example.com',source:'quiz',marketingConsent:false});
  assert.throws(()=>validateLeadInput({email:'x@example.com',source:'quiz'}));
  assert.throws(()=>validateLeadInput({email:'invalid',source:'gift',marketingConsent:true}));
});
test('no product publishes without all release checks',()=>{
  const free={stage:'lead_magnet',status:'review',title:'Quiz',priceCents:0,currency:'eur'};
  const paid={stage:'micro',status:'review',title:'Kit',priceCents:900,currency:'eur'};
  assert.equal(canPublishProduct(free,{tenantActive:true,ownerApproved:true,leadFlowVerified:true}),true);
  assert.equal(canPublishProduct(paid,{tenantActive:true,ownerApproved:true,leadFlowVerified:true}),false);
  assert.equal(canPublishProduct(paid,{tenantActive:true,ownerApproved:true,checkoutVerified:true,digitalDeliveryVerified:true,refundPolicyReady:true,legalTermsReady:true}),true);
  assert.equal(canPublishProduct({...paid,status:'draft'},{tenantActive:true,ownerApproved:true,checkoutVerified:true,digitalDeliveryVerified:true,refundPolicyReady:true,legalTermsReady:true}),false);
});
