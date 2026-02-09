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
      resourceType: "sales-ledger",
      resourceId: auth.userId,
      ipAddress: getClientIp(request),
    });

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 100);
    const initiativeId = searchParams.get("initiativeId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = {
      initiative: { creatorId: auth.userId },
      status: "completed",
    };
    if (initiativeId) where.initiativeId = initiativeId;
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const purchases = await prisma.purchase.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
      include: {
        buyer: { select: { id: true, username: true, displayName: true, email: true } },
        tier: { select: { id: true, name: true } },
        initiative: { select: { id: true, title: true, slug: true } },
      },
    });

    const hasMore = purchases.length > limit;
    const items = hasMore ? purchases.slice(0, limit) : purchases;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    // Aggregate totals for the filtered set
    const totals = await prisma.purchase.aggregate({
      where,
      _sum: { amountCents: true, feeCents: true, netCents: true },
      _count: true,
    });

    return success({
      items: items.map((p) => ({
        id: p.id,
        buyer: p.buyer,
        tier: p.tier,
        initiative: p.initiative,
        quantity: p.quantity,
        amountCents: p.amountCents,
        feeCents: p.feeCents,
        netCents: p.netCents,
        provider: p.provider,
        providerRef: p.providerRef,
        status: p.status,
        createdAt: p.createdAt,
      })),
      totals: {
        totalAmountCents: totals._sum.amountCents ?? 0,
        totalFeeCents: totals._sum.feeCents ?? 0,
        totalNetCents: totals._sum.netCents ?? 0,
        count: totals._count,
      },
      nextCursor,
      hasMore,
    });
  });
}
