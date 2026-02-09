import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { sanitizeForPublic } from "../../../../middleware/sanitizer";
import { success, error, handleRequest } from "../../../../utils/response";
import { applyRateLimit } from "../../../../middleware/rateLimiter";

export async function GET(request: NextRequest) {
  return handleRequest(async () => {
    await applyRateLimit(request);

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);
    const type = searchParams.get("type"); // UPDATE, ANNOUNCEMENT, DROP

    const where: Record<string, unknown> = {
      visibility: "PUBLIC",
      publishedAt: { not: null },
    };
    if (type) where.type = type;

    const posts = await prisma.post.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { publishedAt: "desc" },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    const sanitized = sanitizeForPublic(
      items.map((post) => ({
        id: post.id,
        creator: post.creator,
        initiativeId: post.initiativeId,
        type: post.type,
        title: post.title,
        bodyPreview: post.body.slice(0, 300),
        mediaUrls: post.mediaUrls,
        visibility: post.visibility,
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
      }))
    );

    return success({ items: sanitized, nextCursor, hasMore });
  });
}
