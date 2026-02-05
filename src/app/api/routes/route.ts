import { NextRequest } from "next/server";
import { query, execute, queryOne } from "@/lib/db";
import { requireAuth, getUserOperator } from "@/lib/auth";
import { json, error, unauthorized, forbidden, slugify, uuid } from "@/lib/utils";

// GET /api/routes — public: list published routes
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const difficulty = searchParams.get("difficulty");
    const theme = searchParams.get("theme");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    let sql = `
      SELECT 
        r.id, r.title, r.slug, r.description, r.cover_url,
        r.difficulty, r.distance_km, r.duration_minutes, r.elevation_gain,
        r.bike_type, r.avg_rating, r.review_count, r.total_rides,
        r.start_lat, r.start_lng, r.tags,
        r.created_at,
        o.name AS operator_name, o.slug AS operator_slug, o.logo_url AS operator_logo,
        reg.name AS region_name, reg.slug AS region_slug
      FROM routes r
      JOIN operators o ON o.id = r.operator_id
      LEFT JOIN regions reg ON reg.id = r.region_id
      WHERE r.status = 'published'
    `;

    const params: any[] = [];

    if (region) {
      sql += " AND reg.slug = ?";
      params.push(region);
    }

    if (difficulty) {
      sql += " AND r.difficulty = ?";
      params.push(difficulty);
    }

    if (theme) {
      sql += ` AND r.id IN (
        SELECT rtl.route_id FROM route_theme_links rtl
        JOIN route_themes rt ON rt.id = rtl.theme_id
        WHERE rt.slug = ?
      )`;
      params.push(theme);
    }

    sql += " ORDER BY r.avg_rating DESC, r.total_rides DESC";
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    const routes = await query(sql, params);

    // Get total count
    let countSql = "SELECT COUNT(*) AS total FROM routes r LEFT JOIN regions reg ON reg.id = r.region_id WHERE r.status = 'published'";
    const countParams: any[] = [];

    if (region) {
      countSql += " AND reg.slug = ?";
      countParams.push(region);
    }
    if (difficulty) {
      countSql += " AND r.difficulty = ?";
      countParams.push(difficulty);
    }

    const countResult = await queryOne<{ total: number }>(countSql, countParams);

    return json({
      routes,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset,
      },
    });
  } catch (err: any) {
    console.error("Routes GET error:", err);
    return error("Internal server error", 500);
  }
}

// POST /api/routes — auth: create a new route (T2+)
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();

    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden("No operator account");

    // Check tier (T2+ required)
    if (!["experience", "operator"].includes(operator.tier)) {
      return forbidden("Experience tier or above required to create routes");
    }

    const body = await req.json();
    const { title, description, regionId, difficulty, distanceKm, durationMinutes, elevationGain, bikeType, geojson, startLat, startLng, endLat, endLng, coverUrl, tags } = body;

    if (!title) {
      return error("Title is required");
    }

    const routeId = uuid();
    let slug = slugify(title);

    // Ensure unique slug
    const slugExists = await queryOne("SELECT id FROM routes WHERE slug = ? AND operator_id = ?", [slug, operator.id]);
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    await execute(
      `INSERT INTO routes (
        id, operator_id, title, slug, description, region_id,
        difficulty, distance_km, duration_minutes, elevation_gain,
        bike_type, geojson, start_lat, start_lng, end_lat, end_lng,
        cover_url, tags, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        routeId, operator.id, title, slug, description || null, regionId || null,
        difficulty || "easy", distanceKm || null, durationMinutes || null, elevationGain || null,
        bikeType || "any", geojson || null, startLat || null, startLng || null, endLat || null, endLng || null,
        coverUrl || null, tags ? JSON.stringify(tags) : null,
      ]
    );

    return json({ id: routeId, slug }, 201);
  } catch (err: any) {
    console.error("Routes POST error:", err);
    return error("Internal server error", 500);
  }
}
