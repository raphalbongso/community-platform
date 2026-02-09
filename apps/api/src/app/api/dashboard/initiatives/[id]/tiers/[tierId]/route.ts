import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../../../middleware/auth";
import { requireCreator } from "../../../../../../../middleware/rbac";
import { requireInitiativeOwner } from "../../../../../../../middleware/ownership";
import { logAudit, getClientIp } from "../../../../../../../middleware/auditLogger";
import { success, error, handleRequest } from "../../../../../../../utils/response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tierId: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id: initiativeId, tierId } = await params;
    await requireInitiativeOwner(auth, initiativeId);

    const body = await request.json();
    const allowedFields = ["name", "description", "priceCents", "perksText", "badgeName", "badgeUrl", "maxQuantity", "isActive", "position"];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field];
    }

    logAudit({
      auth,
      action: "MODIFY_TIER",
      resourceType: "supportTier",
      resourceId: tierId,
      metadata: { updatedFields: Object.keys(updates) },
      ipAddress: getClientIp(request),
    });

    const tier = await prisma.supportTier.update({
      where: { id: tierId, initiativeId },
      data: updates,
    });

    return success(tier);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tierId: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id: initiativeId, tierId } = await params;
    await requireInitiativeOwner(auth, initiativeId);

    logAudit({
      auth,
      action: "MODIFY_TIER",
      resourceType: "supportTier",
      resourceId: tierId,
      metadata: { action: "delete" },
      ipAddress: getClientIp(request),
    });

    await prisma.supportTier.delete({ where: { id: tierId, initiativeId } });
    return success({ deleted: true });
  });
}
