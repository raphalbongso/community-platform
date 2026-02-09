import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../middleware/auth";
import { requireCreator } from "../../../../../middleware/rbac";
import { success, error, handleRequest } from "../../../../../utils/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id } = await params;

    const snapshot = await prisma.snapshot.findUnique({
      where: { id },
      include: {
        initiative: { select: { id: true, title: true, slug: true } },
        rows: {
          include: {
            snapshot: false,
          },
        },
      },
    });

    if (!snapshot || snapshot.creatorId !== auth.userId) {
      return error("NOT_FOUND", "Snapshot not found", 404);
    }

    return success(snapshot);
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

    const snapshot = await prisma.snapshot.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!snapshot || snapshot.creatorId !== auth.userId) {
      return error("NOT_FOUND", "Snapshot not found", 404);
    }

    await prisma.snapshot.delete({ where: { id } });
    return success({ deleted: true });
  });
}
