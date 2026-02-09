import { type NextRequest } from "next/server";
import { prisma } from "@community/database";
import { requireAuth } from "../../../../../../middleware/auth";
import { requireCreator } from "../../../../../../middleware/rbac";
import { logAudit, getClientIp } from "../../../../../../middleware/auditLogger";
import { handleRequest } from "../../../../../../utils/response";

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
        rows: true,
      },
    });

    if (!snapshot || snapshot.creatorId !== auth.userId) {
      throw new Response(
        JSON.stringify({ success: false, error: { code: "NOT_FOUND", message: "Snapshot not found" } }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    logAudit({
      auth,
      action: "EXPORT_DATA",
      resourceType: "snapshot",
      resourceId: id,
      ipAddress: getClientIp(request),
    });

    // Build CSV
    const headers = ["Row ID", "User ID", "Wallet", "Tier ID", "Quantity"];
    const csvLines = [
      headers.join(","),
      ...snapshot.rows.map((row) =>
        [row.id, row.ownerUserId ?? "", row.ownerWallet ?? "", row.tierId ?? "", row.quantity].join(",")
      ),
    ];

    const csv = csvLines.join("\n");

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="snapshot-${id}.csv"`,
      },
    }) as unknown as import("next/server").NextResponse;
  });
}
