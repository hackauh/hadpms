import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import { createLoopsContact } from "@/lib/loops"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    if (!process.env.LOOPS_API_KEY) {
      return NextResponse.json({ error: "Loops API key not configured" }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(process.env.DATABASE_URL)

    // Get all participants
    const participants = await sql`
      SELECT id, name, email, nationality, city, checked_in, food_fulfilled, manually_added, qr_id, loops_contact_id
      FROM participants
      WHERE email IS NOT NULL AND email != ''
    `

    let synced = 0
    let errors = 0

    // Sync each participant to Loops
    for (const participant of participants) {
      if (!participant.loops_contact_id) {
        try {
          const loopsContactId = await createLoopsContact({
            email: participant.email,
            firstName: participant.name.split(" ")[0],
            lastName: participant.name.split(" ").slice(1).join(" "),
            userGroup: "hackathon-participants",
            userId: participant.id.toString(),
            nationality: participant.nationality,
            city: participant.city,
            qrId: participant.qr_id,
            registrationSource: participant.manually_added ? "manual-entry" : "fillout-form",
            checkedIn: participant.checked_in,
            foodFulfilled: participant.food_fulfilled,
          })

          if (loopsContactId) {
            // Update participant with Loops contact ID
            await sql`
              UPDATE participants 
              SET loops_contact_id = ${loopsContactId}
              WHERE id = ${participant.id}
            `
            synced++
          } else {
            errors++
          }
        } catch (error) {
          console.error(`Failed to sync participant ${participant.id}:`, error)
          errors++
        }
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      errors,
      total: participants.length,
      message: `Successfully synced ${synced} participants to Loops`,
    })
  } catch (error) {
    console.error("Error syncing participants to Loops:", error)
    return NextResponse.json({ error: "Failed to sync participants" }, { status: 500 })
  }
}
