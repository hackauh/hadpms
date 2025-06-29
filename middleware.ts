import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    console.log("Middleware processing:", pathname)

    // Public routes that don't require authentication
    const publicRoutes = ["/login", "/api/auth/login", "/api/webhook"]

    // Check if the current path is a public route
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      console.log("Public route, allowing access")
      return NextResponse.next()
    }

    // Check for session token
    const sessionToken = request.cookies.get("session_token")?.value

    console.log("Session token in middleware:", sessionToken ? "exists" : "missing")

    if (!sessionToken) {
      console.log("No session token found, redirecting to login")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Validate session token directly in middleware
    try {
      console.log("Validating session token...")
      const result = await sql`
        SELECT * FROM user_sessions 
        WHERE session_token = ${sessionToken} 
        AND expires_at > NOW()
      `

      if (!result || result.length === 0) {
        console.log("Invalid or expired session, redirecting to login")
        const response = NextResponse.redirect(new URL("/login", request.url))
        response.cookies.delete("session_token")
        return response
      }

      console.log("Valid session found for:", result[0].email, "- allowing access to:", pathname)
      return NextResponse.next()
    } catch (dbError) {
      console.error("Database error in middleware:", dbError)
      const response = NextResponse.redirect(new URL("/login", request.url))
      response.cookies.delete("session_token")
      return response
    }
  } catch (error) {
    console.error("Middleware error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/webhook (webhook endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api/webhook|_next/static|_next/image|favicon.ico|public).*)",
  ],
}
