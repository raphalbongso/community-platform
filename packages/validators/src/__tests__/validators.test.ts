import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  createInitiativeSchema,
  createMilestoneSchema,
  createTierSchema,
  createPostSchema,
  checkoutSchema,
  createCommentSchema,
  createThreadSchema,
  createOfferSchema,
  acceptOfferSchema,
  createSnapshotSchema,
  paginationSchema,
  searchSchema,
} from "../index";

describe("loginSchema", () => {
  it("accepts valid login", () => {
    expect(loginSchema.safeParse({ email: "test@example.com", password: "password123" }).success).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(loginSchema.safeParse({ email: "notanemail", password: "password123" }).success).toBe(false);
  });

  it("rejects short password", () => {
    expect(loginSchema.safeParse({ email: "test@example.com", password: "short" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("accepts valid registration", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Password123",
      username: "testuser",
      displayName: "Test User",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short username", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Password123",
      username: "ab",
      displayName: "Test",
    });
    expect(result.success).toBe(false);
  });

  it("rejects username over 30 chars", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      password: "Password123",
      username: "a".repeat(31),
      displayName: "Test",
    });
    expect(result.success).toBe(false);
  });
});

describe("createInitiativeSchema", () => {
  it("accepts valid initiative", () => {
    const result = createInitiativeSchema.safeParse({
      title: "My Initiative",
      slug: "my-initiative",
      intentText: "A brief description of intent",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createInitiativeSchema.safeParse({
      title: "",
      slug: "my-initiative",
      intentText: "Intent",
    });
    expect(result.success).toBe(false);
  });

  it("rejects intentText over 280 chars", () => {
    const result = createInitiativeSchema.safeParse({
      title: "Test",
      slug: "test",
      intentText: "a".repeat(281),
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional storyText and coverUrl", () => {
    const result = createInitiativeSchema.safeParse({
      title: "Test",
      slug: "test",
      intentText: "Intent",
      storyText: "A longer story...",
      coverUrl: "https://example.com/cover.jpg",
    });
    expect(result.success).toBe(true);
  });
});

describe("createMilestoneSchema", () => {
  it("accepts valid milestone", () => {
    expect(createMilestoneSchema.safeParse({ title: "First milestone", position: 0 }).success).toBe(true);
  });

  it("accepts optional description", () => {
    expect(createMilestoneSchema.safeParse({ title: "Test", description: "Details", position: 0 }).success).toBe(true);
  });

  it("rejects empty title", () => {
    expect(createMilestoneSchema.safeParse({ title: "" }).success).toBe(false);
  });
});

describe("createTierSchema", () => {
  it("accepts valid tier", () => {
    const result = createTierSchema.safeParse({
      name: "Bronze",
      priceCents: 999,
      perksText: "Access to updates",
      position: 0,
    });
    expect(result.success).toBe(true);
  });

  it("rejects negative priceCents", () => {
    const result = createTierSchema.safeParse({
      name: "Bronze",
      priceCents: -100,
      perksText: "Perks",
      position: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects priceCents below 100", () => {
    const result = createTierSchema.safeParse({
      name: "Free",
      priceCents: 50,
      perksText: "Perks",
      position: 0,
    });
    expect(result.success).toBe(false);
  });
});

describe("createPostSchema", () => {
  it("accepts valid post", () => {
    const result = createPostSchema.safeParse({
      title: "My Post",
      body: "Post content here",
      type: "UPDATE",
    });
    expect(result.success).toBe(true);
  });

  it("accepts all optional fields", () => {
    const result = createPostSchema.safeParse({
      title: "Post",
      body: "Content",
      type: "ANNOUNCEMENT",
      visibility: "SUPPORTERS",
      initiativeId: "init-1",
      mediaUrls: ["https://example.com/img.jpg"],
    });
    expect(result.success).toBe(true);
  });
});

describe("checkoutSchema", () => {
  it("accepts valid checkout", () => {
    expect(checkoutSchema.safeParse({ initiativeId: "init-1", tierId: "tier-1", quantity: 1 }).success).toBe(true);
  });

  it("rejects zero quantity", () => {
    expect(checkoutSchema.safeParse({ initiativeId: "init-1", tierId: "tier-1", quantity: 0 }).success).toBe(false);
  });

  it("rejects missing tierId", () => {
    expect(checkoutSchema.safeParse({ initiativeId: "init-1", quantity: 1 }).success).toBe(false);
  });
});

describe("createCommentSchema", () => {
  it("accepts valid comment", () => {
    expect(createCommentSchema.safeParse({ body: "Great post!" }).success).toBe(true);
  });

  it("accepts optional parentId", () => {
    expect(createCommentSchema.safeParse({ body: "Reply", parentId: "comment-1" }).success).toBe(true);
  });

  it("rejects empty body", () => {
    expect(createCommentSchema.safeParse({ body: "" }).success).toBe(false);
  });
});

describe("createThreadSchema", () => {
  it("accepts valid thread", () => {
    const result = createThreadSchema.safeParse({
      forumId: "forum-1",
      title: "Discussion",
      body: "Let's talk about this",
    });
    expect(result.success).toBe(true);
  });

  it("accepts thread without forumId (forumId is set by route)", () => {
    expect(createThreadSchema.safeParse({ title: "Test", body: "Content" }).success).toBe(true);
  });
});

describe("createOfferSchema", () => {
  it("accepts valid offer", () => {
    const result = createOfferSchema.safeParse({
      initiativeId: "init-1",
      tierId: "tier-1",
      maxQuantity: 100,
      priceCents: 500,
      startsAt: "2025-01-01T00:00:00Z",
      endsAt: "2025-12-31T23:59:59Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects zero maxQuantity", () => {
    const result = createOfferSchema.safeParse({
      initiativeId: "init-1",
      tierId: "tier-1",
      maxQuantity: 0,
      priceCents: 500,
      startsAt: "2025-01-01",
      endsAt: "2025-12-31",
    });
    expect(result.success).toBe(false);
  });
});

describe("acceptOfferSchema", () => {
  it("accepts valid acceptance", () => {
    expect(acceptOfferSchema.safeParse({ quantity: 1 }).success).toBe(true);
  });

  it("rejects zero quantity", () => {
    expect(acceptOfferSchema.safeParse({ quantity: 0 }).success).toBe(false);
  });
});

describe("createSnapshotSchema", () => {
  it("accepts valid snapshot", () => {
    expect(createSnapshotSchema.safeParse({ name: "Q1 Snapshot" }).success).toBe(true);
  });

  it("accepts optional fields", () => {
    const result = createSnapshotSchema.safeParse({
      name: "Snapshot",
      description: "Details",
      initiativeId: "init-1",
    });
    expect(result.success).toBe(true);
  });
});

describe("paginationSchema", () => {
  it("accepts valid pagination", () => {
    expect(paginationSchema.safeParse({ limit: 20, cursor: "abc" }).success).toBe(true);
  });

  it("applies defaults", () => {
    const result = paginationSchema.parse({});
    expect(result.limit).toBe(20);
  });

  it("caps limit at 50", () => {
    const result = paginationSchema.safeParse({ limit: 51 });
    expect(result.success).toBe(false);
  });
});

describe("searchSchema", () => {
  it("accepts valid search", () => {
    expect(searchSchema.safeParse({ q: "test query" }).success).toBe(true);
  });

  it("accepts single character query (min 1)", () => {
    expect(searchSchema.safeParse({ q: "a" }).success).toBe(true);
  });

  it("rejects empty query", () => {
    expect(searchSchema.safeParse({ q: "" }).success).toBe(false);
  });
});
