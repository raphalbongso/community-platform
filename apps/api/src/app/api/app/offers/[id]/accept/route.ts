import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../../middleware/auth";
import { applyRateLimit } from "../../../../../../middleware/rateLimiter";
import { success, error, handleRequest } from "../../../../../../utils/response";
import { acceptOfferSchema } from "@community/validators";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    await applyRateLimit(request, auth.userId);

    const { id: offerId } = await params;
    const body = await request.json();
    const parsed = acceptOfferSchema.safeParse(body);

    if (!parsed.success) {
      return error("VALIDATION_ERROR", "Invalid acceptance data", 400, {
        issues: parsed.error.issues,
      });
    }

    const { quantity } = parsed.data;

    const offer = await prisma.acquisitionOffer.findUnique({
      where: { id: offerId },
    });

    if (!offer || offer.status !== "ACTIVE") {
      return error("NOT_FOUND", "Offer not found or not active", 404);
    }

    const now = new Date();
    if (now < offer.startsAt || now > offer.endsAt) {
      return error("BAD_REQUEST", "Offer is not within its active period", 400);
    }

    if (offer.acceptedQty + quantity > offer.maxQuantity) {
      return error("BAD_REQUEST", "Not enough availability for this offer", 400);
    }

    const acceptance = await prisma.$transaction(async (tx) => {
      const acc = await tx.offerAcceptance.create({
        data: {
          offerId,
          accepterId: auth.userId,
          quantity,
          status: "PENDING",
        },
      });

      await tx.acquisitionOffer.update({
        where: { id: offerId },
        data: { acceptedQty: { increment: quantity } },
      });

      return acc;
    });

    return success({ acceptanceId: acceptance.id, status: acceptance.status }, 201);
  });
}
