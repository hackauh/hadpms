import { type NextRequest, NextResponse } from "next/server"
import { getAllParticipants, createParticipant } from "@/lib/db"

export async function GET() {
  try {
    const participants = await getAllParticipants()
    return NextResponse.json(participants || [])
  } catch (error) {
    console.error("API Error - GET participants:", error)
    return NextResponse.json({ error: "Failed to fetch participants", participants: [] }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }

    const participant = await createParticipant(data)

    if (!participant) {
      return NextResponse.json({ error: "Failed to create participant" }, { status: 500 })
    }

    return NextResponse.json(participant)
  } catch (error) {
    console.error("API Error - POST participant:", error)
    return NextResponse.json({ error: "Failed to create participant" }, { status: 500 })
  }
}
