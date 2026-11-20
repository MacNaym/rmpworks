import http from 'node:http';
import {resolveTenant} from './host-routing.mjs';
const PORT=Number(process.env.TENANT_SPIKE_PORT||3101);
const DEMO_CREATORS=new Map([
  ['vecchisalvataggi',{title:'Vecchi Salvataggi',category:'gaming'}],
  ['fotografo-demo',{title:'Fotografo Demo',category:'fotografia'}]
]);
const server=http.createServer((req,res)=>{
  const route=resolveTenant(req.headers.host);
  res.setHeader('content-type','application/json; charset=utf-8');
  res.setHeader('cache-control','no-store');
  res.setHeader('x-robots-tag','noindex, nofollow');
  if(!route){res.writeHead(404);return res.end(JSON.stringify({error:'unknown host'}));}
  if(route.kind==='marketing'){res.writeHead(200);return res.end(JSON.stringify({kind:'marketing',domain:'rmpworks.com'}));}
  const creator=DEMO_CREATORS.get(route.slug);
  if(!creator){res.writeHead(404);return res.end(JSON.stringify({error:'creator not found'}));}
  res.writeHead(200);
  res.end(JSON.stringify({kind:'creator',slug:route.slug,creator}));
});
server.listen(PORT,'127.0.0.1',()=>console.log(`Local tenant spike on http://127.0.0.1:${PORT}. Use Host header vecchisalvataggi.rmpworks.com`));
