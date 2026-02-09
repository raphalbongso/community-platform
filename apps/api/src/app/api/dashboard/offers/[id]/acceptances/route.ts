import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../../middleware/auth";
import { requireCreator } from "../../../../../../middleware/rbac";
import { requireOfferOwner } from "../../../../../../middleware/ownership";
import { logAudit, getClientIp } from "../../../../../../middleware/auditLogger";
import { applyRateLimit } from "../../../../../../middleware/rateLimiter";
import { success, handleRequest } from "../../../../../../utils/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id: offerId } = await params;
    await requireOfferOwner(auth, offerId);
    await applyRateLimit(request, auth.userId);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: Record<string, unknown> = { offerId };
    if (status) where.status = status;

    const acceptances = await prisma.offerAcceptance.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        accepter: {
          select: { id: true, username: true, displayName: true, email: true, avatarUrl: true },
        },
      },
    });

    logAudit({
      auth,
      action: "ACCESS_OFFER_DATA",
      resourceType: "offerAcceptances",
      resourceId: offerId,
      metadata: { count: acceptances.length },
      ipAddress: getClientIp(request),
    });

    return success({ items: acceptances });
  });
}
