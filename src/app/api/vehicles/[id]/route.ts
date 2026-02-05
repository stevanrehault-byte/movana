import { NextRequest } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { requireAuth, getUserOperator } from "@/lib/auth";
import { json, error, unauthorized, forbidden, notFound } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vehicle = await queryOne("SELECT * FROM vehicles WHERE id = ?", [id]);
    if (!vehicle) return notFound("Vehicle not found");
    return json({ vehicle });
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();
    const { id } = await params;
    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden();

    const vehicle = await queryOne<any>("SELECT operator_id FROM vehicles WHERE id = ?", [id]);
    if (!vehicle) return notFound();
    if (vehicle.operator_id !== operator.id) return forbidden("Not your vehicle");

    const b = await req.json();
    await execute(
      `UPDATE vehicles SET
        name = COALESCE(?, name), sku = ?, brand = ?, model = ?, year = ?, color = ?,
        vehicle_type = COALESCE(?, vehicle_type), description = ?, short_description = ?,
        stock = COALESCE(?, stock), status = COALESCE(?, status), vehicle_condition = COALESCE(?, vehicle_condition),
        price_half_day = ?, price_full_day = ?, price_week = ?, price_month = ?, price_deposit = ?,
        battery_wh = ?, range_km = ?, max_weight_kg = ?, wheel_size = ?, frame_size = ?,
        cover_url = ?, gallery = ?, sort_order = COALESCE(?, sort_order), is_featured = COALESCE(?, is_featured)
       WHERE id = ?`,
      [
        b.name, b.sku || null, b.brand || null, b.model || null, b.year || null, b.color || null,
        b.vehicleType, b.description || null, b.shortDescription || null,
        b.stock, b.status, b.condition,
        b.priceHalfDay || null, b.priceFullDay || null, b.priceWeek || null,
        b.priceMonth || null, b.priceDeposit || null,
        b.batteryWh || null, b.rangeKm || null, b.maxWeightKg || null,
        b.wheelSize || null, b.frameSize || null,
        b.coverUrl || null, b.gallery ? JSON.stringify(b.gallery) : null,
        b.sortOrder, b.isFeatured, id,
      ]
    );
    return json({ ok: true });
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();
    const { id } = await params;
    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden();
    const vehicle = await queryOne<any>("SELECT operator_id FROM vehicles WHERE id = ?", [id]);
    if (!vehicle || vehicle.operator_id !== operator.id) return forbidden();
    await execute("DELETE FROM vehicles WHERE id = ?", [id]);
    return json({ ok: true });
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
