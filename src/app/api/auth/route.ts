import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "ifake_session";
const MAX_AGE = 60 * 60 * 24 * 7;

async function signToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`ifake:${secret}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const appPassword = process.env.APP_PASSWORD ?? "ifake2024";
  const authSecret =
    process.env.AUTH_SECRET ?? "dev-secret-change-in-production";

  if (password !== appPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await signToken(authSecret);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
