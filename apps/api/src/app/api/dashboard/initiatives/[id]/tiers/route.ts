import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../../middleware/auth";
import { requireCreator } from "../../../../../../middleware/rbac";
import { requireInitiativeOwner } from "../../../../../../middleware/ownership";
import { logAudit, getClientIp } from "../../../../../../middleware/auditLogger";
import { applyRateLimit } from "../../../../../../middleware/rateLimiter";
import { success, error, handleRequest } from "../../../../../../utils/response";
import { createTierSchema } from "@community/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id: initiativeId } = await params;
    await requireInitiativeOwner(auth, initiativeId);

    const tiers = await prisma.supportTier.findMany({
      where: { initiativeId },
      orderBy: { position: "asc" },
    });

    return success({ items: tiers });
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id: initiativeId } = await params;
    await requireInitiativeOwner(auth, initiativeId);
    await applyRateLimit(request, auth.userId);

    const body = await request.json();
    const parsed = createTierSchema.safeParse(body);

    if (!parsed.success) {
      return error("VALIDATION_ERROR", "Invalid tier data", 400, {
        issues: parsed.error.issues,
      });
    }

    logAudit({
      auth,
      action: "MODIFY_TIER",
      resourceType: "supportTier",
      resourceId: initiativeId,
      metadata: { tierName: parsed.data.name },
      ipAddress: getClientIp(request),
    });

    const maxPosition = await prisma.supportTier.aggregate({
      where: { initiativeId },
      _max: { position: true },
    });

    const tier = await prisma.supportTier.create({
      data: {
        initiativeId,
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        priceCents: parsed.data.priceCents,
        perksText: parsed.data.perksText,
        badgeName: parsed.data.badgeName ?? null,
        maxQuantity: parsed.data.maxQuantity ?? null,
        position: (maxPosition._max.position ?? -1) + 1,
      },
    });

    return success(tier, 201);
  });
}
