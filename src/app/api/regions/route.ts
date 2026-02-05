import { query } from "@/lib/db";
import { json } from "@/lib/utils";

export async function GET() {
  try {
    const regions = await query(
      "SELECT id, name, name_th, slug, lat, lng FROM regions WHERE is_active = TRUE ORDER BY sort_order, name"
    );
    return json({ regions });
  } catch (err: any) {
    console.error("Regions error:", err);
    return json({ error: "Internal server error" }, 500);
  }
}
