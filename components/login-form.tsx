"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, Shield, Heart } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("team@hackabudhabi.com")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      console.log("=== CLIENT LOGIN START ===")
      console.log("Attempting login for:", email)
      console.log("Current cookies before login:", document.cookie)

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for cookies
        body: JSON.stringify({ email, password }),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log("Response data:", data)

      if (response.ok && data.success) {
        console.log("Login successful!")
        console.log("Session token from response:", data.sessionToken)

        // Check if cookies were set
        console.log("Cookies after login:", document.cookie)

        // Wait for cookies to be set
        await new Promise((resolve) => setTimeout(resolve, 1000))

        console.log("Cookies after wait:", document.cookie)

        // Try to manually set the cookie if it wasn't set by the server
        if (data.sessionToken && !document.cookie.includes("session_token")) {
          console.log("Manually setting session cookie...")
          document.cookie = `session_token=${data.sessionToken}; path=/; max-age=${24 * 60 * 60}`
        }

        console.log("Final cookies:", document.cookie)
        console.log("Redirecting to dashboard...")

        // Force a hard redirect
        window.location.href = "/dashboard"
      } else {
        setError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Failed to login. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="w-full max-w-md p-6">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Hack Abu Dhabi Portal</CardTitle>
            <p className="text-gray-600 mt-2">Sign in to access the management portal</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="team@hackabudhabi.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-500">
              <p>Use: team@hackabudhabi.com / Had@2025</p>
            </div>

            {/* Debug info */}
            <div className="text-xs text-gray-400 p-2 bg-gray-50 rounded">
              <p>Debug: Current cookies: {typeof window !== "undefined" ? document.cookie || "none" : "server"}</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 space-y-3">
          <p className="text-blue-100 text-sm">
            World's Largest High-School Hackathon
            <br />
            Nov 15-16 • ADNEC Centre Abu Dhabi
          </p>
          <div className="flex items-center justify-center gap-1 text-blue-200 text-xs">
            <span>Made with</span>
            <Heart className="w-3 h-3 text-red-400 fill-current" />
            <span>by Akul</span>
          </div>
        </div>
      </div>
    </div>
  )
}
