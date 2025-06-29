import { StatsCards } from "@/components/stats-cards"
import { ParticipantTable } from "@/components/participant-table"
import { QuickCheckin } from "@/components/quick-checkin"
import { ManualAddParticipant } from "@/components/manual-add-participant"
import { BulkDeleteDialog } from "@/components/bulk-delete-dialog"
import { BulkBadgeGenerator } from "@/components/bulk-badge-generator"
import { getAllParticipants } from "@/lib/db"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  console.log("=== DASHBOARD PAGE LOADING ===")
  console.log("Environment:", process.env.NODE_ENV)
  console.log("Database URL configured:", !!process.env.DATABASE_URL)

  // Check if database is configured
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not configured")
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
          <p className="text-gray-600 mb-4">Database connection not configured.</p>
          <p className="text-sm text-gray-500">Please check your environment variables.</p>
        </div>
      </div>
    )
  }

  let participants = []
  let dataError = null

  try {
    console.log("Loading participants...")
    participants = await getAllParticipants()
    console.log("Participants loaded:", participants?.length || 0)
  } catch (err) {
    console.error("Dashboard data loading error:", err)
    dataError = err instanceof Error ? err.message : "Unable to load participant data"
  }

  if (dataError) {
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
                  <p className="text-sm text-gray-500">Management Portal</p>
                </div>
              </div>
              <nav className="flex space-x-4">
                <a href="/dashboard" className="text-blue-600 hover:text-blue-800">
                  Dashboard
                </a>
                <a href="/api-test" className="text-blue-600 hover:text-blue-800">
                  API Test
                </a>
              </nav>
            </div>
          </div>
        </header>
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Data Loading Error</h1>
            <p className="text-gray-600 mb-4">{dataError}</p>
            <p className="text-sm text-gray-500 mb-4">
              Please try refreshing the page or check the database connection.
            </p>
            <div className="space-x-4">
              <a href="/dashboard" className="text-blue-600 hover:underline">
                Refresh Page
              </a>
              <a href="/api/health" className="text-blue-600 hover:underline" target="_blank" rel="noreferrer">
                Check System Health
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  console.log("Dashboard rendering successfully")
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
                <p className="text-sm text-gray-500">Management Portal</p>
              </div>
            </div>
            <nav className="flex space-x-4">
              <a href="/dashboard" className="text-blue-600 hover:text-blue-800 font-semibold">
                Dashboard
              </a>
              <a href="/api-test" className="text-blue-600 hover:text-blue-800">
                API Test
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hack Abu Dhabi</h1>
            <p className="text-muted-foreground">Participant Management System</p>
          </div>
          <div className="flex gap-2">
            <BulkBadgeGenerator participants={participants || []} />
            <BulkDeleteDialog participants={participants || []} />
            <ManualAddParticipant />
          </div>
        </div>

        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <h2 className="text-2xl font-semibold">Participants</h2>
            <ParticipantTable />
          </div>
          <QuickCheckin />
        </div>
      </div>
    </div>
  )
}
