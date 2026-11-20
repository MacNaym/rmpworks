/** Local-only tenant hostname resolver; not production authentication. */
export const RESERVED_SLUGS=new Set(['www','api','admin','auth','mail','email','support','static','assets','app','cdn','staging','preview','design-lab','creator-studio']);
const LABEL=/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
export function resolveTenant(hostHeader, rootDomain='rmpworks.com'){
  if(typeof hostHeader!=='string'||hostHeader.length>253)return null;
  const host=hostHeader.trim().toLowerCase().replace(/:\d+$/,'').replace(/\.$/,'');
  if(!host||host.includes('/')||host.includes(' '))return null;
  const base=rootDomain.toLowerCase();
  if(host===base||host===`www.${base}`)return {kind:'marketing'};
  if(!host.endsWith(`.${base}`))return null;
  const slug=host.slice(0,-base.length-1);
  if(!LABEL.test(slug)||RESERVED_SLUGS.has(slug))return null;
  return {kind:'creator',slug};
}
