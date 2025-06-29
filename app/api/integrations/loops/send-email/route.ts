import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { participantIds, subject, body, apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "Loops API key is required" }, { status: 400 })
    }

    if (!subject || !body) {
      return NextResponse.json({ error: "Subject and body are required" }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const sql = neon(process.env.DATABASE_URL)

    // Get participants to email
    const participants = await sql`
      SELECT id, name, email, nationality, city, checked_in, food_fulfilled
      FROM participants
      WHERE id = ANY(${participantIds}) AND email IS NOT NULL AND email != ''
    `

    let sent = 0
    let errors = 0
    const results = []

    // Send email to each participant
    for (const participant of participants) {
      try {
        const firstName = participant.name.split(" ")[0]
        const lastName = participant.name.split(" ").slice(1).join(" ")

        // Replace template variables in email body
        const personalizedBody = body
          .replace(/\{\{firstName\}\}/g, firstName)
          .replace(/\{\{lastName\}\}/g, lastName)
          .replace(/\{\{name\}\}/g, participant.name)
          .replace(/\{\{email\}\}/g, participant.email)

        // Send transactional email via Loops
        const response = await fetch("https://app.loops.so/api/v1/transactional", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionalId: "hack-abu-dhabi-campaign", // You can create this in Loops dashboard
            email: participant.email,
            dataVariables: {
              firstName,
              lastName,
              name: participant.name,
              subject,
              body: personalizedBody,
              nationality: participant.nationality,
              city: participant.city,
              checkedIn: participant.checked_in,
              foodFulfilled: participant.food_fulfilled,
            },
          }),
        })

        if (response.ok) {
          sent++
          results.push({
            participantId: participant.id,
            email: participant.email,
            status: "sent",
          })
        } else {
          const errorData = await response.text()
          errors++
          results.push({
            participantId: participant.id,
            email: participant.email,
            status: "failed",
            error: errorData,
          })
          console.error(`Failed to send email to ${participant.email}:`, errorData)
        }
      } catch (error) {
        errors++
        results.push({
          participantId: participant.id,
          email: participant.email,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        })
        console.error(`Error sending email to participant ${participant.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      errors,
      total: participants.length,
      message: `Email campaign sent to ${sent} participants`,
      results,
    })
  } catch (error) {
    console.error("Error sending email campaign:", error)
    return NextResponse.json({ error: "Failed to send email campaign" }, { status: 500 })
  }
}
