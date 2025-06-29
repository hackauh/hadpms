"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Utensils, Crown, HandHeart, UserCog } from "lucide-react"

interface Stats {
  total: number
  checkedIn: number
  checkedOut: number
  notCheckedIn: number
  foodFulfilled: number
  manuallyAdded: number
  participants: number
  organizers: number
  volunteers: number
  guests: number
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    checkedIn: 0,
    checkedOut: 0,
    notCheckedIn: 0,
    foodFulfilled: 0,
    manuallyAdded: 0,
    participants: 0,
    organizers: 0,
    volunteers: 0,
    guests: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching stats from API...")

      const response = await fetch("/api/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Ensure fresh data
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Stats received:", data)

      setStats(data)
    } catch (err) {
      console.error("Error fetching stats:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch stats")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)

    return () => clearInterval(interval)
  }, [])

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 font-medium">Error loading stats</p>
              <p className="text-sm text-gray-500 mt-1">{error}</p>
              <button onClick={fetchStats} className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline">
                Try again
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total People",
      value: loading ? "..." : stats.total.toString(),
      icon: Users,
      description: "All registered participants",
    },
    {
      title: "Checked In",
      value: loading ? "..." : stats.checkedIn.toString(),
      icon: UserCheck,
      description: "Currently at the event",
    },
    {
      title: "Not Checked In",
      value: loading ? "..." : stats.notCheckedIn.toString(),
      icon: UserX,
      description: "Registered but not arrived",
    },
    {
      title: "Food Fulfilled",
      value: loading ? "..." : stats.foodFulfilled.toString(),
      icon: Utensils,
      description: "Meals distributed",
    },
    {
      title: "Participants",
      value: loading ? "..." : stats.participants.toString(),
      icon: Users,
      description: "Regular participants",
    },
    {
      title: "Organizers",
      value: loading ? "..." : stats.organizers.toString(),
      icon: Crown,
      description: "Event organizers",
    },
    {
      title: "Volunteers",
      value: loading ? "..." : stats.volunteers.toString(),
      icon: HandHeart,
      description: "Event volunteers",
    },
    {
      title: "Guests",
      value: loading ? "..." : stats.guests.toString(),
      icon: UserCog,
      description: "Special guests",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Statistics</h2>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
