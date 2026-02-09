import type { AuthContext } from "@community/types";
import { prisma } from "@community/database";

/**
 * Verify the authenticated user owns a specific initiative.
 */
export async function requireInitiativeOwner(
  auth: AuthContext,
  initiativeId: string
): Promise<void> {
  if (auth.role === "ADMIN") return;

  const initiative = await prisma.initiative.findUnique({
    where: { id: initiativeId },
    select: { creatorId: true },
  });

  if (!initiative) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: { code: "NOT_FOUND", message: "Initiative not found" },
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  if (initiative.creatorId !== auth.userId) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: { code: "FORBIDDEN", message: "You do not own this initiative" },
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Verify the authenticated user owns a specific post.
 */
export async function requirePostOwner(
  auth: AuthContext,
  postId: string
): Promise<void> {
  if (auth.role === "ADMIN") return;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { creatorId: true },
  });

  if (!post) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: { code: "NOT_FOUND", message: "Post not found" },
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  if (post.creatorId !== auth.userId) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: { code: "FORBIDDEN", message: "You do not own this post" },
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Verify the authenticated user owns a specific offer.
 */
export async function requireOfferOwner(
  auth: AuthContext,
  offerId: string
): Promise<void> {
  if (auth.role === "ADMIN") return;

  const offer = await prisma.acquisitionOffer.findUnique({
    where: { id: offerId },
    select: { creatorId: true },
  });

  if (!offer) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: { code: "NOT_FOUND", message: "Offer not found" },
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  if (offer.creatorId !== auth.userId) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: { code: "FORBIDDEN", message: "You do not own this offer" },
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Verify the creator profile belongs to the authenticated user.
 */
export async function requireCreatorProfileOwner(
  auth: AuthContext
): Promise<void> {
  if (auth.role === "ADMIN") return;

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: auth.userId },
  });

  if (!profile) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: { code: "NOT_FOUND", message: "Creator profile not found" },
      }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }
}
