import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode } from "@/lib/mapbox";

export async function GET(request: NextRequest) {
  const lat = parseFloat(request.nextUrl.searchParams.get("lat") || "");
  const lng = parseFloat(request.nextUrl.searchParams.get("lng") || "");

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: "lat and lng are required" },
      { status: 400 }
    );
  }

  const address = await reverseGeocode(lat, lng);
  return NextResponse.json({ address });
}
