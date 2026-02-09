import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { sanitizeForPublic } from "../../../../middleware/sanitizer";
import { success, handleRequest } from "../../../../utils/response";
import { applyRateLimit } from "../../../../middleware/rateLimiter";

export async function GET(request: NextRequest) {
  return handleRequest(async () => {
    await applyRateLimit(request);

    const forums = await prisma.forum.findMany({
      where: { isArchived: false, isSupporterOnly: false },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        scope: true,
        title: true,
        description: true,
        slug: true,
        _count: { select: { threads: true } },
      },
    });

    const items = forums.map((f) => ({
      id: f.id,
      scope: f.scope,
      title: f.title,
      description: f.description,
      slug: f.slug,
      threadCount: f._count.threads,
    }));

    return success(sanitizeForPublic({ items }));
  });
}
