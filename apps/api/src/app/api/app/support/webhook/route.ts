import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@community/database";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: "Missing stripe-signature header" } },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "BAD_REQUEST", message: "Invalid webhook signature" } },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, tierId, initiativeId, quantity } = session.metadata ?? {};

    if (!userId || !tierId || !initiativeId || !quantity) {
      console.error("[Webhook] Missing metadata in checkout session", session.id);
      return NextResponse.json({ received: true });
    }

    const qty = parseInt(quantity, 10);
    const amountCents = session.amount_total ?? 0;
    const feeCents = Math.round(amountCents * 0.029 + 30); // Stripe fee estimate
    const netCents = amountCents - feeCents;

    await prisma.$transaction([
      // Create purchase record
      prisma.purchase.create({
        data: {
          buyerId: userId,
          initiativeId,
          tierId,
          quantity: qty,
          amountCents,
          feeCents,
          netCents,
          provider: "STRIPE",
          providerRef: session.payment_intent as string,
          status: "completed",
        },
      }),
      // Create or update entitlement
      prisma.entitlement.upsert({
        where: {
          userId_initiativeId_tierId: { userId, initiativeId, tierId },
        },
        create: {
          userId,
          initiativeId,
          tierId,
          quantityActive: qty,
          source: "PURCHASE",
        },
        update: {
          quantityActive: { increment: qty },
        },
      }),
      // Increment sold count on tier
      prisma.supportTier.update({
        where: { id: tierId },
        data: { soldCount: { increment: qty } },
      }),
    ]);
  }

  return NextResponse.json({ received: true });
}
