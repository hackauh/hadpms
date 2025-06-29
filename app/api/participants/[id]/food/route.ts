import { type NextRequest, NextResponse } from "next/server"
import { fulfillFood } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid participant ID" }, { status: 400 })
    }

    const participant = await fulfillFood(id)

    if (!participant) {
      return NextResponse.json({ error: "Failed to fulfill food for participant" }, { status: 500 })
    }

    return NextResponse.json(participant)
  } catch (error) {
    console.error("API Error - Fulfill food:", error)
    return NextResponse.json({ error: "Failed to fulfill food for participant" }, { status: 500 })
  }
}
