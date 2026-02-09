/**
 * Fields that MUST be stripped from all public API responses.
 * These fields contain financial or internal data that fans should never see.
 */
const BANNED_FIELDS = new Set([
  // Financial fields (anything ending in Cents)
  "priceCents",
  "amountCents",
  "feeCents",
  "netCents",
  // Internal metrics
  "soldCount",
  "acceptedQty",
  // Payment provider references
  "providerRef",
  "stripeCustomerId",
  "stripeAccountId",
]);

/**
 * Recursively strip banned fields from an object.
 * Returns a new object - does not mutate the input.
 */
export function sanitizeForPublic<T>(data: T): T {
  if (data === null || data === undefined) return data;

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForPublic(item)) as T;
  }

  if (data instanceof Date) return data;

  if (typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (BANNED_FIELDS.has(key)) continue;
      // Also strip any field ending with "Cents" as a safety net
      if (key.endsWith("Cents")) continue;
      sanitized[key] = sanitizeForPublic(value);
    }
    return sanitized as T;
  }

  return data;
}

/**
 * Check if an object contains any banned fields.
 * Useful for testing/verification.
 */
export function containsBannedFields(data: unknown): string[] {
  const found: string[] = [];

  function check(obj: unknown, path: string) {
    if (obj === null || obj === undefined || typeof obj !== "object") return;

    if (Array.isArray(obj)) {
      obj.forEach((item, i) => check(item, `${path}[${i}]`));
      return;
    }

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (BANNED_FIELDS.has(key) || key.endsWith("Cents")) {
        found.push(`${path}.${key}`);
      }
      check(value, `${path}.${key}`);
    }
  }

  check(data, "$");
  return found;
}
