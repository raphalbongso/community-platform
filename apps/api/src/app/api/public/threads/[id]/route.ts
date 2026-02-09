import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { success, error, handleRequest } from "../../../../../utils/response";
import { applyRateLimit } from "../../../../../middleware/rateLimiter";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    await applyRateLimit(request);

    const { id: threadId } = await params;

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        comments: {
          orderBy: { createdAt: "asc" },
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
        },
      },
    });

    if (!thread) {
      return error("NOT_FOUND", "Thread not found", 404);
    }

    // Increment view count (fire-and-forget)
    prisma.thread.update({
      where: { id: threadId },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    return success({
      id: thread.id,
      forumId: thread.forumId,
      author: thread.author,
      title: thread.title,
      body: thread.body,
      isPinned: thread.isPinned,
      isLocked: thread.isLocked,
      viewCount: thread.viewCount,
      replyCount: thread.replyCount,
      lastActivityAt: thread.lastActivityAt,
      createdAt: thread.createdAt,
      comments: thread.comments.map((c) => ({
        id: c.id,
        author: c.author,
        parentId: c.parentId,
        body: c.body,
        createdAt: c.createdAt,
      })),
    });
  });
}
