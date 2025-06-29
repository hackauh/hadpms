export const dynamic = "force-dynamic"
import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    console.log("=== DEBUG API ===")
    console.log("Request cookies:", request.cookies.getAll())
    console.log("Request headers:", Object.fromEntries(request.headers.entries()))

    // Check all sessions in database
    const sessions = await sql`SELECT * FROM user_sessions ORDER BY created_at DESC LIMIT 5`
    console.log("Recent sessions in database:", sessions)

    // Check for session token
    const sessionToken = request.cookies.get("session_token")?.value
    console.log("Session token from request:", sessionToken)

    if (sessionToken) {
      // Validate session
      const validSession = await sql`
        SELECT * FROM user_sessions 
        WHERE session_token = ${sessionToken} 
        AND expires_at > NOW()
      `
      console.log("Session validation result:", validSession)
    }

    return NextResponse.json({
      cookies: request.cookies.getAll(),
      sessionToken: sessionToken || null,
      allSessions: sessions,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json({ error: "Debug failed" }, { status: 500 })
  }
}
