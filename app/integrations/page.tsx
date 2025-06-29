"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Loader2,
  CheckCircle,
  XCircle,
  Settings,
  Mail,
  FileText,
  Database,
  ExternalLink,
  RefreshCw,
  Send,
  Users,
  Webhook,
  MessageSquare,
  Filter,
} from "lucide-react"

interface IntegrationStatus {
  connected: boolean
  lastTested?: string
  error?: string
}

interface TestResult {
  success: boolean
  message: string
  data?: any
}

interface Participant {
  id: number
  name: string
  email: string
  nationality?: string
  city?: string
  checked_in: boolean
  food_fulfilled: boolean
  manually_added: boolean
}

export default function IntegrationsPage() {
  const [filloutStatus, setFilloutStatus] = useState<IntegrationStatus>({ connected: false })
  const [loopsStatus, setLoopsStatus] = useState<IntegrationStatus>({ connected: false })
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [participants, setParticipants] = useState<Participant[]>([])
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([])

  // Fillout form data
  const [filloutFormId, setFilloutFormId] = useState("")
  const [filloutWebhookUrl, setFilloutWebhookUrl] = useState("")

  // Loops data
  const [loopsApiKey, setLoopsApiKey] = useState("")
  const [loopsTestEmail, setLoopsTestEmail] = useState("")

  // Email campaign data
  const [emailSubject, setEmailSubject] = useState("")
  const [emailBody, setEmailBody] = useState(`Hi {{firstName}},

Welcome to Hack Abu Dhabi! We're excited to have you join us.

Here are some important details:
- Event Date: [Insert Date]
- Location: [Insert Location]
- Check-in starts at: [Insert Time]

If you have any questions, feel free to reach out to our team.

Best regards,
The Hack Abu Dhabi Team`)
  const [emailFilter, setEmailFilter] = useState("all")

  // Test webhook data
  const [webhookTestData, setWebhookTestData] = useState(`{
  "submissionId": "test-123",
  "questions": [
    {
      "title": "What's your full name?",
      "answer": "John Doe"
    },
    {
      "title": "What is your email?",
      "answer": "john@example.com"
    },
    {
      "title": "What should we call you?",
      "answer": "Johnny"
    },
    {
      "title": "Please select your pronouns:",
      "answer": "he/him"
    },
    {
      "title": "What's the best phone number to reach you at?",
      "answer": "+1234567890"
    },
    {
      "title": "What is your Nationality?",
      "answer": "American"
    }
  ]
}`)

  useEffect(() => {
    checkIntegrationStatus()
    loadParticipants()
  }, [])

  const checkIntegrationStatus = async () => {
    try {
      const response = await fetch("/api/integrations/status")
      const data = await response.json()

      setFilloutStatus(data.fillout || { connected: false })
      setLoopsStatus(data.loops || { connected: false })
    } catch (error) {
      console.error("Failed to check integration status:", error)
    }
  }

  const loadParticipants = async () => {
    try {
      const response = await fetch("/api/participants")
      const data = await response.json()
      setParticipants(data.participants || [])
    } catch (error) {
      console.error("Failed to load participants:", error)
    }
  }

  const testFilloutWebhook = async () => {
    setLoading((prev) => ({ ...prev, fillout: true }))

    try {
      const response = await fetch("/api/webhook/fillout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: webhookTestData,
      })

      const data = await response.json()

      setTestResults((prev) => ({
        ...prev,
        fillout: {
          success: response.ok,
          message: response.ok ? "Webhook test successful!" : data.error || "Webhook test failed",
          data: response.ok ? data : undefined,
        },
      }))

      if (response.ok) {
        setFilloutStatus((prev) => ({ ...prev, connected: true, lastTested: new Date().toISOString() }))
      }
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        fillout: {
          success: false,
          message: error instanceof Error ? error.message : "Network error",
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, fillout: false }))
    }
  }

  const testLoopsConnection = async () => {
    setLoading((prev) => ({ ...prev, loops: true }))

    try {
      const response = await fetch("/api/integrations/loops/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey: loopsApiKey,
          testEmail: loopsTestEmail,
        }),
      })

      const data = await response.json()

      setTestResults((prev) => ({
        ...prev,
        loops: {
          success: response.ok,
          message: response.ok ? "Loops connection successful!" : data.error || "Loops test failed",
          data: response.ok ? data : undefined,
        },
      }))

      if (response.ok) {
        setLoopsStatus((prev) => ({ ...prev, connected: true, lastTested: new Date().toISOString() }))
      }
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        loops: {
          success: false,
          message: error instanceof Error ? error.message : "Network error",
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, loops: false }))
    }
  }

  const syncParticipantsToLoops = async () => {
    setLoading((prev) => ({ ...prev, sync: true }))

    try {
      const response = await fetch("/api/integrations/loops/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      setTestResults((prev) => ({
        ...prev,
        sync: {
          success: response.ok,
          message: response.ok ? `Synced ${data.synced} participants to Loops` : data.error || "Sync failed",
          data: response.ok ? data : undefined,
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        sync: {
          success: false,
          message: error instanceof Error ? error.message : "Network error",
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, sync: false }))
    }
  }

  const sendEmailCampaign = async () => {
    setLoading((prev) => ({ ...prev, email: true }))

    try {
      const targetParticipants = getFilteredParticipants()
      const participantIds =
        selectedParticipants.length > 0 ? selectedParticipants : targetParticipants.map((p) => p.id)

      const response = await fetch("/api/integrations/loops/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          participantIds,
          subject: emailSubject,
          body: emailBody,
          apiKey: loopsApiKey,
        }),
      })

      const data = await response.json()

      setTestResults((prev) => ({
        ...prev,
        email: {
          success: response.ok,
          message: response.ok ? `Email sent to ${data.sent} participants` : data.error || "Email sending failed",
          data: response.ok ? data : undefined,
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        email: {
          success: false,
          message: error instanceof Error ? error.message : "Network error",
        },
      }))
    } finally {
      setLoading((prev) => ({ ...prev, email: false }))
    }
  }

  const getFilteredParticipants = () => {
    switch (emailFilter) {
      case "checked-in":
        return participants.filter((p) => p.checked_in)
      case "not-checked-in":
        return participants.filter((p) => !p.checked_in)
      case "food-fulfilled":
        return participants.filter((p) => p.food_fulfilled)
      case "manual":
        return participants.filter((p) => p.manually_added)
      case "fillout":
        return participants.filter((p) => !p.manually_added)
      default:
        return participants
    }
  }

  const toggleParticipantSelection = (participantId: number) => {
    setSelectedParticipants((prev) =>
      prev.includes(participantId) ? prev.filter((id) => id !== participantId) : [...prev, participantId],
    )
  }

  const selectAllFiltered = () => {
    const filteredIds = getFilteredParticipants().map((p) => p.id)
    setSelectedParticipants(filteredIds)
  }

  const clearSelection = () => {
    setSelectedParticipants([])
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
                <p className="text-sm text-gray-500">Integrations Portal</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
                Dashboard
              </a>
              <a href="/api-test" className="text-blue-600 hover:text-blue-800">
                API Test
              </a>
              <a href="/integrations" className="text-blue-600 hover:text-blue-800 font-semibold">
                Integrations
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-muted-foreground">Connect and manage external services</p>
          </div>
          <Button onClick={checkIntegrationStatus} variant="outline" className="flex items-center gap-2 bg-transparent">
            <RefreshCw className="w-4 h-4" />
            Refresh Status
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fillout Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {filloutStatus.connected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={filloutStatus.connected ? "default" : "secondary"}>
                  {filloutStatus.connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              {filloutStatus.lastTested && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last tested: {new Date(filloutStatus.lastTested).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loops Email</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                {loopsStatus.connected ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <Badge variant={loopsStatus.connected ? "default" : "secondary"}>
                  {loopsStatus.connected ? "Connected" : "Disconnected"}
                </Badge>
              </div>
              {loopsStatus.lastTested && (
                <p className="text-xs text-muted-foreground mt-2">
                  Last tested: {new Date(loopsStatus.lastTested).toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Database</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Badge variant="default">Connected</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Neon PostgreSQL</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="fillout" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="fillout" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Fillout
            </TabsTrigger>
            <TabsTrigger value="loops" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Loops
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Email Campaign
            </TabsTrigger>
            <TabsTrigger value="webhook" className="flex items-center gap-2">
              <Webhook className="w-4 h-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="sync" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Sync
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fillout" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Fillout Forms Integration
                </CardTitle>
                <CardDescription>
                  Connect your Fillout forms to automatically create participants when forms are submitted.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fillout-form-id">Form ID</Label>
                    <Input
                      id="fillout-form-id"
                      placeholder="Enter your Fillout form ID"
                      value={filloutFormId}
                      onChange={(e) => setFilloutFormId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">Webhook URL</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="webhook-url"
                        value={`${typeof window !== "undefined" ? window.location.origin : ""}/api/webhook/fillout`}
                        readOnly
                        className="bg-gray-50"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigator.clipboard.writeText(
                            `${typeof window !== "undefined" ? window.location.origin : ""}/api/webhook/fillout`,
                          )
                        }
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Add this webhook URL to your Fillout form settings to automatically create participants when forms
                    are submitted.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center gap-2">
                  <Button onClick={testFilloutWebhook} disabled={loading.fillout} className="flex items-center gap-2">
                    {loading.fillout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Test Webhook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open("https://fillout.com", "_blank")}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Fillout
                  </Button>
                </div>

                {testResults.fillout && (
                  <Alert variant={testResults.fillout.success ? "default" : "destructive"}>
                    {testResults.fillout.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>{testResults.fillout.message}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loops" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Loops Email Integration
                </CardTitle>
                <CardDescription>Connect Loops for email marketing and participant communication.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="loops-api-key">Loops API Key</Label>
                    <Input
                      id="loops-api-key"
                      type="password"
                      placeholder="Enter your Loops API key"
                      value={loopsApiKey}
                      onChange={(e) => setLoopsApiKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="test-email">Test Email</Label>
                    <Input
                      id="test-email"
                      type="email"
                      placeholder="test@example.com"
                      value={loopsTestEmail}
                      onChange={(e) => setLoopsTestEmail(e.target.value)}
                    />
                  </div>
                </div>

                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Get your API key from your Loops dashboard under Settings → API Keys.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={testLoopsConnection}
                    disabled={loading.loops || !loopsApiKey}
                    className="flex items-center gap-2"
                  >
                    {loading.loops ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Test Connection
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open("https://loops.so", "_blank")}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Loops
                  </Button>
                </div>

                {testResults.loops && (
                  <Alert variant={testResults.loops.success ? "default" : "destructive"}>
                    {testResults.loops.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <AlertDescription>{testResults.loops.message}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Email Campaign
                </CardTitle>
                <CardDescription>Send targeted emails to participants using Loops API.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Email Subject</Label>
                    <Input
                      id="email-subject"
                      placeholder="Welcome to Hack Abu Dhabi!"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-filter">Target Audience</Label>
                    <Select value={emailFilter} onValueChange={setEmailFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select participants" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Participants</SelectItem>
                        <SelectItem value="checked-in">Checked In</SelectItem>
                        <SelectItem value="not-checked-in">Not Checked In</SelectItem>
                        <SelectItem value="food-fulfilled">Food Fulfilled</SelectItem>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                        <SelectItem value="fillout">Fillout Forms</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-body">Email Body</Label>
                  <Textarea
                    id="email-body"
                    rows={10}
                    placeholder="Write your email content here..."
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {`{{firstName}}`} and {`{{lastName}}`} for personalization
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Select Recipients</Label>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={selectAllFiltered}>
                        Select All Filtered ({getFilteredParticipants().length})
                      </Button>
                      <Button size="sm" variant="outline" onClick={clearSelection}>
                        Clear Selection
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
                    {getFilteredParticipants().map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <Checkbox
                          checked={selectedParticipants.includes(participant.id)}
                          onCheckedChange={() => toggleParticipantSelection(participant.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{participant.name}</p>
                          <p className="text-sm text-muted-foreground">{participant.email}</p>
                        </div>
                        <div className="flex gap-1">
                          {participant.checked_in && (
                            <Badge variant="default" className="text-xs">
                              Checked In
                            </Badge>
                          )}
                          {participant.food_fulfilled && (
                            <Badge variant="secondary" className="text-xs">
                              Food
                            </Badge>
                          )}
                          {participant.manually_added && (
                            <Badge variant="outline" className="text-xs">
                              Manual
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Alert>
                    <Filter className="h-4 w-4" />
                    <AlertDescription>
                      {selectedParticipants.length > 0
                        ? `${selectedParticipants.length} participants selected for email campaign`
                        : `All ${getFilteredParticipants().length} filtered participants will receive the email`}
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={sendEmailCampaign}
                    disabled={loading.email || !loopsApiKey || !emailSubject || !emailBody}
                    className="flex items-center gap-2"
                  >
                    {loading.email ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Send Email Campaign
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {selectedParticipants.length > 0 ? selectedParticipants.length : getFilteredParticipants().length}{" "}
                    recipients
                  </p>
                </div>

                {testResults.email && (
                  <Alert variant={testResults.email.success ? "default" : "destructive"}>
                    {testResults.email.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <AlertDescription>
                      {testResults.email.message}
                      {testResults.email.data && (
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(testResults.email.data, null, 2)}
                        </pre>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhook" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="w-5 h-5" />
                  Webhook Testing
                </CardTitle>
                <CardDescription>Test webhook endpoints with custom data to ensure proper integration.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-data">Test Webhook Data</Label>
                  <Textarea
                    id="webhook-data"
                    rows={15}
                    value={webhookTestData}
                    onChange={(e) => setWebhookTestData(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Modify the JSON above to test different form submissions. The webhook will create a participant
                    based on this data.
                  </AlertDescription>
                </Alert>

                <Button onClick={testFilloutWebhook} disabled={loading.fillout} className="flex items-center gap-2">
                  {loading.fillout ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send Test Webhook
                </Button>

                {testResults.fillout && (
                  <Alert variant={testResults.fillout.success ? "default" : "destructive"}>
                    {testResults.fillout.success ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    <AlertDescription>
                      {testResults.fillout.message}
                      {testResults.fillout.data && (
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(testResults.fillout.data, null, 2)}
                        </pre>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Data Synchronization
                </CardTitle>
                <CardDescription>
                  Sync existing participants with external services and manage data flow.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Sync to Loops</CardTitle>
                      <CardDescription className="text-sm">
                        Add all existing participants to your Loops contact list
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={syncParticipantsToLoops}
                        disabled={loading.sync || !loopsStatus.connected}
                        className="w-full flex items-center gap-2"
                      >
                        {loading.sync ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
                        Sync Participants
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Export Data</CardTitle>
                      <CardDescription className="text-sm">
                        Download participant data in various formats
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        onClick={() => window.open("/api/participants?format=csv", "_blank")}
                        className="w-full flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Export CSV
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {testResults.sync && (
                  <Alert variant={testResults.sync.success ? "default" : "destructive"}>
                    {testResults.sync.success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    <AlertDescription>
                      {testResults.sync.message}
                      {testResults.sync.data && (
                        <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                          {JSON.stringify(testResults.sync.data, null, 2)}
                        </pre>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
