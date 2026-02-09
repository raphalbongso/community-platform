import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: { posts: [], nextCursor: null, hasMore: false },
  });
}
