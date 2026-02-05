import { NextRequest } from "next/server";
import { execute, query } from "@/lib/db";
import { requireAuth, getUserOperator } from "@/lib/auth";
import { json, error, unauthorized, forbidden, uuid } from "@/lib/utils";

// POST /api/routes/[id]/pois - bulk save POIs
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();

    const { id: routeId } = await params;
    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden("No operator account");

    const body = await req.json();
    const { pois } = body;

    if (!Array.isArray(pois)) {
      return error("pois must be an array");
    }

    // Delete existing POIs for this route
    await execute("DELETE FROM route_pois WHERE route_id = ?", [routeId]);

    // Insert new POIs
    for (const poi of pois) {
      await execute(
        `INSERT INTO route_pois (id, route_id, name, name_th, description, description_th, category, lat, lng, photo_url, distance_from_start_km, estimated_duration_min, tips, price_range, opening_hours, sort_order, is_highlight)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuid(),
          routeId,
          poi.name || "Unnamed",
          poi.nameTh || null,
          poi.description || null,
          poi.descriptionTh || null,
          poi.category || "other",
          poi.lat,
          poi.lng,
          poi.photoUrl || null,
          poi.distanceFromStartKm || null,
          poi.estimatedDurationMin || null,
          poi.tips || null,
          poi.priceRange || null,
          poi.openingHours || null,
          poi.sortOrder || 0,
          poi.isHighlight || false,
        ]
      );
    }

    return json({ ok: true, count: pois.length }, 201);
  } catch (err: any) {
    console.error("POIs POST error:", err);
    return error("Internal server error", 500);
  }
}

// GET /api/routes/[id]/pois
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: routeId } = await params;
    const pois = await query(
      "SELECT * FROM route_pois WHERE route_id = ? ORDER BY sort_order",
      [routeId]
    );
    return json({ pois });
  } catch (err: any) {
    console.error("POIs GET error:", err);
    return error("Internal server error", 500);
  }
}
