import { NextRequest } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth, getUserOperator } from "@/lib/auth";
import { json, error, unauthorized, forbidden, slugify, uuid } from "@/lib/utils";

// GET /api/vehicles — list operator vehicles (auth) or public by operator slug
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const operatorSlug = searchParams.get("operator");

    if (operatorSlug) {
      // Public: list vehicles for an operator
      const vehicles = await query(
        `SELECT v.id, v.name, v.slug, v.vehicle_type, v.short_description, v.cover_url,
                v.price_half_day, v.price_full_day, v.price_week, v.price_month,
                v.currency, v.brand, v.model, v.battery_wh, v.range_km, v.max_weight_kg,
                v.is_featured
         FROM vehicles v
         JOIN operators o ON o.id = v.operator_id
         WHERE o.slug = ? AND v.is_active = TRUE AND v.status = 'available'
         ORDER BY v.is_featured DESC, v.sort_order, v.name`,
        [operatorSlug]
      );
      return json({ vehicles });
    }

    // Auth: list own vehicles
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();
    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden("No operator account");

    const vehicles = await query(
      `SELECT * FROM vehicles WHERE operator_id = ? ORDER BY sort_order, name`,
      [operator.id]
    );
    return json({ vehicles });
  } catch (err: any) {
    console.error("Vehicles GET error:", err);
    return error("Internal server error", 500);
  }
}

// POST /api/vehicles — create vehicle
export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();
    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden("No operator account");
    if (!["experience", "operator"].includes(operator.tier)) {
      return forbidden("Operator tier required for fleet management");
    }

    const body = await req.json();
    const id = uuid();
    const slug = slugify(body.name || "vehicle") + "-" + Date.now().toString(36);

    await execute(
      `INSERT INTO vehicles (id, operator_id, name, slug, sku, brand, model, year, color,
        vehicle_type, description, short_description, stock, status, vehicle_condition,
        price_half_day, price_full_day, price_week, price_month, price_deposit, currency,
        battery_wh, range_km, max_weight_kg, wheel_size, frame_size,
        cover_url, gallery, sort_order, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'excellent',
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, operator.id, body.name, slug, body.sku || null, body.brand || null,
        body.model || null, body.year || null, body.color || null,
        body.vehicleType || "ebike", body.description || null, body.shortDescription || null,
        body.stock || 1,
        body.priceHalfDay || null, body.priceFullDay || null, body.priceWeek || null,
        body.priceMonth || null, body.priceDeposit || null, body.currency || "THB",
        body.batteryWh || null, body.rangeKm || null, body.maxWeightKg || 120,
        body.wheelSize || null, body.frameSize || null,
        body.coverUrl || null, body.gallery ? JSON.stringify(body.gallery) : null,
        body.sortOrder || 0, body.isFeatured || false,
      ]
    );

    return json({ id, slug }, 201);
  } catch (err: any) {
    console.error("Vehicles POST error:", err);
    return error("Internal server error", 500);
  }
}
