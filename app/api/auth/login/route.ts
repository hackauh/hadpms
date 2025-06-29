import { type NextRequest, NextResponse } from "next/server"
import { verifyCredentials, createSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    console.log("=== LOGIN API START ===")
    console.log("Login attempt for:", email)
    console.log("Environment:", process.env.NODE_ENV)
    console.log("Host:", request.headers.get("host"))

    if (!email || !password) {
      console.log("Missing email or password")
      return NextResponse.json({ error: "Email/ID and password are required" }, { status: 400 })
    }

    // Verify credentials (now supports both email and admin ID)
    console.log("Verifying credentials...")
    const user = await verifyCredentials(email, password)

    if (!user) {
      console.log("Invalid credentials for:", email)
      return NextResponse.json(
        {
          error: "Invalid email/ID or password",
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
      user: {
        email: user.email,
        name: user.name,
      },
    })

    console.log("Setting cookie with token:", sessionToken)

    // Determine if we're in production
    const isProduction = process.env.NODE_ENV === "production"
    const host = request.headers.get("host")
    const isVercel = host?.includes("vercel.app") || host?.includes("hackabudhabi.com")

    // Set session cookie with environment-appropriate settings
    response.cookies.set("session_token", sessionToken, {
      httpOnly: true,
      secure: isProduction, // Use secure cookies in production
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: "/",
      domain: isVercel && isProduction ? undefined : undefined, // Let browser handle domain
    })

    console.log("Cookie settings:", {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: 24 * 60 * 60,
      path: "/",
      isProduction,
      host,
    })

    console.log("=== LOGIN API END ===")
    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        error: "Failed to login",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
