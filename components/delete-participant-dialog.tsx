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
import { Trash2, AlertTriangle } from "lucide-react"
import type { Participant } from "@/lib/db"

interface DeleteParticipantDialogProps {
  participant: Participant
  onDelete: () => void
}

export function DeleteParticipantDialog({ participant, onDelete }: DeleteParticipantDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/participants/${participant.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete participant")
      }

      setOpen(false)
      onDelete()
    } catch (error) {
      console.error("Failed to delete participant:", error)
      setError(error instanceof Error ? error.message : "Failed to delete participant")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent">
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            Delete Participant
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this participant? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="font-medium">{participant.name}</div>
            <div className="text-sm text-muted-foreground">{participant.email}</div>
            <div className="text-xs text-muted-foreground font-mono">QR: {participant.qr_id}</div>
            {participant.checked_in && (
              <div className="text-xs text-orange-600 font-medium mt-1">⚠️ This participant is checked in</div>
            )}
          </div>

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
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete Participant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
