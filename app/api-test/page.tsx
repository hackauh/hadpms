"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Database, Users, BarChart3 } from "lucide-react"

interface ApiTest {
  name: string
  endpoint: string
  method: string
  description: string
  icon: React.ReactNode
}

interface TestResult {
  success: boolean
  data?: any
  error?: string
  status?: number
  duration?: number
}

export default function ApiTestPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const apiTests: ApiTest[] = [
    {
      name: "Health Check",
      endpoint: "/api/health",
      method: "GET",
      description: "Check database connection and system status",
      icon: <Database className="w-4 h-4" />,
    },
    {
      name: "Get Stats",
      endpoint: "/api/stats",
      method: "GET",
      description: "Fetch participant statistics",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      name: "Get Participants",
      endpoint: "/api/participants",
      method: "GET",
      description: "Fetch all participants",
      icon: <Users className="w-4 h-4" />,
    },
  ]

  const runTest = async (test: ApiTest) => {
    const testKey = test.name
    setLoading((prev) => ({ ...prev, [testKey]: true }))

    const startTime = Date.now()

    try {
      const response = await fetch(test.endpoint, {
        method: test.method,
        headers: {
          "Content-Type": "application/json",
        },
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      setResults((prev) => ({
        ...prev,
        [testKey]: {
          success: response.ok,
          data,
          status: response.status,
          duration,
          error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
        },
      }))
    } catch (error) {
      const duration = Date.now() - startTime
      setResults((prev) => ({
        ...prev,
        [testKey]: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          duration,
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, [testKey]: false }))
    }
  }

  const runAllTests = async () => {
    for (const test of apiTests) {
      await runTest(test)
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hack Abu Dhabi</h1>
                <p className="text-sm text-gray-500">API Testing Portal</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
                Dashboard
              </a>
              <a href="/api-test" className="text-blue-600 hover:text-blue-800 font-semibold">
                API Test
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Testing</h1>
            <p className="text-muted-foreground">Test all API endpoints and check system health</p>
          </div>
          <Button onClick={runAllTests} className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Run All Tests
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apiTests.map((test) => {
            const testKey = test.name
            const result = results[testKey]
            const isLoading = loading[testKey]

            return (
              <Card key={testKey} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {test.icon}
                      <CardTitle className="text-lg">{test.name}</CardTitle>
                    </div>
                    <Badge variant={test.method === "GET" ? "secondary" : "default"}>{test.method}</Badge>
                  </div>
                  <CardDescription>{test.description}</CardDescription>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{test.endpoint}</code>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Button
                    onClick={() => runTest(test)}
                    disabled={isLoading}
                    className="w-full"
                    variant={result?.success ? "default" : result?.success === false ? "destructive" : "outline"}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : result?.success ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Success
                      </>
                    ) : result?.success === false ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Failed
                      </>
                    ) : (
                      "Run Test"
                    )}
                  </Button>

                  {result && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Status:</span>
                        <Badge variant={result.success ? "default" : "destructive"}>{result.status || "Error"}</Badge>
                      </div>

                      {result.duration && (
                        <div className="flex items-center justify-between text-sm">
                          <span>Duration:</span>
                          <span className="text-muted-foreground">{result.duration}ms</span>
                        </div>
                      )}

                      {result.error && (
                        <div className="text-sm">
                          <span className="font-medium text-red-600">Error:</span>
                          <p className="text-red-600 mt-1 text-xs break-words">{result.error}</p>
                        </div>
                      )}

                      {result.data && (
                        <div className="text-sm">
                          <span className="font-medium">Response:</span>
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common API operations for testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                onClick={() => window.open("/api/health", "_blank")}
                className="flex items-center gap-2"
              >
                <Database className="w-4 h-4" />
                Open Health Check
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("/api/stats", "_blank")}
                className="flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Open Stats API
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open("/api/participants", "_blank")}
                className="flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                Open Participants API
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
