import { describe, it, expect } from "vitest";
import { sanitizeForPublic, containsBannedFields } from "../sanitizer";

describe("sanitizeForPublic", () => {
  it("strips priceCents from objects", () => {
    const input = { id: "1", name: "Tier", priceCents: 999 };
    const result = sanitizeForPublic(input);
    expect(result).toEqual({ id: "1", name: "Tier" });
    expect("priceCents" in result).toBe(false);
  });

  it("strips amountCents, feeCents, netCents", () => {
    const input = { id: "1", amountCents: 1000, feeCents: 30, netCents: 970 };
    const result = sanitizeForPublic(input);
    expect(result).toEqual({ id: "1" });
  });

  it("strips soldCount", () => {
    const input = { id: "1", name: "Tier", soldCount: 42 };
    const result = sanitizeForPublic(input);
    expect(result).toEqual({ id: "1", name: "Tier" });
  });

  it("strips providerRef", () => {
    const input = { id: "1", providerRef: "pi_123abc" };
    const result = sanitizeForPublic(input);
    expect(result).toEqual({ id: "1" });
  });

  it("strips acceptedQty", () => {
    const input = { id: "1", acceptedQty: 5 };
    const result = sanitizeForPublic(input);
    expect(result).toEqual({ id: "1" });
  });

  it("strips stripeCustomerId and stripeAccountId", () => {
    const input = { id: "1", stripeCustomerId: "cus_123", stripeAccountId: "acct_456" };
    const result = sanitizeForPublic(input);
    expect(result).toEqual({ id: "1" });
  });

  it("strips any field ending with Cents", () => {
    const input = { id: "1", customCents: 100, totalRevenueCents: 5000, name: "test" };
    const result = sanitizeForPublic(input);
    expect(result).toEqual({ id: "1", name: "test" });
  });

  it("handles nested objects", () => {
    const input = {
      id: "1",
      tier: { id: "t1", priceCents: 500, soldCount: 10, name: "Basic" },
      title: "Test",
    };
    const result = sanitizeForPublic(input);
    expect(result).toEqual({
      id: "1",
      tier: { id: "t1", name: "Basic" },
      title: "Test",
    });
  });

  it("handles arrays of objects", () => {
    const input = [
      { id: "1", priceCents: 100 },
      { id: "2", priceCents: 200 },
    ];
    const result = sanitizeForPublic(input);
    expect(result).toEqual([{ id: "1" }, { id: "2" }]);
  });

  it("handles deeply nested structures", () => {
    const input = {
      data: {
        items: [
          { id: "1", tier: { priceCents: 100, soldCount: 5 } },
        ],
      },
    };
    const result = sanitizeForPublic(input);
    expect(result).toEqual({
      data: { items: [{ id: "1", tier: {} }] },
    });
  });

  it("preserves null values", () => {
    expect(sanitizeForPublic(null)).toBe(null);
  });

  it("preserves undefined values", () => {
    expect(sanitizeForPublic(undefined)).toBe(undefined);
  });

  it("preserves primitive values", () => {
    expect(sanitizeForPublic("hello")).toBe("hello");
    expect(sanitizeForPublic(42)).toBe(42);
    expect(sanitizeForPublic(true)).toBe(true);
  });

  it("preserves Date objects", () => {
    const date = new Date("2025-01-01");
    expect(sanitizeForPublic(date)).toBe(date);
  });

  it("does not mutate the original object", () => {
    const input = { id: "1", priceCents: 100 };
    sanitizeForPublic(input);
    expect(input.priceCents).toBe(100);
  });

  it("handles empty objects", () => {
    expect(sanitizeForPublic({})).toEqual({});
  });

  it("handles empty arrays", () => {
    expect(sanitizeForPublic([])).toEqual([]);
  });
});

describe("containsBannedFields", () => {
  it("detects priceCents", () => {
    const result = containsBannedFields({ priceCents: 100 });
    expect(result).toContain("$.priceCents");
  });

  it("detects nested banned fields", () => {
    const result = containsBannedFields({
      tier: { soldCount: 5, priceCents: 100 },
    });
    expect(result).toContain("$.tier.soldCount");
    expect(result).toContain("$.tier.priceCents");
  });

  it("detects banned fields in arrays", () => {
    const result = containsBannedFields({
      items: [{ amountCents: 100 }],
    });
    expect(result).toContain("$.items[0].amountCents");
  });

  it("returns empty array for clean data", () => {
    const result = containsBannedFields({ id: "1", name: "test" });
    expect(result).toEqual([]);
  });

  it("detects fields ending with Cents", () => {
    const result = containsBannedFields({ customFieldCents: 50 });
    expect(result).toContain("$.customFieldCents");
  });

  it("handles null input", () => {
    expect(containsBannedFields(null)).toEqual([]);
  });
});
