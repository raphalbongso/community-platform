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
      action: "VIEW_FINANCIAL_DATA",
      resourceType: "dashboard",
      resourceId: "overview",
      ipAddress: getClientIp(request),
    });

    const [initiatives, totalEarned, supporters, recentPurchases] = await Promise.all([
      prisma.initiative.findMany({
        where: { creatorId: auth.userId },
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          createdAt: true,
          _count: { select: { purchases: true, entitlements: true } },
        },
      }),
      prisma.purchase.aggregate({
        where: { initiative: { creatorId: auth.userId }, status: "completed" },
        _sum: { netCents: true },
      }),
      prisma.entitlement.findMany({
        where: { initiative: { creatorId: auth.userId } },
        distinct: ["userId"],
        select: { userId: true },
      }),
      prisma.purchase.findMany({
        where: { initiative: { creatorId: auth.userId }, status: "completed" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          buyer: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          tier: { select: { name: true } },
          initiative: { select: { title: true } },
        },
      }),
    ]);

    return success({
      stats: {
        totalEarnedCents: totalEarned._sum.netCents ?? 0,
        totalSupporters: supporters.length,
        activeInitiatives: initiatives.filter((i) => i.status === "ACTIVE").length,
        totalInitiatives: initiatives.length,
      },
      initiatives: initiatives.map((i) => ({
        ...i,
        purchaseCount: i._count.purchases,
        supporterCount: i._count.entitlements,
        _count: undefined,
      })),
      recentActivity: recentPurchases.map((p) => ({
        id: p.id,
        buyer: p.buyer,
        tierName: p.tier.name,
        initiativeTitle: p.initiative.title,
        amountCents: p.amountCents,
        netCents: p.netCents,
        createdAt: p.createdAt,
      })),
    });
  });
}
