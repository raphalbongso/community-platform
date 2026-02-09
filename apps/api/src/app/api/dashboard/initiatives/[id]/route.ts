import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../middleware/auth";
import { requireCreator } from "../../../../../middleware/rbac";
import { requireInitiativeOwner } from "../../../../../middleware/ownership";
import { logAudit, getClientIp } from "../../../../../middleware/auditLogger";
import { applyRateLimit } from "../../../../../middleware/rateLimiter";
import { success, error, handleRequest } from "../../../../../utils/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id } = await params;
    await requireInitiativeOwner(auth, id);
    await applyRateLimit(request, auth.userId);

    logAudit({
      auth,
      action: "VIEW_FINANCIAL_DATA",
      resourceType: "initiative",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    const initiative = await prisma.initiative.findUnique({
      where: { id },
      include: {
        milestones: { orderBy: { position: "asc" } },
        supportTiers: { orderBy: { position: "asc" } },
        _count: { select: { purchases: true, entitlements: true, posts: true } },
      },
    });

    if (!initiative) {
      return error("NOT_FOUND", "Initiative not found", 404);
    }

    const totalRevenue = await prisma.purchase.aggregate({
      where: { initiativeId: id, status: "completed" },
      _sum: { amountCents: true, feeCents: true, netCents: true },
      _count: true,
    });

    return success({
      ...initiative,
      financials: {
        totalAmountCents: totalRevenue._sum.amountCents ?? 0,
        totalFeeCents: totalRevenue._sum.feeCents ?? 0,
        totalNetCents: totalRevenue._sum.netCents ?? 0,
        purchaseCount: totalRevenue._count,
      },
      supporterCount: initiative._count.entitlements,
      postCount: initiative._count.posts,
    });
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id } = await params;
    await requireInitiativeOwner(auth, id);
    await applyRateLimit(request, auth.userId);

    const body = await request.json();
    const allowedFields = ["title", "intentText", "storyText", "coverUrl", "status"];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field];
    }

    if (Object.keys(updates).length === 0) {
      return error("VALIDATION_ERROR", "No valid fields to update", 400);
    }

    logAudit({
      auth,
      action: "MODIFY_INITIATIVE",
      resourceType: "initiative",
      resourceId: id,
      metadata: { updatedFields: Object.keys(updates) },
      ipAddress: getClientIp(request),
    });

    const updated = await prisma.initiative.update({
      where: { id },
      data: updates,
    });

    return success(updated);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id } = await params;
    await requireInitiativeOwner(auth, id);

    logAudit({
      auth,
      action: "MODIFY_INITIATIVE",
      resourceType: "initiative",
      resourceId: id,
      metadata: { action: "delete" },
      ipAddress: getClientIp(request),
    });

    await prisma.initiative.delete({ where: { id } });
    return success({ deleted: true });
  });
}
