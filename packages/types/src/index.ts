// ============================================================================
// User & Auth
// ============================================================================
export type UserRole = "FAN" | "CREATOR" | "ADMIN";

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  createdAt: Date;
}

export interface CreatorProfile {
  userId: string;
  bio: string | null;
  genreTags: string[];
  socials: Record<string, string> | null;
  verified: boolean;
  followerCount: number;
}

export type Permission =
  | "read:public"
  | "read:own_profile"
  | "write:own_profile"
  | "read:own_entitlements"
  | "write:support"
  | "read:creator_dashboard"
  | "write:creator_content"
  | "read:financial_data"
  | "write:financial_data"
  | "admin:all";

export interface AuthContext {
  userId: string;
  role: UserRole;
  sessionId: string;
  permissions: Permission[];
}

// ============================================================================
// Initiatives & Content
// ============================================================================
export type InitiativeStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
export type MilestoneStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";
export type PostType = "UPDATE" | "ANNOUNCEMENT" | "DROP";
export type Visibility = "PUBLIC" | "SUPPORTERS";
export type ForumScope = "GLOBAL" | "CREATOR" | "INITIATIVE" | "COMMUNITY";

export interface Initiative {
  id: string;
  creatorId: string;
  title: string;
  slug: string;
  intentText: string;
  storyText: string | null;
  coverUrl: string | null;
  status: InitiativeStatus;
  createdAt: Date;
}

export interface Milestone {
  id: string;
  initiativeId: string;
  title: string;
  description: string | null;
  position: number;
  status: MilestoneStatus;
  completedAt: Date | null;
}

export interface Post {
  id: string;
  creatorId: string;
  initiativeId: string | null;
  type: PostType;
  title: string;
  body: string;
  mediaUrls: string[];
  visibility: Visibility;
  likeCount: number;
  commentCount: number;
  publishedAt: Date | null;
  createdAt: Date;
}

export interface Forum {
  id: string;
  scope: ForumScope;
  title: string;
  description: string | null;
  slug: string;
  isSupporterOnly: boolean;
}

export interface Thread {
  id: string;
  forumId: string;
  authorId: string;
  title: string;
  body: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  replyCount: number;
  lastActivityAt: Date;
  createdAt: Date;
}

export interface Comment {
  id: string;
  authorId: string;
  threadId: string | null;
  postId: string | null;
  parentId: string | null;
  body: string;
  createdAt: Date;
}

// ============================================================================
// Support & Financial (PRIVATE - dashboard only)
// ============================================================================
export type PaymentProvider = "STRIPE" | "CRYPTO";
export type EntitlementSource = "PURCHASE" | "TRANSFER" | "GRANT";
export type OfferStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "EXPIRED" | "CANCELLED";
export type AcceptanceStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED" | "FAILED";

export interface SupportTier {
  id: string;
  initiativeId: string;
  name: string;
  description: string | null;
  priceCents: number;
  perksText: string;
  badgeName: string | null;
  badgeUrl: string | null;
  maxQuantity: number | null;
  soldCount: number;
  isActive: boolean;
  position: number;
}

/** Tier data safe for public display (support modal needs priceCents) */
export interface PublicSupportTier {
  id: string;
  initiativeId: string;
  name: string;
  description: string | null;
  priceCents: number;
  perksText: string;
  badgeName: string | null;
  badgeUrl: string | null;
  isActive: boolean;
  position: number;
}

export interface Purchase {
  id: string;
  buyerId: string;
  initiativeId: string;
  tierId: string;
  quantity: number;
  amountCents: number;
  feeCents: number;
  netCents: number;
  provider: PaymentProvider;
  status: string;
  createdAt: Date;
}

export interface Entitlement {
  id: string;
  userId: string;
  initiativeId: string;
  tierId: string;
  quantityActive: number;
  grantedAt: Date;
}

export interface AcquisitionOffer {
  id: string;
  creatorId: string;
  initiativeId: string;
  tierId: string;
  maxQuantity: number;
  priceCents: number;
  startsAt: Date;
  endsAt: Date;
  status: OfferStatus;
  acceptedQty: number;
}

// ============================================================================
// API Response Types
// ============================================================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  requestId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** Sanitized post for public API */
export interface SanitizedPost {
  id: string;
  creator: { id: string; username: string; displayName: string; avatarUrl: string | null };
  initiativeId: string | null;
  type: PostType;
  title: string;
  bodyPreview: string;
  mediaUrls: string[];
  visibility: Visibility;
  likeCount: number;
  commentCount: number;
  publishedAt: Date | null;
  createdAt: Date;
}

/** Sanitized initiative for public API */
export interface SanitizedInitiative {
  id: string;
  creator: { id: string; username: string; displayName: string; avatarUrl: string | null };
  title: string;
  slug: string;
  intentText: string;
  storyText: string | null;
  coverUrl: string | null;
  status: InitiativeStatus;
  supporterCount: number;
  createdAt: Date;
}
