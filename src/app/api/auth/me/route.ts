import { NextRequest } from "next/server";
import { requireAuth, getUserOperator } from "@/lib/auth";
import { queryOne } from "@/lib/db";
import { json, unauthorized } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAuth(req);
    if (!auth) return unauthorized();

    const user = await queryOne<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      avatar_url: string;
      role: string;
      language: string;
    }>(
      "SELECT id, email, first_name, last_name, avatar_url, role, language FROM users WHERE id = ?",
      [auth.sub]
    );

    if (!user) return unauthorized("User not found");

    const operator = await getUserOperator(user.id);

    return json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        role: user.role,
        language: user.language,
      },
      operator: operator || null,
    });
  } catch (err: any) {
    console.error("Me error:", err);
    return json({ error: "Internal server error" }, 500);
  }
}
