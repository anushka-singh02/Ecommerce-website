import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken")
  const isLogin = req.nextUrl.pathname === "/admin/login"

  if (!token && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", req.url))
  }

  if (token && isLogin) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
