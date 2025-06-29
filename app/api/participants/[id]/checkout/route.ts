import { type NextRequest, NextResponse } from "next/server"
import { checkOutParticipant } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid participant ID" }, { status: 400 })
    }

    const participant = await checkOutParticipant(id)

    if (!participant) {
      return NextResponse.json({ error: "Failed to check out participant" }, { status: 500 })
    }

    return NextResponse.json(participant)
  } catch (error) {
    console.error("API Error - Check out participant:", error)
    return NextResponse.json({ error: "Failed to check out participant" }, { status: 500 })
  }
}
