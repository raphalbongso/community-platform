import { describe, it, expect } from "vitest";
import { sanitizeForPublic, containsBannedFields } from "../sanitizer";

/**
 * Integration tests verifying that data flowing through public API patterns
 * never contains financial data after sanitization.
 */

describe("Public API data sanitization", () => {
  it("sanitized feed post contains no financial fields", () => {
    const rawPost = {
      id: "post-1",
      title: "Update",
      body: "Content",
      type: "UPDATE",
      visibility: "PUBLIC",
      likeCount: 5,
      commentCount: 2,
      publishedAt: "2025-01-01",
      creator: { id: "u1", username: "creator1", displayName: "Creator", avatarUrl: null },
      // These should never be on a post, but testing defense-in-depth
      priceCents: 100,
      amountCents: 500,
    };

    const sanitized = sanitizeForPublic(rawPost);
    const violations = containsBannedFields(sanitized);
    expect(violations).toEqual([]);
  });

  it("sanitized initiative contains no soldCount or financial fields", () => {
    const rawInitiative = {
      id: "init-1",
      title: "My Initiative",
      slug: "my-initiative",
      intentText: "Intent",
      status: "ACTIVE",
      supporterCount: 10,
      tiers: [
        { id: "t1", name: "Basic", priceCents: 500, soldCount: 20, perksText: "Perks" },
        { id: "t2", name: "Pro", priceCents: 2000, soldCount: 5, perksText: "More perks" },
      ],
    };

    const sanitized = sanitizeForPublic(rawInitiative);
    const violations = containsBannedFields(sanitized);
    expect(violations).toEqual([]);
    expect((sanitized as Record<string, unknown>).tiers).toEqual([
      { id: "t1", name: "Basic", perksText: "Perks" },
      { id: "t2", name: "Pro", perksText: "More perks" },
    ]);
  });

  it("sanitized purchase data strips all financial fields", () => {
    const rawPurchase = {
      id: "p1",
      buyerId: "u1",
      amountCents: 1000,
      feeCents: 30,
      netCents: 970,
      providerRef: "pi_abc123",
      quantity: 1,
      status: "completed",
    };

    const sanitized = sanitizeForPublic(rawPurchase);
    const violations = containsBannedFields(sanitized);
    expect(violations).toEqual([]);
    expect(sanitized).toEqual({
      id: "p1",
      buyerId: "u1",
      quantity: 1,
      status: "completed",
    });
  });

  it("sanitized offer data strips priceCents and acceptedQty", () => {
    const rawOffer = {
      id: "o1",
      initiativeId: "init-1",
      tierId: "t1",
      maxQuantity: 100,
      priceCents: 500,
      acceptedQty: 25,
      status: "ACTIVE",
    };

    const sanitized = sanitizeForPublic(rawOffer);
    const violations = containsBannedFields(sanitized);
    expect(violations).toEqual([]);
    expect(sanitized).toEqual({
      id: "o1",
      initiativeId: "init-1",
      tierId: "t1",
      maxQuantity: 100,
      status: "ACTIVE",
    });
  });

  it("deeply nested financial data is stripped", () => {
    const complexData = {
      feed: {
        items: [
          {
            id: "1",
            initiative: {
              tiers: [
                { priceCents: 100, soldCount: 5, purchases: [{ amountCents: 100, feeCents: 3, netCents: 97 }] },
              ],
            },
          },
        ],
      },
    };

    const sanitized = sanitizeForPublic(complexData);
    const violations = containsBannedFields(sanitized);
    expect(violations).toEqual([]);
  });
});

describe("Dashboard data preserves financial fields (no sanitization)", () => {
  it("dashboard overview should contain financial data", () => {
    const dashboardData = {
      stats: { totalEarnedCents: 50000, totalSupporters: 100 },
      recentActivity: [
        { id: "1", amountCents: 1000, netCents: 970, feeCents: 30 },
      ],
    };

    // Dashboard data is NOT sanitized - verify fields are present
    const violations = containsBannedFields(dashboardData);
    expect(violations.length).toBeGreaterThan(0); // Should contain financial fields
  });
});
