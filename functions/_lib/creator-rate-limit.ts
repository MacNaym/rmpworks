/**
 * B6: fail-closed, fixed-window limiter for future public creator forms.
 * Requires a dedicated Cloudflare D1 table and secret before wiring to routes.
 * No current route imports this helper.
 */
type D1Statement = {
  bind(...values: unknown[]): {first<T>(): Promise<T | null>};
};
export type RateLimitDb = {prepare(sql: string): D1Statement};
export type LimitOptions = {
  db: RateLimitDb | undefined;
  secret: string | undefined;
  clientIp: string | undefined;
  tenantId: string;
  action: string;
  maxRequests: number;
  windowSeconds: number;
  nowMs?: number;
};
export type LimitDecision = {allowed: boolean; reason: "ok" | "limited" | "unavailable"};

const encoder = new TextEncoder();
function hex(bytes: Uint8Array): string {
  return [...bytes].map(byte => byte.toString(16).padStart(2, "0")).join("");
}
/** Never persist raw IPs or email addresses in limiter storage. */
async function bucketId(secret: string, tenantId: string, action: string, ip: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  const raw = await crypto.subtle.sign("HMAC",key,encoder.encode(JSON.stringify([tenantId,action,ip])));
  return hex(new Uint8Array(raw));
}
export async function consumeCreatorRateLimit(options: LimitOptions): Promise<LimitDecision> {
  const {db, secret, clientIp, tenantId, action, maxRequests, windowSeconds} = options;
  if (!db || !secret || secret.length < 32 || !clientIp ||
      clientIp.length > 64 || !/^[0-9a-fA-F:.]+$/.test(clientIp) ||
      !/^[a-zA-Z0-9_-]{1,80}$/.test(tenantId) ||
      !/^[a-z_]{1,40}$/.test(action) ||
      !Number.isSafeInteger(maxRequests) || maxRequests < 1 || maxRequests > 1000 ||
      !Number.isSafeInteger(windowSeconds) || windowSeconds < 10 || windowSeconds > 86400) {
    return {allowed:false,reason:"unavailable"};
  }
  const now = options.nowMs ?? Date.now();
  if (!Number.isSafeInteger(now) || now < 0) return {allowed:false,reason:"unavailable"};
  const start = Math.floor(Math.floor(now / 1000) / windowSeconds) * windowSeconds;
  try {
    const key = await bucketId(secret, tenantId, action, clientIp);
    // Atomic insert/update. If window is full the conditional update returns no row.
    const sql = `INSERT INTO creator_request_limits(bucket_key,window_start,expires_at,hits)
VALUES (?1,?2,?3,1)
ON CONFLICT(bucket_key,window_start) DO UPDATE SET hits=hits+1
WHERE hits < ?4
RETURNING hits`;
    const row = await db.prepare(sql).bind(key,start,start+windowSeconds+86400,maxRequests).first<{hits:number}>();
    if (!row) return {allowed:false,reason:"limited"};
    return row.hits >= 1 && row.hits <= maxRequests
      ? {allowed:true,reason:"ok"}
      : {allowed:false,reason:"unavailable"};
  } catch {
    return {allowed:false,reason:"unavailable"};
  }
}
