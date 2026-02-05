import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { requireAuth, getUserOperator } from "@/lib/auth";
import { json, unauthorized, forbidden } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();

    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden("No operator account");

    const routes = await query(
      `SELECT id, title, slug, status, difficulty, distance_km, duration_minutes,
              avg_rating, total_views, cover_url, created_at
       FROM routes
       WHERE operator_id = ?
       ORDER BY created_at DESC`,
      [operator.id]
    );

    return json({ routes });
  } catch (err: any) {
    console.error("Routes mine error:", err);
    return json({ error: "Internal server error" }, 500);
  }
}
