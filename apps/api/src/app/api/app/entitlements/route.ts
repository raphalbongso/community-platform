import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../middleware/auth";
import { applyRateLimit } from "../../../../middleware/rateLimiter";
import { success, handleRequest } from "../../../../utils/response";

export async function GET(request: NextRequest) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    await applyRateLimit(request, auth.userId);

    const entitlements = await prisma.entitlement.findMany({
      where: { userId: auth.userId },
      include: {
        initiative: {
          select: {
            id: true,
            title: true,
            slug: true,
            coverUrl: true,
            status: true,
            creator: {
              select: { id: true, username: true, displayName: true, avatarUrl: true },
            },
          },
        },
        tier: {
          select: {
            id: true,
            name: true,
            perksText: true,
            badgeName: true,
            badgeUrl: true,
          },
        },
      },
    });

    // Return entitlements WITHOUT any financial data
    const items = entitlements.map((e) => ({
      id: e.id,
      initiative: e.initiative,
      tier: e.tier,
      quantityActive: e.quantityActive,
      grantedAt: e.grantedAt,
    }));

    return success({ items });
  });
}
