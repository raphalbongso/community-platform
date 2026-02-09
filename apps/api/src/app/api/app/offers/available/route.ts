import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../middleware/auth";
import { sanitizeForPublic } from "../../../../../middleware/sanitizer";
import { applyRateLimit } from "../../../../../middleware/rateLimiter";
import { success, handleRequest } from "../../../../../utils/response";

export async function GET(request: NextRequest) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    await applyRateLimit(request, auth.userId);

    const now = new Date();
    const offers = await prisma.acquisitionOffer.findMany({
      where: {
        status: "ACTIVE",
        startsAt: { lte: now },
        endsAt: { gte: now },
      },
      include: {
        initiative: {
          select: { id: true, title: true, slug: true, coverUrl: true },
        },
        tier: {
          select: { id: true, name: true, perksText: true, badgeName: true },
        },
        creator: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    // Sanitize: strip priceCents, acceptedQty from public view
    const items = sanitizeForPublic(
      offers.map((o) => ({
        id: o.id,
        initiative: o.initiative,
        tier: o.tier,
        creator: o.creator,
        maxQuantity: o.maxQuantity,
        startsAt: o.startsAt,
        endsAt: o.endsAt,
      }))
    );

    return success({ items });
  });
}
