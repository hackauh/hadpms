import { type NextRequest, NextResponse } from "next/server"
import { verifyCredentials, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("=== LOGIN API START ===")
    console.log("Login attempt for:", email)
    console.log("Request headers:", Object.fromEntries(request.headers.entries()))

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Verify credentials
    console.log("Verifying credentials...")
    const user = await verifyCredentials(email, password)

    if (!user) {
      console.log("Invalid credentials for:", email)
      return NextResponse.json(
        {
          error: "Invalid email or password",
        },
        { status: 401 },
      )
    }

    console.log("Credentials verified, creating session...")

    // Create session
    const sessionToken = await createSession(user.email)
    console.log("Session token created:", sessionToken)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      sessionToken: sessionToken, // Include in response for debugging
      user: {
        email: user.email,
        name: user.name,
      },
    })

    console.log("Setting cookie with token:", sessionToken)

    // Set session cookie with explicit settings
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: false, // Set to false for development
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: "/",
    })

    // Also try setting a test cookie to verify cookie functionality
    response.cookies.set("test_cookie", "test_value", {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    })

    console.log("Cookies set on response")
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))
    console.log("=== LOGIN API END ===")

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "Failed to login",
      },
      { status: 500 },
    )
  }
}
