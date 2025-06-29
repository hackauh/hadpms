import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { apiKey, testEmail } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Test Loops API connection
    const response = await fetch("https://app.loops.so/api/v1/contacts/create", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testEmail || "test@example.com",
        firstName: "Test",
        lastName: "User",
        userGroup: "test-connection",
      }),
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        success: true,
        message: "Loops connection successful",
        contactId: data.id,
      })
    } else {
      const errorData = await response.text()
      return NextResponse.json({ error: `Loops API error: ${errorData}` }, { status: response.status })
    }
  } catch (error) {
    console.error("Error testing Loops connection:", error)
    return NextResponse.json({ error: "Failed to test Loops connection" }, { status: 500 })
  }
}
