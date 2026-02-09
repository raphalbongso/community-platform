import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../../../middleware/auth";
import { requireCreator } from "../../../../../../../middleware/rbac";
import { requireInitiativeOwner } from "../../../../../../../middleware/ownership";
import { logAudit, getClientIp } from "../../../../../../../middleware/auditLogger";
import { success, error, handleRequest } from "../../../../../../../utils/response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id: initiativeId, milestoneId } = await params;
    await requireInitiativeOwner(auth, initiativeId);

    const body = await request.json();
    const allowedFields = ["title", "description", "status", "position"];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field];
    }

    if (updates.status === "COMPLETED") {
      updates.completedAt = new Date();
    }

    const milestone = await prisma.milestone.update({
      where: { id: milestoneId, initiativeId },
      data: updates,
    });

    logAudit({
      auth,
      action: "MODIFY_CONTENT",
      resourceType: "milestone",
      resourceId: milestoneId,
      metadata: { initiativeId, fields: Object.keys(updates) },
      ipAddress: getClientIp(request),
    });

    return success(milestone);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; milestoneId: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id: initiativeId, milestoneId } = await params;
    await requireInitiativeOwner(auth, initiativeId);

    await prisma.milestone.delete({
      where: { id: milestoneId, initiativeId },
    });

    logAudit({
      auth,
      action: "DELETE_CONTENT",
      resourceType: "milestone",
      resourceId: milestoneId,
      metadata: { initiativeId },
      ipAddress: getClientIp(request),
    });

    return success({ deleted: true });
  });
}
