import { NextRequest } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { json, error, unauthorized } from "@/lib/utils";

// GET /api/notifications
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();

    const { searchParams } = new URL(req.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    let sql = "SELECT * FROM notifications WHERE user_id = ?";
    const params: any[] = [auth.sub];

    if (unreadOnly) { sql += " AND is_read = FALSE"; }
    sql += ` ORDER BY created_at DESC LIMIT ${limit}`;

    const notifications = await query(sql, params);

    // Unread count
    const countResult = await query<any>(
      "SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE",
      [auth.sub]
    );

    return json({ notifications, unreadCount: countResult[0]?.count || 0 });
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

// PUT /api/notifications — mark read
export async function PUT(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();

    const body = await req.json();

    if (body.markAllRead) {
      await execute("UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE user_id = ? AND is_read = FALSE", [auth.sub]);
    } else if (body.ids && Array.isArray(body.ids)) {
      const placeholders = body.ids.map(() => "?").join(",");
      await execute(
        `UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id IN (${placeholders}) AND user_id = ?`,
        [...body.ids, auth.sub]
      );
    }

    return json({ ok: true });
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
