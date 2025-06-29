import { type NextRequest, NextResponse } from "next/server"
import { getParticipantByQrId } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { qrId: string } }) {
  try {
    const participant = await getParticipantByQrId(params.qrId)
    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 })
    }
    return NextResponse.json(participant)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch participant" }, { status: 500 })
  }
}
