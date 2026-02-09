import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { sanitizeForPublic } from "../../../../../middleware/sanitizer";
import { success, error, handleRequest } from "../../../../../utils/response";
import { applyRateLimit } from "../../../../../middleware/rateLimiter";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  return handleRequest(async () => {
    await applyRateLimit(request);

    const { slug } = await params;

    const initiative = await prisma.initiative.findUnique({
      where: { slug },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        milestones: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            position: true,
            status: true,
            completedAt: true,
          },
        },
        supportTiers: {
          where: { isActive: true, visibility: "PUBLIC" },
          orderBy: { position: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            priceCents: true, // Needed for support modal - but sanitizer won't strip since PublicSupportTier allows it
            perksText: true,
            badgeName: true,
            badgeUrl: true,
            isActive: true,
            position: true,
            maxQuantity: true,
            // soldCount is NOT selected - never exposed
          },
        },
        _count: {
          select: { entitlements: true, posts: true },
        },
      },
    });

    if (!initiative || initiative.status === "DRAFT") {
      return error("NOT_FOUND", "Initiative not found", 404);
    }

    const data = {
      id: initiative.id,
      creator: initiative.creator,
      title: initiative.title,
      slug: initiative.slug,
      intentText: initiative.intentText,
      storyText: initiative.storyText,
      coverUrl: initiative.coverUrl,
      status: initiative.status,
      milestones: initiative.milestones,
      tiers: initiative.supportTiers,
      supporterCount: initiative._count.entitlements,
      postCount: initiative._count.posts,
      createdAt: initiative.createdAt,
    };

    return success(data);
  });
}
