import { NextRequest } from "next/server";
import { compare } from "bcryptjs";
import { queryOne, execute } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { json, error, uuid } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return error("Email and password are required");
    }

    // Find user
    const user = await queryOne<{
      id: string;
      email: string;
      password_hash: string;
      first_name: string;
      last_name: string;
      role: string;
      is_active: boolean;
    }>(
      "SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (!user) {
      return error("Invalid email or password", 401);
    }

    if (!user.is_active) {
      return error("Account is deactivated", 403);
    }

    // Verify password
    const valid = await compare(password, user.password_hash);
    if (!valid) {
      return error("Invalid email or password", 401);
    }

    // Get operator if owner
    let operator = null;
    if (["owner", "operator_admin", "operator_manager", "operator_staff"].includes(user.role)) {
      operator = await queryOne<{ id: string; name: string; slug: string; tier: string }>(
        `SELECT o.id, o.name, o.slug, o.tier 
         FROM operators o 
         JOIN team_members tm ON tm.operator_id = o.id 
         WHERE tm.user_id = ? AND o.is_active = TRUE 
         LIMIT 1`,
        [user.id]
      );
    }

    // Generate tokens
    const accessToken = await signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      operatorId: operator?.id,
    });

    const refreshToken = await signRefreshToken(user.id);

    // Store refresh token (revoke old ones)
    await execute("UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL", [user.id]);
    await execute(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
      [uuid(), user.id, refreshToken]
    );

    // Update last login
    await execute("UPDATE users SET last_login_at = NOW() WHERE id = ?", [user.id]);

    return json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      operator,
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return error("Internal server error", 500);
  }
}
