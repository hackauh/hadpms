import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionToken = cookieStore.get("session_token")

    return NextResponse.json({
      message: "Debug API working",
      environment: process.env.NODE_ENV,
      databaseConfigured: !!process.env.DATABASE_URL,
      sessionToken: sessionToken ? "Present" : "Not found",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      {
        error: "Debug API failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
