import type { AuthContext, Permission } from "@community/types";

/**
 * Check if the auth context has ALL required permissions.
 */
export function hasPermissions(
  auth: AuthContext,
  required: Permission[]
): boolean {
  // Admin has all permissions
  if (auth.permissions.includes("admin:all")) return true;
  return required.every((p) => auth.permissions.includes(p));
}

/**
 * Check if the auth context has at least one of the given permissions.
 */
export function hasAnyPermission(
  auth: AuthContext,
  required: Permission[]
): boolean {
  if (auth.permissions.includes("admin:all")) return true;
  return required.some((p) => auth.permissions.includes(p));
}

/**
 * Require specific permissions - throws a Response if not authorized.
 */
export function requirePermissions(
  auth: AuthContext,
  required: Permission[]
): void {
  if (!hasPermissions(auth, required)) {
    throw new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions",
          details: { required, have: auth.permissions },
        },
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Require the user to be a creator.
 */
export function requireCreator(auth: AuthContext): void {
  if (auth.role !== "CREATOR" && auth.role !== "ADMIN") {
    throw new Response(
      JSON.stringify({
        success: false,
        error: { code: "FORBIDDEN", message: "Creator access required" },
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
}
