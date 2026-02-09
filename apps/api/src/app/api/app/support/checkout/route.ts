import { type NextRequest } from "next/server";
import Stripe from "stripe";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../middleware/auth";
import { applyRateLimit } from "../../../../../middleware/rateLimiter";
import { success, error, handleRequest } from "../../../../../utils/response";
import { checkoutSchema } from "@community/validators";

let _stripe: Stripe | null = null;
function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-08-27.basil",
    });
  }
  return _stripe;
}

export async function POST(request: NextRequest) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    await applyRateLimit(request, auth.userId);

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return error("VALIDATION_ERROR", "Invalid checkout data", 400, {
        issues: parsed.error.issues,
      });
    }

    const { tierId, quantity } = parsed.data;

    const tier = await prisma.supportTier.findUnique({
      where: { id: tierId },
      include: {
        initiative: {
          select: { id: true, title: true, creatorId: true, status: true },
        },
      },
    });

    if (!tier || !tier.isActive) {
      return error("NOT_FOUND", "Support tier not found or inactive", 404);
    }

    if (tier.initiative.status !== "ACTIVE") {
      return error("BAD_REQUEST", "Initiative is not currently active", 400);
    }

    if (tier.maxQuantity !== null && tier.soldCount + quantity > tier.maxQuantity) {
      return error("BAD_REQUEST", "Not enough availability for this tier", 400);
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${tier.initiative.title} - ${tier.name}`,
              description: tier.perksText,
            },
            unit_amount: tier.priceCents,
          },
          quantity,
        },
      ],
      metadata: {
        userId: auth.userId,
        tierId: tier.id,
        initiativeId: tier.initiative.id,
        quantity: quantity.toString(),
      },
      success_url: `${process.env.COMMUNITY_WEB_URL}/support/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.COMMUNITY_WEB_URL}/support/cancel`,
    });

    return success({ checkoutUrl: session.url }, 201);
  });
}
