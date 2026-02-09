import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../middleware/auth";
import { requireCreator } from "../../../../middleware/rbac";
import { logAudit, getClientIp } from "../../../../middleware/auditLogger";
import { applyRateLimit } from "../../../../middleware/rateLimiter";
import { success, handleRequest } from "../../../../utils/response";

export async function GET(request: NextRequest) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    await applyRateLimit(request, auth.userId);

    logAudit({
      auth,
      action: "ACCESS_SUPPORTER_DATA",
      resourceType: "supporters",
      resourceId: auth.userId,
      ipAddress: getClientIp(request),
    });

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
    const search = searchParams.get("search");
    const initiativeId = searchParams.get("initiativeId");

    const where: Record<string, unknown> = {
      initiative: { creatorId: auth.userId },
    };
    if (initiativeId) where.initiativeId = initiativeId;
    if (search) {
      where.user = {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { displayName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const entitlements = await prisma.entitlement.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { grantedAt: "desc" },
      include: {
        user: { select: { id: true, username: true, displayName: true, email: true, avatarUrl: true, createdAt: true } },
        tier: { select: { id: true, name: true, priceCents: true } },
        initiative: { select: { id: true, title: true, slug: true } },
      },
    });

    const hasMore = entitlements.length > limit;
    const items = hasMore ? entitlements.slice(0, limit) : entitlements;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Get total spend per supporter
    const supporterIds = [...new Set(items.map((e) => e.userId))];
    const spendByUser = await prisma.purchase.groupBy({
      by: ["buyerId"],
      where: {
        buyerId: { in: supporterIds },
        initiative: { creatorId: auth.userId },
        status: "completed",
      },
      _sum: { amountCents: true, netCents: true },
      _count: true,
    });

    const spendMap = new Map(
      spendByUser.map((s) => [s.buyerId, {
        totalSpentCents: s._sum.amountCents ?? 0,
        totalNetCents: s._sum.netCents ?? 0,
        purchaseCount: s._count,
      }])
    );

    return success({
      items: items.map((e) => ({
        id: e.id,
        user: e.user,
        tier: e.tier,
        initiative: e.initiative,
        quantityActive: e.quantityActive,
        source: e.source,
        grantedAt: e.grantedAt,
        financials: spendMap.get(e.userId) ?? { totalSpentCents: 0, totalNetCents: 0, purchaseCount: 0 },
      })),
      nextCursor,
      hasMore,
    });
  });
}
