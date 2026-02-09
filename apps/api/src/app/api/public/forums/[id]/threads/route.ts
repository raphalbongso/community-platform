import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { sanitizeForPublic } from "../../../../../../middleware/sanitizer";
import { success, error, handleRequest } from "../../../../../../utils/response";
import { applyRateLimit } from "../../../../../../middleware/rateLimiter";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    await applyRateLimit(request);

    const { id: forumId } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

    const forum = await prisma.forum.findUnique({
      where: { id: forumId },
      select: { id: true, isSupporterOnly: true, isArchived: true },
    });

    if (!forum || forum.isArchived) {
      return error("NOT_FOUND", "Forum not found", 404);
    }

    if (forum.isSupporterOnly) {
      return error("FORBIDDEN", "This forum is for supporters only", 403);
    }

    const threads = await prisma.thread.findMany({
      where: { forumId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: [{ isPinned: "desc" }, { lastActivityAt: "desc" }],
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });

    const hasMore = threads.length > limit;
    const items = hasMore ? threads.slice(0, limit) : threads;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return success(sanitizeForPublic({
      items: items.map((t) => ({
        id: t.id,
        author: t.author,
        title: t.title,
        isPinned: t.isPinned,
        isLocked: t.isLocked,
        viewCount: t.viewCount,
        replyCount: t.replyCount,
        lastActivityAt: t.lastActivityAt,
        createdAt: t.createdAt,
      })),
      nextCursor,
      hasMore,
    }));
  });
}
