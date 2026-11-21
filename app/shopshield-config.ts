/**
 * RMP Works main-domain ShopShield integration.
 * Fail closed until the primary store is configured and verified.
 * Creator subdomains require their own approved per-tenant setup.
 */
export function shopShieldStoreId(value: string | undefined): string | null {
  return value?.trim() === "rmpworks.com" ? "rmpworks.com" : null;
}
