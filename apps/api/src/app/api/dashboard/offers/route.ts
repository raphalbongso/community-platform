import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../middleware/auth";
import { requireCreator } from "../../../../middleware/rbac";
import { logAudit, getClientIp } from "../../../../middleware/auditLogger";
import { applyRateLimit } from "../../../../middleware/rateLimiter";
import { success, error, handleRequest } from "../../../../utils/response";
import { createOfferSchema } from "@community/validators";

export async function GET(request: NextRequest) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    await applyRateLimit(request, auth.userId);

    const offers = await prisma.acquisitionOffer.findMany({
      where: { creatorId: auth.userId },
      orderBy: { createdAt: "desc" },
      include: {
        initiative: { select: { id: true, title: true, slug: true } },
        tier: { select: { id: true, name: true, priceCents: true } },
        _count: { select: { acceptances: true } },
      },
    });

    return success({
      items: offers.map((o) => ({
        ...o,
        acceptanceCount: o._count.acceptances,
        _count: undefined,
      })),
    });
  });
}

export async function POST(request: NextRequest) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    await applyRateLimit(request, auth.userId);

    const body = await request.json();
    const parsed = createOfferSchema.safeParse(body);

    if (!parsed.success) {
      return error("VALIDATION_ERROR", "Invalid offer data", 400, {
        issues: parsed.error.issues,
      });
    }

    const { initiativeId, tierId, maxQuantity, priceCents, startsAt, endsAt } = parsed.data;

    // Verify ownership
    const initiative = await prisma.initiative.findUnique({
      where: { id: initiativeId },
      select: { creatorId: true },
    });

    if (!initiative || initiative.creatorId !== auth.userId) {
      return error("FORBIDDEN", "You do not own this initiative", 403);
    }

    logAudit({
      auth,
      action: "CREATE_OFFER",
      resourceType: "acquisitionOffer",
      resourceId: initiativeId,
      metadata: { tierId, maxQuantity, priceCents },
      ipAddress: getClientIp(request),
    });

    const offer = await prisma.acquisitionOffer.create({
      data: {
        creatorId: auth.userId,
        initiativeId,
        tierId,
        maxQuantity,
        priceCents,
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
        status: "DRAFT",
      },
    });

    return success(offer, 201);
  });
}
