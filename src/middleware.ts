import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "ifake_session";

async function signToken(secret: string): Promise<string> {
  const data = new TextEncoder().encode(`ifake:${secret}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/editor")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const authSecret =
      process.env.AUTH_SECRET ?? "dev-secret-change-in-production";
    const expected = await signToken(authSecret);

    if (!token || token !== expected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/editor/:path*"],
};
