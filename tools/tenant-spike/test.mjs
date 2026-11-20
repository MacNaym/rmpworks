import assert from 'node:assert/strict';
import {resolveTenant} from './host-routing.mjs';
const examples=[
 ['rmpworks.com',{kind:'marketing'}],
 ['www.rmpworks.com',{kind:'marketing'}],
 ['vecchisalvataggi.rmpworks.com',{kind:'creator',slug:'vecchisalvataggi'}],
 ['VECCHISALVATAGGI.RMPWORKS.COM:443',{kind:'creator',slug:'vecchisalvataggi'}],
 ['fotografo-demo.rmpworks.com:3101',{kind:'creator',slug:'fotografo-demo'}],
 ['gaming.vecchisalvataggi.rmpworks.com',null],
 ['admin.rmpworks.com',null],
 ['staging.rmpworks.com',null],
 ['evil-rmpworks.com',null],
 ['notrmpworks.com',null],
 ['-bad.rmpworks.com',null],
 ['bad-.rmpworks.com',null],
 ['vecchi_salvataggi.rmpworks.com',null],
 ['vecchisalvataggi.rmpworks.com.evil.test',null],
];
for(const [host,expected] of examples)assert.deepEqual(resolveTenant(host),expected,host);
console.log(`PASS: ${examples.length} hostname routing checks`);
