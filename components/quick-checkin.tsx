"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, UserCheck, UserX, AlertCircle } from "lucide-react"
import type { Participant } from "@/lib/db"

export function QuickCheckin() {
  const [searchTerm, setSearchTerm] = useState("")
  const [participant, setParticipant] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const searchParticipant = async () => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/participants")

      if (!response.ok) {
        throw new Error("Failed to fetch participants")
      }

      const participants: Participant[] = await response.json()

      if (!Array.isArray(participants)) {
        throw new Error("Invalid response format")
      }

      const found = participants.find(
        (p) =>
          p?.email?.toLowerCase() === searchTerm.toLowerCase() ||
          p?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p?.qr_id?.toLowerCase() === searchTerm.toLowerCase(),
      )

      if (found) {
        setParticipant(found)
        setMessage("")
      } else {
        setParticipant(null)
        setMessage("Participant not found")
      }
    } catch (error) {
      console.error("Search error:", error)
      setParticipant(null)
      setMessage("Error searching for participant")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!participant) return

    try {
      const response = await fetch(`/api/participants/${participant.id}/checkin`, { method: "POST" })

      if (response.ok) {
        const updatedParticipant = await response.json()
        setParticipant(updatedParticipant)
        setMessage("Successfully checked in!")
      } else {
        setMessage("Failed to check in participant")
      }
    } catch (error) {
      console.error("Check-in error:", error)
      setMessage("Failed to check in participant")
    }
  }

  const handleCheckOut = async () => {
    if (!participant) return

    try {
      const response = await fetch(`/api/participants/${participant.id}/checkout`, { method: "POST" })

      if (response.ok) {
        const updatedParticipant = await response.json()
        setParticipant(updatedParticipant)
        setMessage("Successfully checked out!")
      } else {
        setMessage("Failed to check out participant")
      }
    } catch (error) {
      console.error("Check-out error:", error)
      setMessage("Failed to check out participant")
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Quick Check-in
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search by name, email, or QR ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && searchParticipant()}
          />
          <Button onClick={searchParticipant} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>

        {message && (
          <div
            className={`text-sm flex items-center gap-2 ${message.includes("Success") ? "text-green-600" : "text-red-600"}`}
          >
            {!message.includes("Success") && <AlertCircle className="h-4 w-4" />}
            {message}
          </div>
        )}

        {participant && (
          <div className="space-y-3 p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold">{participant.name || "N/A"}</h3>
              <p className="text-sm text-muted-foreground">{participant.email || "N/A"}</p>
              <p className="text-xs text-muted-foreground font-mono">QR: {participant.qr_id || "N/A"}</p>
              {participant.university && <p className="text-sm text-muted-foreground">{participant.university}</p>}
            </div>

            <div className="flex gap-2">
              {participant.checked_in ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Checked In
                </Badge>
              ) : (
                <Badge variant="secondary">Not Checked In</Badge>
              )}
              {participant.checked_out && <Badge variant="destructive">Checked Out</Badge>}
            </div>

            <div className="flex gap-2">
              {!participant.checked_in && (
                <Button onClick={handleCheckIn} className="flex-1">
                  <UserCheck className="h-4 w-4 mr-2" />
                  Check In
                </Button>
              )}
              {participant.checked_in && !participant.checked_out && (
                <Button onClick={handleCheckOut} variant="destructive" className="flex-1">
                  <UserX className="h-4 w-4 mr-2" />
                  Check Out
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
