/**
 * B7: generate a private resource response only from trusted server-side
 * eligibility checks. No public route imports this module.
 * Must be called after verified-email, tenant/magnet ownership and release
 * checks obtained from authoritative DB state, not visitor-supplied JSON.
 */
export type ApprovedResource = {
  creatorId: string;
  magnetId: string;
  creatorName: string;
  format: "checklist" | "mini_guide";
  title: string;
  subtitle: string;
  content: string;
  status: "approved" | "draft";
};
export type ResourceAccess = {
  releaseEnabled: boolean;
  creatorPublished: boolean;
  emailVerified: boolean;
  downloadGrantValid: boolean;
  tenantId: string;
  magnetId: string;
};
const uuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const esc = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
const denyHeaders = {"cache-control":"private, no-store","x-robots-tag":"noindex,nofollow","referrer-policy":"no-referrer","x-content-type-options":"nosniff"};
const denied = () => new Response("Risorsa non disponibile.",{status:404,headers:{"content-type":"text/plain; charset=utf-8",...denyHeaders}});
export function renderVerifiedLeadMagnet(access: ResourceAccess, resource: ApprovedResource): Response {
  if (!access.releaseEnabled || !access.creatorPublished || !access.emailVerified ||
      !access.downloadGrantValid || !uuid(access.tenantId) || !uuid(access.magnetId) ||
      !uuid(resource.creatorId) || !uuid(resource.magnetId) ||
      access.tenantId !== resource.creatorId || access.magnetId !== resource.magnetId ||
      resource.status !== "approved" || !["checklist","mini_guide"].includes(resource.format) ||
      typeof resource.title !== "string" || resource.title.length < 3 || resource.title.length > 180 ||
      typeof resource.creatorName !== "string" || resource.creatorName.length > 100 ||
      typeof resource.subtitle !== "string" || resource.subtitle.length > 300 ||
      typeof resource.content !== "string" || resource.content.length < 80 || resource.content.length > 20000) return denied();
  const html = `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(resource.title)}</title><style>body{font:17px/1.7 system-ui,sans-serif;max-width:720px;margin:55px auto;padding:0 24px;color:#171615}h1{line-height:1.15}main{white-space:pre-wrap;overflow-wrap:anywhere}footer{border-top:1px solid #333;margin-top:40px;padding:15px 0}@media print{@page{size:A4;margin:20mm}body{margin:0}}</style></head><body><header><small>RMP WORKS · RISORSA GRATUITA</small><h1>${esc(resource.title)}</h1><p>${esc(resource.subtitle)}</p></header><main>${esc(resource.content)}</main><footer>${esc(resource.creatorName)}</footer></body></html>`;
  return new Response(html,{status:200,headers:{
    "content-type":"text/html; charset=utf-8",
    "content-disposition":'attachment; filename="rmp-risorsa.html"',
    "content-security-policy":"sandbox; default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'",
    ...denyHeaders,
  }});
}
