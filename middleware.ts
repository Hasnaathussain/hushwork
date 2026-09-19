import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function allowedOrigins(): Set<string> {
  const configured = process.env.MOBILE_APP_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? [];
  const appOrigin = process.env.NEXT_PUBLIC_APP_URL;
  if (appOrigin) configured.push(new URL(appOrigin).origin);
  if (process.env.NODE_ENV !== "production") configured.push("http://localhost:8081", "http://127.0.0.1:8081", "http://localhost:19006", "http://127.0.0.1:19006");
  return new Set(configured);
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/v1/")) return NextResponse.next();

  const origin = request.headers.get("origin");
  const response = request.method === "OPTIONS" ? new NextResponse(null, { status: 204 }) : NextResponse.next();
  if (origin && allowedOrigins().has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Max-Age", "600");
    response.headers.append("Vary", "Origin");
  }
  return response;
}

export const config = { matcher: ["/api/v1/:path*"] };
