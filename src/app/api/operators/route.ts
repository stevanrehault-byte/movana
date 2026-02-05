import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { json, error } from "@/lib/utils";

// GET /api/operators — public: list active operators
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region");
    const tier = searchParams.get("tier");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    let sql = `
      SELECT 
        o.id, o.name, o.slug, o.description, o.logo_url, o.cover_url,
        o.city, o.tier, o.is_verified,
        o.lat, o.lng,
        reg.name AS region_name, reg.slug AS region_slug,
        (SELECT COUNT(*) FROM routes r WHERE r.operator_id = o.id AND r.status = 'published') AS route_count
      FROM operators o
      LEFT JOIN regions reg ON reg.id = o.region_id
      WHERE o.is_active = TRUE
    `;

    const params: any[] = [];

    if (region) {
      sql += " AND reg.slug = ?";
      params.push(region);
    }

    if (tier) {
      sql += " AND o.tier = ?";
      params.push(tier);
    }

    sql += " ORDER BY o.is_verified DESC, o.name ASC";
    sql += ` LIMIT ${limit} OFFSET ${offset}`;

    const operators = await query(sql, params);

    return json({ operators });
  } catch (err: any) {
    console.error("Operators GET error:", err);
    return error("Internal server error", 500);
  }
}
