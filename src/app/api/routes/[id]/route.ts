import { NextRequest } from "next/server";
import { queryOne, execute, query } from "@/lib/db";
import { requireAuth, getUserOperator } from "@/lib/auth";
import { json, error, unauthorized, forbidden, notFound } from "@/lib/utils";

// GET /api/routes/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const route = await queryOne(
      `SELECT r.*, 
        o.name AS operator_name, o.slug AS operator_slug,
        reg.name AS region_name
       FROM routes r
       JOIN operators o ON o.id = r.operator_id
       LEFT JOIN regions reg ON reg.id = r.region_id
       WHERE r.id = ?`,
      [id]
    );

    if (!route) return notFound("Route not found");

    // Get POIs
    const pois = await query(
      "SELECT * FROM route_pois WHERE route_id = ? ORDER BY sort_order",
      [id]
    );

    return json({ route, pois });
  } catch (err: any) {
    console.error("Route GET error:", err);
    return error("Internal server error", 500);
  }
}

// PUT /api/routes/[id]
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();

    const { id } = await params;
    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden("No operator account");

    // Verify ownership
    const route = await queryOne("SELECT operator_id FROM routes WHERE id = ?", [id]);
    if (!route) return notFound("Route not found");
    if ((route as any).operator_id !== operator.id) return forbidden("Not your route");

    const body = await req.json();
    const {
      title, description, difficulty, bikeType, regionId, coverUrl,
      geojson, startLat, startLng, endLat, endLng,
      distanceKm, durationMinutes, elevationGain, status,
    } = body;

    await execute(
      `UPDATE routes SET
        title = COALESCE(?, title),
        description = ?,
        difficulty = COALESCE(?, difficulty),
        bike_type = COALESCE(?, bike_type),
        region_id = ?,
        cover_url = ?,
        geojson = COALESCE(?, geojson),
        start_lat = COALESCE(?, start_lat),
        start_lng = COALESCE(?, start_lng),
        end_lat = COALESCE(?, end_lat),
        end_lng = COALESCE(?, end_lng),
        distance_km = COALESCE(?, distance_km),
        duration_minutes = COALESCE(?, duration_minutes),
        elevation_gain = COALESCE(?, elevation_gain),
        status = COALESCE(?, status),
        published_at = CASE WHEN ? = 'published' AND published_at IS NULL THEN NOW() ELSE published_at END
       WHERE id = ?`,
      [
        title, description || null, difficulty, bikeType, regionId || null, coverUrl || null,
        geojson, startLat, startLng, endLat, endLng,
        distanceKm, durationMinutes, elevationGain, status, status,
        id,
      ]
    );

    return json({ ok: true });
  } catch (err: any) {
    console.error("Route PUT error:", err);
    return error("Internal server error", 500);
  }
}

// DELETE /api/routes/[id]
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();

    const { id } = await params;
    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden("No operator account");

    const route = await queryOne("SELECT operator_id FROM routes WHERE id = ?", [id]);
    if (!route) return notFound("Route not found");
    if ((route as any).operator_id !== operator.id) return forbidden("Not your route");

    await execute("DELETE FROM routes WHERE id = ?", [id]);

    return json({ ok: true });
  } catch (err: any) {
    console.error("Route DELETE error:", err);
    return error("Internal server error", 500);
  }
}
