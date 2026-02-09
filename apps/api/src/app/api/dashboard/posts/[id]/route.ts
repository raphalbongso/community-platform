import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../middleware/auth";
import { requireCreator } from "../../../../../middleware/rbac";
import { requirePostOwner } from "../../../../../middleware/ownership";
import { success, error, handleRequest } from "../../../../../utils/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleRequest(async () => {
    const auth = await requireAuth(request);
    requireCreator(auth);
    const { id } = await params;
    await requirePostOwner(auth, id);

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        initiative: { select: { id: true, title: true, slug: true } },
        comments: {
          orderBy: { createdAt: "desc" },
          take: 50,
          include: {
            author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          },
        },
      },
    });

    return success(post);
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
    await requirePostOwner(auth, id);

    const body = await request.json();
    const allowedFields = ["title", "body", "mediaUrls", "visibility", "type"];
    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (field in body) updates[field] = body[field];
    }

    const post = await prisma.post.update({
      where: { id },
      data: updates,
    });

    return success(post);
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
    await requirePostOwner(auth, id);

    await prisma.post.delete({ where: { id } });
    return success({ deleted: true });
  });
}
