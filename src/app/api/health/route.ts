import { queryOne } from "@/lib/db";
import { json } from "@/lib/utils";

export async function GET() {
  try {
    await queryOne("SELECT 1 AS ok");
    return json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
    });
  } catch (err: any) {
    return json(
      {
        status: "error",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: err.message,
      },
      500
    );
  }
}
