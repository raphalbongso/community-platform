import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../../middleware/auth";
import { applyRateLimit } from "../../../../../../middleware/rateLimiter";
import { success, error, handleRequest } from "../../../../../../utils/response";
import { createCommentSchema } from "@community/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    await applyRateLimit(request, auth.userId);

    const { id: postId } = await params;
    const body = await request.json();
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return error("VALIDATION_ERROR", "Invalid comment data", 400, {
        issues: parsed.error.issues,
      });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, visibility: true, initiativeId: true },
    });

    if (!post) {
      return error("NOT_FOUND", "Post not found", 404);
    }

    // Check entitlement for the specific initiative
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

    const comment = await prisma.$transaction(async (tx) => {
      const c = await tx.comment.create({
        data: {
          authorId: auth.userId,
          postId,
          parentId: parsed.data.parentId ?? null,
          body: parsed.data.body,
        },
        include: {
          author: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
        },
      });

      await tx.post.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });

      return c;
    });

    return success(
      {
        id: comment.id,
        author: comment.author,
        body: comment.body,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
      },
      201
    );
  });
}
