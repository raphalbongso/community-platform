import { NextResponse } from "next/server";
import type { ApiResponse } from "@community/types";
import { randomUUID } from "crypto";

export function success<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, data, requestId: randomUUID() },
    { status }
  );
}

export function error(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, unknown>
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, ...(details ? { details } : {}) },
      requestId: randomUUID(),
    },
    { status }
  );
}

/**
 * Wrap an API handler to catch thrown Response objects from middleware.
 */
export async function handleRequest(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (thrown) {
    if (thrown instanceof Response) {
      const body = await thrown.json();
      return NextResponse.json(body, {
        status: thrown.status,
        headers: Object.fromEntries(thrown.headers.entries()),
      });
    }
    console.error("[API] Unhandled error:", thrown);
    return error("INTERNAL_ERROR", "An unexpected error occurred", 500);
  }
}
