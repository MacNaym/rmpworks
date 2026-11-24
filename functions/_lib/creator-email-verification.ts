/**
 * B7: Email ownership verification primitives, deliberately NOT wired to HTTP,
 * DB, email provider or any production route.
 *
 * Only the raw opaque token is sent by email. Store its SHA-256 digest, never
 * the token itself. The database adapter MUST consume atomically and once.
 */
export const VERIFICATION_TTL_SECONDS = 15 * 60;
const TOKEN_BYTES = 32;
const encoder = new TextEncoder();
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
const digestPattern = /^[0-9a-f]{64}$/;
export type VerificationChallenge = {
  token: string; // Send only to the user's verified-delivery address
  tokenDigest: string; // Store in the backend, NEVER expose this with the token
  expiresAt: string;
};
export type ConsumeVerification = (input: {
  tokenDigest: string;
  nowIso: string;
}) => Promise<"consumed" | "invalid" | "expired">;
export type Redemption = "verified" | "invalid" | "unavailable";

const bytesToBase64Url = (bytes: Uint8Array): string => {
  // Buffer is unavailable on Cloudflare; btoa is provided in Workers and Node.
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};
export async function sha256Token(token: string): Promise<string> {
  if (!tokenPattern.test(token)) throw new Error("Invalid verification token format");
  const hashed = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(token)));
  return [...hashed].map(x => x.toString(16).padStart(2, "0")).join("");
}
export async function issueEmailVerification(nowMs = Date.now()): Promise<VerificationChallenge> {
  if (!Number.isSafeInteger(nowMs) || nowMs < 0 || nowMs > 8.64e15 - VERIFICATION_TTL_SECONDS * 1000) {
    throw new Error("Invalid issuance time");
  }
  const token = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(TOKEN_BYTES)));
  return {
    token,
    tokenDigest: await sha256Token(token),
    expiresAt: new Date(nowMs + VERIFICATION_TTL_SECONDS * 1000).toISOString(),
  };
}
export async function redeemEmailVerification(
  token: unknown,
  consumeAtomically: ConsumeVerification,
  nowMs = Date.now()
): Promise<Redemption> {
  if (typeof token !== "string" || !tokenPattern.test(token) ||
      !Number.isSafeInteger(nowMs) || nowMs < 0 || nowMs > 8.64e15) return "invalid";
  try {
    const tokenDigest = await sha256Token(token);
    if (!digestPattern.test(tokenDigest)) return "unavailable";
    // Must be a single scoped atomic DB operation that checks unused token,
    // expiry, pending lead state and creator/magnet association.
    const result = await consumeAtomically({tokenDigest, nowIso:new Date(nowMs).toISOString()});
    return result === "consumed" ? "verified" : result === "invalid" || result === "expired" ? "invalid" : "unavailable";
  } catch {
    return "unavailable";
  }
}
export function verificationLink(origin: string, token: string): string {
  const url = new URL(origin);
  if (url.protocol !== "https:" || url.username || url.password || url.pathname !== "/" ||
      url.search || url.hash || !tokenPattern.test(token) ||
      !["rmpworks.com", "www.rmpworks.com"].includes(url.hostname)) {
    throw new Error("Unapproved email verification origin/token");
  }
  url.pathname = "/creator/confirm-email";
  url.searchParams.set("token", token);
  return url.toString();
}
