import { NextRequest } from "next/server";
import { queryOne, execute } from "@/lib/db";
import { requireAuth, getUserOperator } from "@/lib/auth";
import { json, error, unauthorized, forbidden, notFound, uuid } from "@/lib/utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();
    const { id } = await params;
    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden();

    const booking = await queryOne(
      `SELECT b.*, v.name AS vehicle_display_name, v.cover_url AS vehicle_cover
       FROM bookings b LEFT JOIN vehicles v ON v.id = b.vehicle_id
       WHERE b.id = ? AND b.operator_id = ?`,
      [id, operator.id]
    );
    if (!booking) return notFound("Booking not found");
    return json({ booking });
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

    const booking = await queryOne<any>("SELECT * FROM bookings WHERE id = ? AND operator_id = ?", [id, operator.id]);
    if (!booking) return notFound();

    const body = await req.json();

    // Status change
    if (body.status) {
      await execute("UPDATE bookings SET status = ? WHERE id = ?", [body.status, id]);

      if (body.status === "cancelled") {
        await execute("UPDATE bookings SET cancelled_at = NOW(), cancellation_reason = ? WHERE id = ?", [body.cancellationReason || null, id]);
      }

      // Create notification
      await execute(
        `INSERT INTO notifications (id, user_id, operator_id, type, title, body, entity_type, entity_id)
         VALUES (?, ?, ?, ?, ?, ?, 'booking', ?)`,
        [
          uuid(), booking.customer_id || null, operator.id,
          body.status === "confirmed" ? "booking_confirmed" : body.status === "cancelled" ? "booking_cancelled" : "system",
          `Booking ${booking.reference} ${body.status}`,
          `Your booking has been ${body.status}`, id,
        ]
      );
    }

    // Payment update
    if (body.paymentStatus) {
      await execute("UPDATE bookings SET payment_status = ?, amount_paid = COALESCE(?, amount_paid), payment_method = COALESCE(?, payment_method) WHERE id = ?",
        [body.paymentStatus, body.amountPaid, body.paymentMethod, id]);
    }

    // Admin notes
    if (body.adminNotes !== undefined) {
      await execute("UPDATE bookings SET admin_notes = ? WHERE id = ?", [body.adminNotes, id]);
    }

    return json({ ok: true });
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
