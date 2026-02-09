import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../middleware/auth";
import { requireCreator } from "../../../../middleware/rbac";
import { applyRateLimit } from "../../../../middleware/rateLimiter";
import { success, error, handleRequest } from "../../../../utils/response";
import { createPostSchema } from "@community/validators";

export async function GET(request: NextRequest) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    await applyRateLimit(request, auth.userId);

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 20), 50);

    const posts = await prisma.post.findMany({
      where: { creatorId: auth.userId },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        initiative: { select: { id: true, title: true, slug: true } },
      },
    });

    const hasMore = posts.length > limit;
    const items = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return success({ items, nextCursor, hasMore });
  });
}

export async function POST(request: NextRequest) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    await applyRateLimit(request, auth.userId);

    const body = await request.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return error("VALIDATION_ERROR", "Invalid post data", 400, {
        issues: parsed.error.issues,
      });
    }

    const post = await prisma.post.create({
      data: {
        creatorId: auth.userId,
        initiativeId: parsed.data.initiativeId ?? null,
        type: parsed.data.type ?? "UPDATE",
        title: parsed.data.title,
        body: parsed.data.body,
        mediaUrls: parsed.data.mediaUrls ?? [],
        visibility: parsed.data.visibility ?? "PUBLIC",
        publishedAt: new Date(),
      },
    });

    return success(post, 201);
  });
}
