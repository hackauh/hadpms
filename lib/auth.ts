import { neon } from "@neondatabase/serverless"
import { cookies } from "next/headers"

const sql = neon(process.env.DATABASE_URL!)

export interface AdminUser {
  id: number
  email: string
  name?: string
  created_at: string
}

export interface UserSession {
  id: number
  email: string
  session_token: string
  expires_at: string
  created_at: string
}

// Generate session token
export function generateSessionToken(): string {
  const timestamp = Date.now().toString(36)
  const randomPart1 = Math.random().toString(36).substring(2)
  const randomPart2 = Math.random().toString(36).substring(2)
  return `had_${timestamp}_${randomPart1}_${randomPart2}`
}

// Simple password verification (for the hardcoded credentials)
export async function verifyCredentials(emailOrId: string, password: string): Promise<AdminUser | null> {
  try {
    console.log("Verifying credentials for:", emailOrId)
    console.log("Database URL configured:", !!process.env.DATABASE_URL)

    // Check for admin ID login
    if (emailOrId === "admin" && password === "Had@2025") {
      console.log("✅ Admin ID credentials verified successfully")
      return {
        id: 2,
        email: "admin@hackabudhabi.com",
        name: "Admin User",
        created_at: new Date().toISOString(),
      }
    }

    // Check for team email login
    if (emailOrId === "team@hackabudhabi.com" && password === "Had@2025") {
      console.log("✅ Team email credentials verified successfully")
      return {
        id: 1,
        email: "team@hackabudhabi.com",
        name: "Hack Abu Dhabi Team",
        created_at: new Date().toISOString(),
      }
    }

    console.log("❌ Invalid credentials provided")
    return null
  } catch (error) {
    console.error("Error in verifyCredentials:", error)
    return null
  }
}

// Create user session
export async function createSession(email: string): Promise<string> {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not configured")
    }

    const sessionToken = generateSessionToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    console.log("Creating session...")
    console.log("- Email:", email)
    console.log("- Token:", sessionToken.substring(0, 15) + "...")
    console.log("- Expires:", expiresAt.toISOString())

    // Clean up any existing sessions for this email first
    try {
      const deleteResult = await sql`
        DELETE FROM user_sessions 
        WHERE email = ${email}
        RETURNING *
      `
      console.log("Deleted", deleteResult.length, "existing sessions")
    } catch (deleteError) {
      console.warn("Could not delete existing sessions:", deleteError)
    }

    // Create new session
    const result = await sql`
      INSERT INTO user_sessions (email, session_token, expires_at)
      VALUES (${email}, ${sessionToken}, ${expiresAt})
      RETURNING *
    `

    console.log("✅ Session created successfully")
    return sessionToken
  } catch (error) {
    console.error("❌ Error in createSession:", error)
    throw error
  }
}

// Get session by token
export async function getSessionByToken(token: string): Promise<UserSession | null> {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL not configured")
      return null
    }

    console.log("Looking up session for token:", token.substring(0, 15) + "...")

    const result = await sql`
      SELECT * FROM user_sessions 
      WHERE session_token = ${token} 
      AND expires_at > NOW()
    `

    if (result.length > 0) {
      console.log("✅ Valid session found for:", result[0].email)
      return result[0] as UserSession
    } else {
      console.log("❌ No valid session found for token")
      return null
    }
  } catch (error) {
    console.error("Error in getSessionByToken:", error)
    return null
  }
}

// Get current user from session
export async function getCurrentUser(): Promise<AdminUser | null> {
  try {
    console.log("=== GET CURRENT USER ===")
    console.log("Environment:", process.env.NODE_ENV)
    console.log("Database configured:", !!process.env.DATABASE_URL)

    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("session_token")?.value

    console.log("Session token from cookies:", sessionToken ? sessionToken.substring(0, 15) + "..." : "missing")

    if (!sessionToken) {
      console.log("❌ No session token found in cookies")
      return null
    }

    const session = await getSessionByToken(sessionToken)
    if (!session) {
      console.log("❌ No valid session found for token")
      return null
    }

    console.log("✅ Valid session found for email:", session.email)

    // Return the hardcoded user for the team email
    if (session.email === "team@hackabudhabi.com") {
      return {
        id: 1,
        email: "team@hackabudhabi.com",
        name: "Hack Abu Dhabi Team",
        created_at: new Date().toISOString(),
      }
    }

    // Return the hardcoded user for the admin email
    if (session.email === "admin@hackabudhabi.com") {
      return {
        id: 2,
        email: "admin@hackabudhabi.com",
        name: "Admin User",
        created_at: new Date().toISOString(),
      }
    }

    console.log("❌ Session email doesn't match expected user")
    return null
  } catch (error) {
    console.error("Error in getCurrentUser:", error)
    return null
  }
}

// Logout - invalidate session
export async function logout(sessionToken: string): Promise<void> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not configured for logout")
      return
    }

    console.log("Logging out session:", sessionToken.substring(0, 15) + "...")
    const result = await sql`
      DELETE FROM user_sessions 
      WHERE session_token = ${sessionToken}
      RETURNING *
    `
    console.log("✅ Session deleted successfully:", result.length, "sessions removed")
  } catch (error) {
    console.error("Error in logout:", error)
  }
}

// Clean up expired sessions
export async function cleanupExpiredSessions(): Promise<void> {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not configured for cleanup")
      return
    }

    const result = await sql`
      DELETE FROM user_sessions 
      WHERE expires_at < NOW()
      RETURNING *
    `
    console.log("Cleaned up", result.length, "expired sessions")
  } catch (error) {
    console.error("Error in cleanupExpiredSessions:", error)
  }
}
