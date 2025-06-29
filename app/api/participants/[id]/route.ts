import { type NextRequest, NextResponse } from "next/server"
import { getParticipantById, updateParticipant, deleteParticipant } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid participant ID" }, { status: 400 })
    }

    const participant = await getParticipantById(id)
    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 })
    }
    return NextResponse.json(participant)
  } catch (error) {
    console.error("API Error - GET participant by ID:", error)
    return NextResponse.json({ error: "Failed to fetch participant" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid participant ID" }, { status: 400 })
    }

    const data = await request.json()
    const participant = await updateParticipant(id, data)

    if (!participant) {
      return NextResponse.json({ error: "Failed to update participant" }, { status: 500 })
    }

    return NextResponse.json(participant)
  } catch (error) {
    console.error("API Error - PUT participant:", error)
    return NextResponse.json({ error: "Failed to update participant" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid participant ID" }, { status: 400 })
    }

    const success = await deleteParticipant(id)

    if (!success) {
      return NextResponse.json({ error: "Failed to delete participant" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Participant deleted successfully" })
  } catch (error) {
    console.error("API Error - DELETE participant:", error)
    return NextResponse.json({ error: "Failed to delete participant" }, { status: 500 })
  }
}
