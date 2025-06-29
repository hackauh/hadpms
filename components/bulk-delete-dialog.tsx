"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2, AlertTriangle } from "lucide-react"
import type { Participant } from "@/lib/db"

interface BulkDeleteDialogProps {
  participants: Participant[]
  onDelete: () => void
}

export function BulkDeleteDialog({ participants, onDelete }: BulkDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // Add safety check for participants
  const safeParticipants = participants || []

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(safeParticipants.map((p) => p.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectParticipant = (participantId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, participantId])
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== participantId))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/participants/bulk-delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ participantIds: selectedIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete participants")
      }

      setOpen(false)
      setSelectedIds([])
      onDelete()
      // Refresh the page to show updated list
      window.location.reload()
    } catch (error) {
      console.error("Failed to delete participants:", error)
      setError(error instanceof Error ? error.message : "Failed to delete participants")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent">
          <Trash2 className="h-4 w-4 mr-2" />
          Bulk Delete
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Bulk Delete Participants
          </DialogTitle>
          <DialogDescription>Select participants to delete. This action cannot be undone.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedIds.length === safeParticipants.length && safeParticipants.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select All ({safeParticipants.length} participants)
            </label>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {safeParticipants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-2 p-3 border-b last:border-b-0">
                <Checkbox
                  id={`participant-${participant.id}`}
                  checked={selectedIds.includes(participant.id)}
                  onCheckedChange={(checked) => handleSelectParticipant(participant.id, checked as boolean)}
                />
                <div className="flex-1">
                  <div className="font-medium">{participant.name}</div>
                  <div className="text-sm text-muted-foreground">{participant.email}</div>
                  <div className="text-xs text-muted-foreground font-mono">QR: {participant.qr_id}</div>
                  {participant.checked_in && <div className="text-xs text-orange-600 font-medium">⚠️ Checked in</div>}
                </div>
              </div>
            ))}
          </div>

          {selectedIds.length > 0 && (
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-sm font-medium text-red-800">
                {selectedIds.length} participant(s) selected for deletion
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleBulkDelete} disabled={loading || selectedIds.length === 0}>
            {loading ? "Deleting..." : `Delete ${selectedIds.length} Participant(s)`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
