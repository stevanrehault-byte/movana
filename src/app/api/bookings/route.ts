import { NextRequest } from "next/server";
import { query, queryOne, execute } from "@/lib/db";
import { requireAuth, getUserOperator } from "@/lib/auth";
import { json, error, unauthorized, forbidden, uuid } from "@/lib/utils";

// GET /api/bookings — list operator bookings
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();
    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    let sql = `SELECT b.*, v.name AS vehicle_display_name, v.cover_url AS vehicle_cover
               FROM bookings b
               LEFT JOIN vehicles v ON v.id = b.vehicle_id
               WHERE b.operator_id = ?`;
    const params: any[] = [operator.id];

    if (status) { sql += " AND b.status = ?"; params.push(status); }
    if (from) { sql += " AND b.start_date >= ?"; params.push(from); }
    if (to) { sql += " AND b.end_date <= ?"; params.push(to); }

    sql += ` ORDER BY b.created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const bookings = await query(sql, params);

    // Count by status
    const counts = await query(
      `SELECT status, COUNT(*) AS count FROM bookings WHERE operator_id = ? GROUP BY status`,
      [operator.id]
    );

    return json({ bookings, counts });
  } catch (err: any) {
    console.error("Bookings GET error:", err);
    return error("Internal server error", 500);
  }
}

// POST /api/bookings — create booking (public or auth)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      operatorId, vehicleId, quantity, startDate, endDate,
      pickupTime, returnTime, customerName, customerEmail, customerPhone,
      customerNotes, addons, deliveryZoneId, deliveryAddress,
    } = body;

    if (!operatorId || !vehicleId || !startDate || !endDate || !customerName || !customerEmail) {
      return error("Missing required fields");
    }

    // Check vehicle exists and is available
    const vehicle = await queryOne<any>(
      "SELECT * FROM vehicles WHERE id = ? AND operator_id = ? AND is_active = TRUE",
      [vehicleId, operatorId]
    );
    if (!vehicle) return error("Vehicle not found or not available");

    const qty = quantity || 1;

    // Check availability (overlapping bookings)
    const overlapping = await query<any>(
      `SELECT COALESCE(SUM(quantity), 0) AS booked FROM bookings
       WHERE vehicle_id = ? AND status NOT IN ('cancelled','completed','no_show')
       AND start_date <= ? AND end_date >= ?`,
      [vehicleId, endDate, startDate]
    );
    const booked = overlapping[0]?.booked || 0;
    if ((vehicle.stock - booked) < qty) {
      return error("Vehicle not available for selected dates", 409);
    }

    // Calculate pricing
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    let subtotal = 0;
    const priceDay = parseFloat(vehicle.price_full_day) || 0;
    const priceWeek = parseFloat(vehicle.price_week) || 0;
    const priceMonth = parseFloat(vehicle.price_month) || 0;

    if (days >= 30 && priceMonth > 0) {
      const months = Math.floor(days / 30);
      const extraDays = days % 30;
      subtotal = (months * priceMonth) + (extraDays * priceDay);
    } else if (days >= 7 && priceWeek > 0) {
      const weeks = Math.floor(days / 7);
      const extraDays = days % 7;
      subtotal = (weeks * priceWeek) + (extraDays * priceDay);
    } else {
      subtotal = days * priceDay;
    }
    subtotal *= qty;

    const deposit = (parseFloat(vehicle.price_deposit) || 0) * qty;

    // Addon calculation
    let addonsTotal = 0;
    let addonsData = null;
    if (addons && Array.isArray(addons)) {
      const addonItems = [];
      for (const a of addons) {
        const addon = await queryOne<any>("SELECT * FROM addons WHERE id = ? AND operator_id = ?", [a.id, operatorId]);
        if (addon) {
          const addonPrice = parseFloat(addon.price) * (addon.price_type === "per_day" ? days : 1) * (a.quantity || 1);
          addonsTotal += addonPrice;
          addonItems.push({ addon_id: addon.id, name: addon.name, price: addonPrice, quantity: a.quantity || 1 });
        }
      }
      addonsData = JSON.stringify(addonItems);
    }

    // Delivery fee
    let deliveryFee = 0;
    if (deliveryZoneId) {
      const zone = await queryOne<any>("SELECT price FROM delivery_zones WHERE id = ?", [deliveryZoneId]);
      if (zone) deliveryFee = parseFloat(zone.price) || 0;
    }

    const total = subtotal + addonsTotal + deliveryFee + deposit;

    // Generate reference
    const ref = "MVN-" + new Date().toISOString().slice(2, 10).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();

    const bookingId = uuid();
    await execute(
      `INSERT INTO bookings (id, operator_id, reference, vehicle_id, vehicle_name, quantity,
        customer_name, customer_email, customer_phone, customer_notes,
        start_date, end_date, pickup_time, return_time,
        delivery_zone_id, delivery_address,
        subtotal, addons_total, delivery_fee, deposit, total, currency,
        addons_data, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending')`,
      [
        bookingId, operatorId, ref, vehicleId, vehicle.name, qty,
        customerName, customerEmail, customerPhone || null, customerNotes || null,
        startDate, endDate, pickupTime || null, returnTime || null,
        deliveryZoneId || null, deliveryAddress || null,
        subtotal, addonsTotal, deliveryFee, deposit, total, vehicle.currency || "THB",
        addonsData,
      ]
    );

    // Create notification for operator
    const owner = await queryOne<any>("SELECT owner_id FROM operators WHERE id = ?", [operatorId]);
    if (owner) {
      await execute(
        `INSERT INTO notifications (id, user_id, operator_id, type, title, body, entity_type, entity_id)
         VALUES (?, ?, ?, 'booking_new', ?, ?, 'booking', ?)`,
        [uuid(), owner.owner_id, operatorId, `New booking ${ref}`, `${customerName} booked ${vehicle.name} (${startDate} → ${endDate})`, bookingId]
      );
    }

    return json({ id: bookingId, reference: ref, total, currency: vehicle.currency || "THB" }, 201);
  } catch (err: any) {
    console.error("Bookings POST error:", err);
    return error("Internal server error", 500);
  }
}
