import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { queryOne } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "movana-secret-change-in-production-2026"
);

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "30d";

export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: string;
  operatorId?: string;
}

// Generate access token (short-lived)
export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

// Generate refresh token (long-lived)
export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

// Verify any token
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// Extract user from request (Authorization header or cookie)
export async function getAuthUser(
  req: NextRequest
): Promise<JWTPayload | null> {
  // Try Authorization header first
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return verifyToken(token);
  }

  // Try cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (token) {
    return verifyToken(token);
  }

  return null;
}

// Middleware helper: require auth
export async function requireAuth(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return null;
  }
  return user;
}

// Middleware helper: require specific role
export async function requireRole(req: NextRequest, roles: string[]) {
  const user = await requireAuth(req);
  if (!user || !roles.includes(user.role)) {
    return null;
  }
  return user;
}

// Get operator for authenticated user
export async function getUserOperator(userId: string) {
  return queryOne<{ id: string; tier: string; slug: string; name: string }>(
    "SELECT id, tier, slug, name FROM operators WHERE owner_id = ? AND is_active = TRUE LIMIT 1",
    [userId]
  );
}
