import { StatsCards } from "@/components/stats-cards"
import { ParticipantTable } from "@/components/participant-table"
import { QuickCheckin } from "@/components/quick-checkin"
import { ManualAddParticipant } from "@/components/manual-add-participant"
import { BulkDeleteDialog } from "@/components/bulk-delete-dialog"
import { BulkBadgeGenerator } from "@/components/bulk-badge-generator"
import { DashboardHeader } from "@/components/dashboard-header"
import { getCurrentUser } from "@/lib/auth"
import { getAllParticipants } from "@/lib/db"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  console.log("Dashboard page loading...")

  // Get current user - don't wrap in try-catch since redirect throws
  const user = await getCurrentUser()
  console.log("Current user:", user ? user.email : "none")

  if (!user) {
    console.log("No user found, redirecting to login")
    redirect("/login")
  }

  let participants = []
  let error = null

  try {
    console.log("User authenticated, loading participants...")
    participants = await getAllParticipants()
    console.log("Participants loaded:", participants?.length || 0)
  } catch (err) {
    console.error("Dashboard data loading error:", err)
    error = "Unable to load participant data"
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={user} />
        <div className="container mx-auto py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Data Loading Error</h1>
            <p className="text-gray-600 mb-4">{error}. Please try refreshing the page.</p>
            <a href="/dashboard" className="text-blue-600 hover:underline">
              Refresh Page
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hack Abu Dhabi</h1>
            <p className="text-muted-foreground">Participant Management System</p>
          </div>
          <div className="flex gap-2">
            <BulkBadgeGenerator participants={participants || []} />
            <BulkDeleteDialog participants={participants || []} onDelete={() => {}} />
            <ManualAddParticipant onParticipantAdded={() => {}} />
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
