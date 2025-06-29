"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCards } from "@/components/stats-cards"
import { ParticipantTable } from "@/components/participant-table"
import { ManualAddParticipant } from "@/components/manual-add-participant"
import { BulkBadgeGenerator } from "@/components/bulk-badge-generator"
import { QuickCheckin } from "@/components/quick-checkin"
import { BulkDeleteDialog } from "@/components/bulk-delete-dialog"
import {
  Users,
  UserPlus,
  QrCode,
  FileText,
  Settings,
  RefreshCw,
  Download,
  Trash2,
  Mail,
  ExternalLink,
} from "lucide-react"

interface Participant {
  id: number
  name: string
  email: string
  phone?: string
  nationality?: string
  city?: string
  checked_in: boolean
  food_fulfilled: boolean
  manually_added: boolean
  qr_id: string
  created_at: string
}

export default function Dashboard() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([])
  const [showBulkDelete, setShowBulkDelete] = useState(false)

  useEffect(() => {
    loadParticipants()
  }, [])

  const loadParticipants = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/participants")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setParticipants(data.participants || [])
    } catch (error) {
      console.error("Error loading participants:", error)
      setError(error instanceof Error ? error.message : "Failed to load participants")
    } finally {
      setLoading(false)
    }
  }

  const handleParticipantAdded = () => {
    loadParticipants()
  }

  const handleParticipantUpdated = () => {
    loadParticipants()
  }

  const handleParticipantDeleted = () => {
    loadParticipants()
    setSelectedParticipants([])
  }

  const handleBulkDelete = () => {
    setShowBulkDelete(true)
  }

  const exportParticipants = () => {
    window.open("/api/participants?format=csv", "_blank")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Alert variant="destructive">
            <AlertDescription>
              <strong>Error loading dashboard:</strong> {error}
            </AlertDescription>
          </Alert>
          <Button onClick={loadParticipants} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Hack Abu Dhabi</h1>
                <p className="text-sm text-gray-500">Participant Management System</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <a href="/dashboard" className="text-blue-600 hover:text-blue-800 font-semibold">
                Dashboard
              </a>
              <a href="/api-test" className="text-blue-600 hover:text-blue-800">
                API Test
              </a>
              <a href="/integrations" className="text-blue-600 hover:text-blue-800">
                Integrations
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Manage participants and event operations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={loadParticipants} variant="outline" className="flex items-center gap-2 bg-transparent">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button onClick={exportParticipants} variant="outline" className="flex items-center gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            {selectedParticipants.length > 0 && (
              <Button onClick={handleBulkDelete} variant="destructive" className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Selected ({selectedParticipants.length})
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Check-in</CardTitle>
              <QrCode className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <QuickCheckin onUpdate={handleParticipantUpdated} />
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Add Participant</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <ManualAddParticipant onParticipantAdded={handleParticipantAdded} />
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generate Badges</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <BulkBadgeGenerator participants={participants} />
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Integrations</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 bg-transparent"
                onClick={() => window.open("/integrations", "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                Open Portal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="participants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="participants" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({participants.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="participants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Participants
                </CardTitle>
                <CardDescription>Manage participant information, check-in status, and food fulfillment</CardDescription>
              </CardHeader>
              <CardContent>
                <ParticipantTable
                  participants={participants}
                  onUpdate={handleParticipantUpdated}
                  onDelete={handleParticipantDeleted}
                  selectedParticipants={selectedParticipants}
                  onSelectionChange={setSelectedParticipants}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Current system health and configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Database Connection</span>
                    <Badge variant="default">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Total Participants</span>
                    <Badge variant="secondary">{participants.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Checked In</span>
                    <Badge variant="default">{participants.filter((p) => p.checked_in).length}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Food Fulfilled</span>
                    <Badge variant="default">{participants.filter((p) => p.food_fulfilled).length}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                  <CardDescription>Access external tools and services</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => window.open("/api-test", "_blank")}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    API Testing Portal
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => window.open("/integrations", "_blank")}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Integrations Portal
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-transparent"
                    onClick={() => window.open("/api/health", "_blank")}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    System Health Check
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Bulk Delete Dialog */}
      <BulkDeleteDialog
        open={showBulkDelete}
        onOpenChange={setShowBulkDelete}
        selectedIds={selectedParticipants}
        onDeleted={handleParticipantDeleted}
      />
    </div>
  )
}
