import { NextRequest } from "next/server";
import { query, execute } from "@/lib/db";
import { requireAuth, getUserOperator } from "@/lib/auth";
import { json, error, unauthorized, forbidden, slugify, uuid } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const operatorSlug = searchParams.get("operator");

    if (operatorSlug) {
      const partners = await query(
        `SELECT p.* FROM partners p JOIN operators o ON o.id = p.operator_id
         WHERE o.slug = ? AND p.is_active = TRUE ORDER BY p.sort_order`,
        [operatorSlug]
      );
      return json({ partners });
    }

    const auth = await requireAuth(req);
    if (!auth) return unauthorized();
    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden();

    const partners = await query("SELECT * FROM partners WHERE operator_id = ? ORDER BY sort_order", [operator.id]);
    return json({ partners });
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();
    const operator = await getUserOperator(auth.sub);
    if (!operator) return forbidden();

    const b = await req.json();
    const id = uuid();
    const slug = slugify(b.name || "partner") + "-" + Date.now().toString(36);

    await execute(
      `INSERT INTO partners (id, operator_id, name, slug, description, category, logo_url, cover_url, website, email, phone, address, lat, lng, discount_description, discount_percent, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, operator.id, b.name, slug, b.description || null, b.category || "other", b.logoUrl || null, b.coverUrl || null, b.website || null, b.email || null, b.phone || null, b.address || null, b.lat || null, b.lng || null, b.discountDescription || null, b.discountPercent || null, b.sortOrder || 0]
    );
    return json({ id, slug }, 201);
  } catch (err: any) {
    return error("Internal server error", 500);
  }
}
