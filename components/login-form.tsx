"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle } from "lucide-react"

interface LoginFormProps {
  error?: string
}

export function LoginForm({ error }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState(error || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    console.log("=== LOGIN ATTEMPT ===")
    console.log("Email:", email)
    console.log("Environment:", process.env.NODE_ENV)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      })

      console.log("Login response status:", response.status)
      const data = await response.json()
      console.log("Login response data:", data)

      if (response.ok) {
        console.log("✅ Login successful, redirecting...")
        window.location.href = "/dashboard"
      } else {
        console.log("❌ Login failed:", data.error)
        setLoginError(data.error || "Login failed")
      }
    } catch (error) {
      console.error("❌ Login request failed:", error)
      setLoginError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Get error message based on URL parameter
  const getErrorMessage = (errorType: string) => {
    switch (errorType) {
      case "database":
        return "Database connection error. Please contact support."
      case "system":
        return "System error occurred. Please try again later."
      case "session":
        return "Your session has expired. Please log in again."
      default:
        return errorType
    }
  }

  const displayError = loginError || (error ? getErrorMessage(error) : "")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Hack Abu Dhabi</CardTitle>
          <CardDescription className="text-center">Sign in to the management portal</CardDescription>
        </CardHeader>
        <CardContent>
          {displayError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="team@hackabudhabi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Demo credentials:</p>
            <p className="font-mono text-xs">team@hackabudhabi.com / Had@2025</p>
          </div>

          <div className="mt-4 text-center">
            <a href="/api/health" target="_blank" className="text-xs text-blue-600 hover:underline" rel="noreferrer">
              Check System Status
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
