import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "gxgold-staking-jwt-secret-key-2026"
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "No token provided" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: "gxgold-staking",
    });

    return NextResponse.json({
      valid: true,
      user: payload.sub,
      exp: payload.exp,
    });
  } catch {
    return NextResponse.json(
      { valid: false, error: "Token expired or invalid" },
      { status: 401 }
    );
  }
}
