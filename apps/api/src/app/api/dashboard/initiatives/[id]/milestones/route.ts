import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../../middleware/auth";
import { requireCreator } from "../../../../../../middleware/rbac";
import { requireInitiativeOwner } from "../../../../../../middleware/ownership";
import { logAudit, getClientIp } from "../../../../../../middleware/auditLogger";
import { applyRateLimit } from "../../../../../../middleware/rateLimiter";
import { success, error, handleRequest } from "../../../../../../utils/response";
import { createMilestoneSchema } from "@community/validators";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id: initiativeId } = await params;
    await requireInitiativeOwner(auth, initiativeId);

    const milestones = await prisma.milestone.findMany({
      where: { initiativeId },
      orderBy: { position: "asc" },
    });

    return success({ items: milestones });
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id: initiativeId } = await params;
    await requireInitiativeOwner(auth, initiativeId);
    await applyRateLimit(request, auth.userId);

    const body = await request.json();
    const parsed = createMilestoneSchema.safeParse(body);

    if (!parsed.success) {
      return error("VALIDATION_ERROR", "Invalid milestone data", 400, {
        issues: parsed.error.issues,
      });
    }

    const maxPosition = await prisma.milestone.aggregate({
      where: { initiativeId },
      _max: { position: true },
    });

    const milestone = await prisma.milestone.create({
      data: {
        initiativeId,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        position: (maxPosition._max.position ?? -1) + 1,
      },
    });

    logAudit({
      auth,
      action: "CREATE_CONTENT",
      resourceType: "milestone",
      resourceId: milestone.id,
      metadata: { initiativeId },
      ipAddress: getClientIp(request),
    });

    return success(milestone, 201);
  });
}
