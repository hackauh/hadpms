import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check Fillout integration status
    const filloutStatus = {
      connected: true, // Webhook endpoint is always available
      lastTested: null,
    }

    // Check Loops integration status
    const loopsStatus = {
      connected: !!process.env.LOOPS_API_KEY,
      lastTested: null,
    }

    return NextResponse.json({
      fillout: filloutStatus,
      loops: loopsStatus,
      database: {
        connected: !!process.env.DATABASE_URL,
        provider: "neon",
      },
    })
  } catch (error) {
    console.error("Error checking integration status:", error)
    return NextResponse.json({ error: "Failed to check integration status" }, { status: 500 })
  }
}
