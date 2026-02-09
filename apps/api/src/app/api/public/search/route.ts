import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { sanitizeForPublic } from "../../../../middleware/sanitizer";
import { success, error, handleRequest } from "../../../../utils/response";
import { applyRateLimit } from "../../../../middleware/rateLimiter";

export async function GET(request: NextRequest) {
  return handleRequest(async () => {
    await applyRateLimit(request);

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();
    const type = searchParams.get("type") ?? "all"; // all, initiatives, creators, posts, threads
    const limit = Math.min(Number(searchParams.get("limit") ?? 10), 30);

    if (!q || q.length < 2) {
      return error("VALIDATION_ERROR", "Search query must be at least 2 characters", 400);
    }

    const searchPattern = `%${q}%`;
    const results: Record<string, unknown[]> = {};

    if (type === "all" || type === "initiatives") {
      const initiatives = await prisma.initiative.findMany({
        where: {
          status: { in: ["ACTIVE", "COMPLETED"] },
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { intentText: { contains: q, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          intentText: true,
          coverUrl: true,
          status: true,
          creator: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
          _count: { select: { entitlements: true } },
        },
      });
      results.initiatives = sanitizeForPublic(
        initiatives.map((i) => ({
          ...i,
          supporterCount: i._count.entitlements,
          _count: undefined,
        }))
      );
    }

    if (type === "all" || type === "creators") {
      const creators = await prisma.user.findMany({
        where: {
          role: "CREATOR",
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { displayName: { contains: q, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          creatorProfile: {
            select: { bio: true, genreTags: true, verified: true, followerCount: true },
          },
        },
      });
      results.creators = creators;
    }

    if (type === "all" || type === "posts") {
      const posts = await prisma.post.findMany({
        where: {
          visibility: "PUBLIC",
          publishedAt: { not: null },
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { body: { contains: q, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          body: true,
          likeCount: true,
          commentCount: true,
          publishedAt: true,
          creator: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
        },
      });
      results.posts = sanitizeForPublic(
        posts.map((p) => ({ ...p, bodyPreview: p.body.slice(0, 200), body: undefined }))
      );
    }

    if (type === "all" || type === "threads") {
      const threads = await prisma.thread.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { body: { contains: q, mode: "insensitive" } },
          ],
        },
        take: limit,
        select: {
          id: true,
          forumId: true,
          title: true,
          viewCount: true,
          replyCount: true,
          lastActivityAt: true,
          createdAt: true,
          author: {
            select: { id: true, username: true, displayName: true, avatarUrl: true },
          },
        },
      });
      results.threads = threads;
    }

    return success({ query: q, results });
  });
}
