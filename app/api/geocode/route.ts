import { NextRequest, NextResponse } from "next/server";
import { forwardGeocode } from "@/lib/mapbox";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await forwardGeocode(q);
  return NextResponse.json({ results });
}
