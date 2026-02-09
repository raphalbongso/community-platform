import { z } from "zod";

// ============================================================================
// Auth
// ============================================================================
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/, "Must contain uppercase").regex(/[a-z]/, "Must contain lowercase").regex(/[0-9]/, "Must contain number"),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(100),
});

// ============================================================================
// Initiatives
// ============================================================================
export const createInitiativeSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  intentText: z.string().min(1).max(280),
  storyText: z.string().optional(),
  coverUrl: z.string().url().optional(),
});

export const updateInitiativeSchema = createInitiativeSchema.partial();

export const createMilestoneSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  position: z.number().int().min(0),
});

export const updateMilestoneSchema = createMilestoneSchema.partial().extend({
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "SKIPPED"]).optional(),
});

export const createTierSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  priceCents: z.number().int().min(100),
  perksText: z.string().min(1),
  badgeName: z.string().max(50).optional(),
  maxQuantity: z.number().int().min(1).optional(),
  position: z.number().int().min(0),
});

// ============================================================================
// Posts & Comments
// ============================================================================
export const createPostSchema = z.object({
  initiativeId: z.string().optional(),
  type: z.enum(["UPDATE", "ANNOUNCEMENT", "DROP"]),
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  mediaUrls: z.array(z.string().url()).max(10).default([]),
  visibility: z.enum(["PUBLIC", "SUPPORTERS"]).default("PUBLIC"),
});

export const createCommentSchema = z.object({
  body: z.string().min(1).max(5000),
  parentId: z.string().optional(),
});

export const createThreadSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
});

// ============================================================================
// Support & Checkout
// ============================================================================
export const checkoutSchema = z.object({
  initiativeId: z.string().min(1),
  tierId: z.string().min(1),
  quantity: z.number().int().min(1).max(100),
});

// ============================================================================
// Offers
// ============================================================================
export const createOfferSchema = z.object({
  initiativeId: z.string().min(1),
  tierId: z.string().min(1),
  maxQuantity: z.number().int().min(1),
  priceCents: z.number().int().min(100),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
}).refine((d) => d.endsAt > d.startsAt, { message: "End date must be after start date", path: ["endsAt"] });

export const acceptOfferSchema = z.object({
  quantity: z.number().int().min(1),
});

// ============================================================================
// Snapshots
// ============================================================================
export const createSnapshotSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  initiativeId: z.string().optional(),
  tierId: z.string().optional(),
  minQuantity: z.number().int().min(1).optional(),
});

// ============================================================================
// Pagination & Search
// ============================================================================
export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const searchSchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(["creators", "initiatives", "posts"]).optional(),
});

// ============================================================================
// Inferred Types
// ============================================================================
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateInitiativeInput = z.infer<typeof createInitiativeSchema>;
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type CreateTierInput = z.infer<typeof createTierSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type CreateOfferInput = z.infer<typeof createOfferSchema>;
export type AcceptOfferInput = z.infer<typeof acceptOfferSchema>;
export type CreateSnapshotInput = z.infer<typeof createSnapshotSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
