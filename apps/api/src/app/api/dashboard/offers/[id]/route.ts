import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../middleware/auth";
import { requireCreator } from "../../../../../middleware/rbac";
import { requireOfferOwner } from "../../../../../middleware/ownership";
import { success, error, handleRequest } from "../../../../../utils/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id } = await params;
    await requireOfferOwner(auth, id);

    const offer = await prisma.acquisitionOffer.findUnique({
      where: { id },
      include: {
        initiative: { select: { id: true, title: true, slug: true } },
        tier: { select: { id: true, name: true, priceCents: true } },
        acceptances: {
          orderBy: { createdAt: "desc" },
          include: {
            accepter: { select: { id: true, username: true, displayName: true, email: true } },
          },
        },
      },
    });

    return success(offer);
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
    await requireOfferOwner(auth, id);

    const body = await request.json();
    const allowedFields = ["status", "maxQuantity", "startsAt", "endsAt"];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = field.endsWith("At") ? new Date(body[field]) : body[field];
      }
    }

    const offer = await prisma.acquisitionOffer.update({
      where: { id },
      data: updates,
    });

    return success(offer);
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
    await requireOfferOwner(auth, id);

    await prisma.acquisitionOffer.delete({ where: { id } });
    return success({ deleted: true });
  });
}
