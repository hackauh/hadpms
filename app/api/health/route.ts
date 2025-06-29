import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    console.log("Health check starting...")

    // Check environment variables
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: !!process.env.DATABASE_URL,
      VERCEL_REGION: process.env.VERCEL_REGION,
    }

    console.log("Environment check:", envCheck)

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          status: "error",
          message: "DATABASE_URL not configured",
          environment: envCheck,
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      )
    }

    // Test database connection
    const sql = neon(process.env.DATABASE_URL)

    console.log("Testing database connection...")
    const dbTest = await sql`SELECT NOW() as current_time, version() as db_version`
    console.log("Database test result:", dbTest[0])

    // Check if tables exist
    console.log("Checking tables...")
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `

    const tableNames = tables.map((t) => t.table_name)
    console.log("Tables found:", tableNames)

    // Check participants table specifically
    let participantCount = 0
    if (tableNames.includes("participants")) {
      const countResult = await sql`SELECT COUNT(*) as count FROM participants`
      participantCount = Number.parseInt(countResult[0].count)
    }

    return NextResponse.json({
      status: "healthy",
      message: "System is operational",
      environment: envCheck,
      database: {
        connected: true,
        version: dbTest[0].db_version,
        current_time: dbTest[0].current_time,
      },
      tables: {
        found: tableNames,
        participants_count: participantCount,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_URL: !!process.env.DATABASE_URL,
          VERCEL_REGION: process.env.VERCEL_REGION,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
