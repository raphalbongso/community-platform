import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../../middleware/auth";
import { applyRateLimit } from "../../../../../../middleware/rateLimiter";
import { success, error, handleRequest } from "../../../../../../utils/response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    await applyRateLimit(request, auth.userId);

    const { id: postId } = await params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, visibility: true, initiativeId: true },
    });

    if (!post) {
      return error("NOT_FOUND", "Post not found", 404);
    }

    // If post is supporters-only, check entitlement for the specific initiative
    if (post.visibility === "SUPPORTERS") {
      const hasEntitlement = await prisma.entitlement.findFirst({
        where: {
          userId: auth.userId,
          ...(post.initiativeId ? { initiativeId: post.initiativeId } : {}),
        },
      });
      if (!hasEntitlement && auth.role !== "ADMIN") {
        return error("FORBIDDEN", "Supporters-only content", 403);
      }
    }

    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });

    return success({ liked: true });
  });
}
