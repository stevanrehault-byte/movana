import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { query, queryOne, execute } from "@/lib/db";
import { signAccessToken, signRefreshToken } from "@/lib/auth";
import { json, error, slugify, uuid } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, firstName, lastName, operatorName } = body;

    // Validate
    if (!email || !password || !firstName) {
      return error("Email, password, and first name are required");
    }

    if (password.length < 8) {
      return error("Password must be at least 8 characters");
    }

    // Check if email exists
    const existing = await queryOne(
      "SELECT id FROM users WHERE email = ?",
      [email.toLowerCase()]
    );

    if (existing) {
      return error("Email already registered", 409);
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user
    const userId = uuid();
    await execute(
      `INSERT INTO users (id, email, password_hash, first_name, last_name, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, email.toLowerCase(), passwordHash, firstName, lastName || null, operatorName ? "owner" : "user"]
    );

    // If operator name provided, create operator
    let operatorId: string | undefined;
    if (operatorName) {
      operatorId = uuid();
      let slug = slugify(operatorName);

      // Ensure unique slug
      const slugExists = await queryOne(
        "SELECT id FROM operators WHERE slug = ?",
        [slug]
      );
      if (slugExists) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      await execute(
        `INSERT INTO operators (id, owner_id, name, slug, email, tier)
         VALUES (?, ?, ?, ?, ?, 'free')`,
        [operatorId, userId, operatorName, slug, email.toLowerCase()]
      );

      // Add as team member (owner)
      await execute(
        `INSERT INTO team_members (id, operator_id, user_id, role)
         VALUES (?, ?, ?, 'owner')`,
        [uuid(), operatorId, userId]
      );
    }

    // Generate tokens
    const accessToken = await signAccessToken({
      sub: userId,
      email: email.toLowerCase(),
      role: operatorName ? "owner" : "user",
      operatorId,
    });

    const refreshToken = await signRefreshToken(userId);

    // Store refresh token
    await execute(
      `INSERT INTO refresh_tokens (id, user_id, token, expires_at)
       VALUES (?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))`,
      [uuid(), userId, refreshToken]
    );

    // Update last login
    await execute("UPDATE users SET last_login_at = NOW() WHERE id = ?", [userId]);

    return json(
      {
        user: {
          id: userId,
          email: email.toLowerCase(),
          firstName,
          lastName,
          role: operatorName ? "owner" : "user",
        },
        operator: operatorId
          ? { id: operatorId, name: operatorName }
          : null,
        accessToken,
        refreshToken,
      },
      201
    );
  } catch (err: any) {
    console.error("Register error:", err);
    return error("Internal server error", 500);
  }
}
