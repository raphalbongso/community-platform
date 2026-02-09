import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { sanitizeForPublic } from "../../../../../middleware/sanitizer";
import { success, error, handleRequest } from "../../../../../utils/response";
import { applyRateLimit } from "../../../../../middleware/rateLimiter";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  return handleRequest(async () => {
    await applyRateLimit(request);

    const { username } = await params;

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
        creatorProfile: {
          select: {
            bio: true,
            genreTags: true,
            socials: true,
            verified: true,
            followerCount: true,
          },
        },
      },
    });

    if (!user || !user.creatorProfile) {
      return error("NOT_FOUND", "Creator not found", 404);
    }

    // Get their public initiatives
    const initiatives = await prisma.initiative.findMany({
      where: { creatorId: user.id, status: "ACTIVE" },
      select: {
        id: true,
        title: true,
        slug: true,
        intentText: true,
        coverUrl: true,
        status: true,
        createdAt: true,
        _count: { select: { entitlements: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get their public posts
    const recentPosts = await prisma.post.findMany({
      where: { creatorId: user.id, visibility: "PUBLIC", publishedAt: { not: null } },
      take: 10,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        mediaUrls: true,
        likeCount: true,
        commentCount: true,
        publishedAt: true,
      },
    });

    const data = sanitizeForPublic({
      ...user,
      initiatives: initiatives.map((i) => ({
        ...i,
        supporterCount: i._count.entitlements,
        _count: undefined,
      })),
      recentPosts: recentPosts.map((p) => ({
        ...p,
        bodyPreview: p.body.slice(0, 300),
        body: undefined,
      })),
    });

    return success(data);
  });
}
