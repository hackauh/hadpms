"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Edit, UserCheck, UserX, Utensils, AlertCircle } from "lucide-react"
import type { Participant } from "@/lib/db"
import { EditParticipantForm } from "./edit-participant-form"
import { DeleteParticipantDialog } from "./delete-participant-dialog"
import { ParticipantBadge } from "./participant-badge"

export function ParticipantTable() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [filteredParticipants, setFilteredParticipants] = useState<Participant[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchParticipants()
  }, [])

  useEffect(() => {
    if (!participants) return

    const filtered = participants.filter(
      (participant) =>
        participant?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant?.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant?.nationality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant?.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant?.user_role?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredParticipants(filtered)
  }, [participants, searchTerm])

  const fetchParticipants = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/participants")

      if (!response.ok) {
        throw new Error("Failed to fetch participants")
      }

      const data = await response.json()
      setParticipants(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch participants:", error)
      setError("Failed to load participants")
      setParticipants([])
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async (id: number) => {
    try {
      const response = await fetch(`/api/participants/${id}/checkin`, { method: "POST" })
      if (response.ok) {
        fetchParticipants()
      }
    } catch (error) {
      console.error("Failed to check in participant:", error)
    }
  }

  const handleCheckOut = async (id: number) => {
    try {
      const response = await fetch(`/api/participants/${id}/checkout`, { method: "POST" })
      if (response.ok) {
        fetchParticipants()
      }
    } catch (error) {
      console.error("Failed to check out participant:", error)
    }
  }

  const handleFoodFulfill = async (id: number) => {
    try {
      const response = await fetch(`/api/participants/${id}/food`, { method: "POST" })
      if (response.ok) {
        fetchParticipants()
      }
    } catch (error) {
      console.error("Failed to fulfill food for participant:", error)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "organizer":
        return "bg-purple-100 text-purple-800"
      case "volunteer":
        return "bg-green-100 text-green-800"
      case "guest":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="rounded-md border">
          <div className="p-8 text-center">Loading participants...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <div className="p-8 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <div className="text-red-600">{error}</div>
            <Button onClick={fetchParticipants} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search participants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Food</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredParticipants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No participants found
                </TableCell>
              </TableRow>
            ) : (
              filteredParticipants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{participant.name || "N/A"}</div>
                      {participant.nickname && (
                        <div className="text-sm text-muted-foreground">"{participant.nickname}"</div>
                      )}
                      <div className="text-xs text-muted-foreground font-mono">{participant.qr_id || "N/A"}</div>
                    </div>
                  </TableCell>
                  <TableCell>{participant.email || "N/A"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={getRoleBadgeColor(participant.user_role || "participant")}>
                      {(participant.user_role || "participant").charAt(0).toUpperCase() +
                        (participant.user_role || "participant").slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{participant.nationality || "N/A"}</TableCell>
                  <TableCell>{participant.city || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {participant.checked_in ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Checked In
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Checked In</Badge>
                      )}
                      {participant.checked_out && <Badge variant="destructive">Checked Out</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    {participant.food_fulfilled ? (
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Food Given
                      </Badge>
                    ) : (
                      <Badge variant="outline">No Food</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <ParticipantBadge participant={participant} />

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Edit Participant</DialogTitle>
                          </DialogHeader>
                          <EditParticipantForm participant={participant} onUpdate={fetchParticipants} />
                        </DialogContent>
                      </Dialog>

                      {!participant.checked_in ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckIn(participant.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      ) : !participant.checked_out ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCheckOut(participant.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      ) : null}
                      {participant.checked_in && !participant.food_fulfilled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFoodFulfill(participant.id)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Utensils className="h-4 w-4" />
                        </Button>
                      )}

                      <DeleteParticipantDialog participant={participant} onDelete={fetchParticipants} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
