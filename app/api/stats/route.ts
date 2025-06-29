import { NextResponse } from "next/server"
import { getStats } from "@/lib/db"

export async function GET() {
  try {
    const stats = await getStats()
    return NextResponse.json(
      stats || {
        total: 0,
        checkedIn: 0,
        checkedOut: 0,
        notCheckedIn: 0,
        foodFulfilled: 0,
        manuallyAdded: 0,
        participants: 0,
        organizers: 0,
        volunteers: 0,
        guests: 0,
      },
    )
  } catch (error) {
    console.error("API Error - GET stats:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch stats",
        total: 0,
        checkedIn: 0,
        checkedOut: 0,
        notCheckedIn: 0,
        foodFulfilled: 0,
        manuallyAdded: 0,
        participants: 0,
        organizers: 0,
        volunteers: 0,
        guests: 0,
      },
      { status: 500 },
    )
  }
}
