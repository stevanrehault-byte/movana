import { NextRequest } from "next/server";
import { queryOne, query, execute } from "@/lib/db";
import { requireAuth, getUserOperator } from "@/lib/auth";
import { json, error, unauthorized, forbidden, notFound } from "@/lib/utils";

// UUID v4 pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

// GET /api/operators/[idOrSlug]
// If UUID → fetch by ID (internal/dashboard use)
// If slug → fetch public storefront with routes, vehicles, partners, reviews
export async function GET(req: NextRequest, { params }: { params: Promise<{ idOrSlug: string }> }) {
  try {
    const { idOrSlug } = await params;

    if (isUUID(idOrSlug)) {
      // ── By ID (simple fetch) ──
      const operator = await queryOne(
        `SELECT id, name, slug, description, logo_url, cover_url, email, phone, website, city, lat, lng, tier, is_verified
         FROM operators WHERE id = ? AND is_active = TRUE`,
        [idOrSlug]
      );
      if (!operator) return notFound("Operator not found");
      return json({ operator });
    }

    // ── By Slug (public storefront) ──
    const operator = await queryOne(
      `SELECT id, name, slug, description, logo_url, cover_url, email, phone, website, city, lat, lng, tier, is_verified,
        (SELECT COUNT(*) FROM routes r WHERE r.operator_id = operators.id AND r.status = 'published') AS route_count,
        (SELECT COUNT(*) FROM vehicles v WHERE v.operator_id = operators.id AND v.is_active = TRUE) AS vehicle_count
       FROM operators WHERE slug = ? AND is_active = TRUE`,
      [idOrSlug]
    );

    if (!operator) return notFound("Operator not found");

    const opId = (operator as any).id;

    const [routes, vehicles, partners, reviews, pages] = await Promise.all([
      query(
        `SELECT id, title, slug, description, cover_url, difficulty, distance_km, duration_minutes, avg_rating, review_count, bike_type
         FROM routes WHERE operator_id = ? AND status = 'published' ORDER BY avg_rating DESC LIMIT 12`,
        [opId]
      ),
      query(
        `SELECT id, name, slug, vehicle_type, cover_url, short_description, price_full_day, price_week, currency, brand, model, is_featured
         FROM vehicles WHERE operator_id = ? AND is_active = TRUE AND status = 'available' ORDER BY is_featured DESC, sort_order LIMIT 20`,
        [opId]
      ),
      query(
        `SELECT id, name, slug, description, category, logo_url, discount_description, discount_percent
         FROM partners WHERE operator_id = ? AND is_active = TRUE ORDER BY sort_order LIMIT 20`,
        [opId]
      ),
      query(
        `SELECT rr.*, r.title AS route_title FROM route_reviews rr
         JOIN routes r ON r.id = rr.route_id
         WHERE r.operator_id = ? AND rr.is_published = TRUE
         ORDER BY rr.created_at DESC LIMIT 10`,
        [opId]
      ),
      query(
        `SELECT id, page_type, title, slug FROM operator_pages
         WHERE operator_id = ? AND is_published = TRUE ORDER BY sort_order`,
        [opId]
      ),
    ]);

    return json({ operator, routes, vehicles, partners, reviews, pages });
  } catch (err: any) {
    console.error("Operator GET error:", err);
    return error("Internal server error", 500);
  }
}

// PUT /api/operators/[idOrSlug] — update operator (auth required)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ idOrSlug: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();

    const { idOrSlug } = await params;

    const myOperator = await getUserOperator(auth.sub);
    if (!myOperator || myOperator.id !== idOrSlug) {
      return forbidden("Not your operator");
    }

    const body = await req.json();
    const { name, description, email, phone, website, city, logoUrl, coverUrl } = body;

    await execute(
      `UPDATE operators SET 
        name = COALESCE(?, name),
        description = ?,
        email = ?,
        phone = ?,
        website = ?,
        city = ?,
        logo_url = ?,
        cover_url = ?
       WHERE id = ?`,
      [name, description || null, email || null, phone || null, website || null, city || null, logoUrl || null, coverUrl || null, idOrSlug]
    );

    return json({ ok: true });
  } catch (err: any) {
    console.error("Operator PUT error:", err);
    return error("Internal server error", 500);
  }
}
