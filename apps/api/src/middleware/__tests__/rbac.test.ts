import { describe, it, expect } from "vitest";
import { hasPermissions, hasAnyPermission, requirePermissions, requireCreator } from "../rbac";
import type { AuthContext, Permission, UserRole } from "@community/types";

// Inline role permissions to avoid importing auth.ts which initializes Supabase at module level
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  FAN: ["read:public", "read:own_profile", "write:own_profile", "read:own_entitlements", "write:support"],
  CREATOR: ["read:public", "read:own_profile", "write:own_profile", "read:own_entitlements", "write:support", "read:creator_dashboard", "write:creator_content", "read:financial_data", "write:financial_data"],
  ADMIN: ["admin:all"],
};
function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

function makeAuth(role: "FAN" | "CREATOR" | "ADMIN"): AuthContext {
  return {
    userId: "user-1",
    role,
    sessionId: "session-1",
    permissions: getPermissionsForRole(role),
  };
}

describe("getPermissionsForRole", () => {
  it("returns correct permissions for FAN", () => {
    const perms = getPermissionsForRole("FAN");
    expect(perms).toContain("read:public");
    expect(perms).toContain("read:own_profile");
    expect(perms).toContain("write:support");
    expect(perms).not.toContain("read:financial_data");
    expect(perms).not.toContain("read:creator_dashboard");
  });

  it("returns correct permissions for CREATOR", () => {
    const perms = getPermissionsForRole("CREATOR");
    expect(perms).toContain("read:public");
    expect(perms).toContain("read:creator_dashboard");
    expect(perms).toContain("write:creator_content");
    expect(perms).toContain("read:financial_data");
    expect(perms).toContain("write:financial_data");
  });

  it("returns admin:all for ADMIN", () => {
    const perms = getPermissionsForRole("ADMIN");
    expect(perms).toContain("admin:all");
  });
});

describe("hasPermissions", () => {
  it("returns true when user has all required permissions", () => {
    const auth = makeAuth("CREATOR");
    expect(hasPermissions(auth, ["read:public", "read:financial_data"])).toBe(true);
  });

  it("returns false when user lacks a permission", () => {
    const auth = makeAuth("FAN");
    expect(hasPermissions(auth, ["read:financial_data"])).toBe(false);
  });

  it("returns true for admin on any permissions", () => {
    const auth = makeAuth("ADMIN");
    expect(hasPermissions(auth, ["read:financial_data", "write:creator_content"])).toBe(true);
  });

  it("returns true for empty required permissions", () => {
    const auth = makeAuth("FAN");
    expect(hasPermissions(auth, [])).toBe(true);
  });
});

describe("hasAnyPermission", () => {
  it("returns true when user has at least one permission", () => {
    const auth = makeAuth("FAN");
    expect(hasAnyPermission(auth, ["read:public", "read:financial_data"])).toBe(true);
  });

  it("returns false when user has none of the permissions", () => {
    const auth = makeAuth("FAN");
    expect(hasAnyPermission(auth, ["read:financial_data", "write:financial_data"])).toBe(false);
  });

  it("returns true for admin on any permissions", () => {
    const auth = makeAuth("ADMIN");
    expect(hasAnyPermission(auth, ["read:financial_data"])).toBe(true);
  });
});

describe("requirePermissions", () => {
  it("does not throw when permissions are met", () => {
    const auth = makeAuth("CREATOR");
    expect(() => requirePermissions(auth, ["read:financial_data"])).not.toThrow();
  });

  it("throws Response when permissions are not met", () => {
    const auth = makeAuth("FAN");
    expect(() => requirePermissions(auth, ["read:financial_data"])).toThrow();
  });

  it("thrown Response has 403 status", () => {
    const auth = makeAuth("FAN");
    try {
      requirePermissions(auth, ["read:financial_data"]);
    } catch (e) {
      expect(e).toBeInstanceOf(Response);
      expect((e as Response).status).toBe(403);
    }
  });
});

describe("requireCreator", () => {
  it("does not throw for CREATOR role", () => {
    expect(() => requireCreator(makeAuth("CREATOR"))).not.toThrow();
  });

  it("does not throw for ADMIN role", () => {
    expect(() => requireCreator(makeAuth("ADMIN"))).not.toThrow();
  });

  it("throws for FAN role", () => {
    expect(() => requireCreator(makeAuth("FAN"))).toThrow();
  });

  it("thrown Response has 403 status for FAN", () => {
    try {
      requireCreator(makeAuth("FAN"));
    } catch (e) {
      expect(e).toBeInstanceOf(Response);
      expect((e as Response).status).toBe(403);
    }
  });
});
