import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== TEST COOKIE API ===")

    const response = NextResponse.json({
      message: "Test cookie set",
      timestamp: new Date().toISOString(),
    })

    // Set a simple test cookie
    response.cookies.set("test_simple", "simple_value", {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    })

    // Set an httpOnly test cookie
    response.cookies.set("test_httponly", "httponly_value", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60, // 1 hour
      path: "/",
    })

    console.log("Test cookies set")
    return response
  } catch (error) {
    console.error("Test cookie error:", error)
    return NextResponse.json({ error: "Test failed" }, { status: 500 })
  }
}
