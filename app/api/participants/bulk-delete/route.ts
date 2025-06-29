import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { participantIds } = await request.json()

    if (!Array.isArray(participantIds) || participantIds.length === 0) {
      return NextResponse.json({ error: "Invalid participant IDs" }, { status: 400 })
    }

    // Validate all IDs are numbers
    const validIds = participantIds.filter((id) => !isNaN(Number(id))).map((id) => Number(id))

    if (validIds.length === 0) {
      return NextResponse.json({ error: "No valid participant IDs provided" }, { status: 400 })
    }

    const result = await sql`
      DELETE FROM participants 
      WHERE id = ANY(${validIds})
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      deletedCount: result.length,
      message: `Successfully deleted ${result.length} participant(s)`,
    })
  } catch (error) {
    console.error("API Error - Bulk delete participants:", error)
    return NextResponse.json({ error: "Failed to delete participants" }, { status: 500 })
  }
}
