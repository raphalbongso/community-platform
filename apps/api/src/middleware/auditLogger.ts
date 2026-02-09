import type { AuthContext } from "@community/types";
import { prisma } from "@community/database";

export type AuditAction =
  | "VIEW_FINANCIAL_DATA"
  | "EXPORT_DATA"
  | "MODIFY_TIER"
  | "PROCESS_PAYMENT"
  | "CREATE_OFFER"
  | "MODIFY_INITIATIVE"
  | "ACCESS_SUPPORTER_DATA";

interface AuditLogEntry {
  auth: AuthContext;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Log an audit entry for financial or sensitive data access.
 * Runs asynchronously - does not block the request.
 */
export function logAudit(entry: AuditLogEntry): void {
  // Fire-and-forget: don't block request on logging
  prisma.auditLog
    .create({
      data: {
        userId: entry.auth.userId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        metadata: entry.metadata ?? {},
        ipAddress: entry.ipAddress ?? null,
      },
    })
    .catch((err) => {
      console.error("[AuditLogger] Failed to write audit log:", err);
    });
}

/**
 * Helper to extract client IP from a Next.js request.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}
