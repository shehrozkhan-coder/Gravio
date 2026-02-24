import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const q = searchParams.get("q");

  try {
    let url = "";

    if (lat && lon) {
      url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`;
    } else if (q) {
      url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1&accept-language=en`;
    } else {
      return NextResponse.json({ error: "Invalid params" }, { status: 400 });
    }

    const res = await fetch(url, {
      headers: {
        "User-Agent": "SnapCart/1.0 (your@email.com)",
      },
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Geocoding failed" }, { status: 500 });
  }
}