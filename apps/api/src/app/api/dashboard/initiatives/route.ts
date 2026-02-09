import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../middleware/auth";
import { requireCreator } from "../../../../middleware/rbac";
import { logAudit, getClientIp } from "../../../../middleware/auditLogger";
import { applyRateLimit } from "../../../../middleware/rateLimiter";
import { success, error, handleRequest } from "../../../../utils/response";
import { createInitiativeSchema } from "@community/validators";

export async function GET(request: NextRequest) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    await applyRateLimit(request, auth.userId);

    const initiatives = await prisma.initiative.findMany({
      where: { creatorId: auth.userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { purchases: true, entitlements: true, milestones: true, posts: true } },
        supportTiers: {
          select: { id: true, name: true, priceCents: true, soldCount: true, isActive: true },
          orderBy: { position: "asc" },
        },
      },
    });

    const items = initiatives.map((i) => ({
      id: i.id,
      title: i.title,
      slug: i.slug,
      intentText: i.intentText,
      coverUrl: i.coverUrl,
      status: i.status,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt,
      purchaseCount: i._count.purchases,
      supporterCount: i._count.entitlements,
      milestoneCount: i._count.milestones,
      postCount: i._count.posts,
      tiers: i.supportTiers,
    }));

    return success({ items });
  });
}

export async function POST(request: NextRequest) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    await applyRateLimit(request, auth.userId);

    const body = await request.json();
    const parsed = createInitiativeSchema.safeParse(body);

    if (!parsed.success) {
      return error("VALIDATION_ERROR", "Invalid initiative data", 400, {
        issues: parsed.error.issues,
      });
    }

    const { title, slug, intentText, storyText, coverUrl } = parsed.data;

    const existing = await prisma.initiative.findUnique({ where: { slug } });
    if (existing) {
      return error("CONFLICT", "An initiative with this slug already exists", 409);
    }

    const initiative = await prisma.initiative.create({
      data: {
        creatorId: auth.userId,
        title,
        slug,
        intentText,
        storyText: storyText ?? null,
        coverUrl: coverUrl ?? null,
        status: "DRAFT",
      },
    });

    logAudit({
      auth,
      action: "CREATE_INITIATIVE",
      resourceType: "initiative",
      resourceId: initiative.id,
      ipAddress: getClientIp(request),
    });

    return success(initiative, 201);
  });
}
