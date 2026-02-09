import { createClient } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";
import type { AuthContext, Permission, UserRole } from "@community/types";
import { prisma } from "@community/database";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  FAN: [
    "read:public",
    "read:own_profile",
    "write:own_profile",
    "read:own_entitlements",
    "write:support",
  ],
  CREATOR: [
    "read:public",
    "read:own_profile",
    "write:own_profile",
    "read:own_entitlements",
    "write:support",
    "read:creator_dashboard",
    "write:creator_content",
    "read:financial_data",
    "write:financial_data",
  ],
  ADMIN: ["admin:all"],
};

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Extract and validate auth from a request.
 * Returns null if no valid auth is present.
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthContext | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);

  const {
    data: { user: supabaseUser },
    error,
  } = await getSupabase().auth.getUser(token);

  if (error || !supabaseUser) return null;

  // Look up our own user record
  const user = await prisma.user.findUnique({
    where: { id: supabaseUser.id },
    select: { id: true, role: true },
  });

  if (!user) return null;

  const role = user.role as UserRole;

  return {
    userId: user.id,
    role,
    sessionId: supabaseUser.id,
    permissions: getPermissionsForRole(role),
  };
}

/**
 * Require authentication - returns AuthContext or throws a Response.
 */
export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  const auth = await authenticateRequest(request);
  if (!auth) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
  return auth;
}
