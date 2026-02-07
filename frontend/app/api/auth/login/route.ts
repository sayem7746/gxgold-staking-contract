import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

// Credentials loaded from environment variables (.env.local)
const VALID_USERNAME = process.env.AUTH_USER_EMAIL || "";
const VALID_PASSWORD = process.env.AUTH_USER_PASSWORD || "";

// JWT secret key (encoded for jose)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || ""
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate credentials - only one user allowed
    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token with 10-minute expiration
    const token = await new SignJWT({
      sub: VALID_USERNAME,
      role: "admin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("10m")
      .setIssuer("gxgold-staking")
      .sign(JWT_SECRET);

    return NextResponse.json({
      token,
      user: VALID_USERNAME,
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
