import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../middleware/auth";
import { requireCreator } from "../../../../middleware/rbac";
import { logAudit, getClientIp } from "../../../../middleware/auditLogger";
import { applyRateLimit } from "../../../../middleware/rateLimiter";
import { success, error, handleRequest } from "../../../../utils/response";
import { createSnapshotSchema } from "@community/validators";

export async function GET(request: NextRequest) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    await applyRateLimit(request, auth.userId);

    const snapshots = await prisma.snapshot.findMany({
      where: { creatorId: auth.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        initiativeId: true,
        recordCount: true,
        createdAt: true,
        initiative: { select: { title: true, slug: true } },
      },
    });

    return success({ items: snapshots });
  });
}

export async function POST(request: NextRequest) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    await applyRateLimit(request, auth.userId);

    const body = await request.json();
    const parsed = createSnapshotSchema.safeParse(body);

    if (!parsed.success) {
      return error("VALIDATION_ERROR", "Invalid snapshot data", 400, {
        issues: parsed.error.issues,
      });
    }

    const { name, description, initiativeId } = parsed.data;

    // Build snapshot from current entitlements
    const where: Record<string, unknown> = {
      initiative: { creatorId: auth.userId },
    };
    if (initiativeId) where.initiativeId = initiativeId;

    const entitlements = await prisma.entitlement.findMany({
      where,
      include: {
        user: { select: { id: true } },
      },
    });

    logAudit({
      auth,
      action: "EXPORT_DATA",
      resourceType: "snapshot",
      resourceId: "new",
      metadata: { recordCount: entitlements.length, initiativeId },
      ipAddress: getClientIp(request),
    });

    const snapshot = await prisma.snapshot.create({
      data: {
        creatorId: auth.userId,
        initiativeId: initiativeId ?? null,
        name,
        description: description ?? null,
        recordCount: entitlements.length,
        rows: {
          create: entitlements.map((e) => ({
            ownerUserId: e.userId,
            tierId: e.tierId,
            quantity: e.quantityActive,
          })),
        },
      },
    });

    return success(snapshot, 201);
  });
}
