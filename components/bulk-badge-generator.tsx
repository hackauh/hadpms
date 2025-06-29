"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { QrCode, Printer, AlertCircle } from "lucide-react"
import type { Participant } from "@/lib/db"

interface BulkBadgeGeneratorProps {
  participants: Participant[]
}

export function BulkBadgeGenerator({ participants }: BulkBadgeGeneratorProps) {
  const [open, setOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [generating, setGenerating] = useState(false)

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

  const getRoleColor = (role: string) => {
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

  const generateBadgeHTML = (participant: Participant, qrCodeUrl: string) => {
    const roleColors = {
      organizer: "from-purple-500 to-purple-700",
      volunteer: "from-green-500 to-green-700",
      guest: "from-orange-500 to-orange-700",
      participant: "from-blue-500 to-blue-700",
    }

    const gradientClass = roleColors[participant.user_role as keyof typeof roleColors] || roleColors.participant

    const formatDate = (dateString: string | undefined) => {
      if (!dateString) return "N/A"
      try {
        return new Date(dateString).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      } catch {
        return "N/A"
      }
    }

    return `
      <div class="badge-container" style="
        width: 350px; 
        height: 500px; 
        background: linear-gradient(to bottom right, var(--gradient-from), var(--gradient-to));
        padding: 24px; 
        border-radius: 8px; 
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        border: 4px solid white;
        page-break-after: always;
        margin-bottom: 20px;
        --gradient-from: ${gradientClass.includes("purple") ? "#8b5cf6" : gradientClass.includes("green") ? "#10b981" : gradientClass.includes("orange") ? "#f97316" : "#3b82f6"};
        --gradient-to: ${gradientClass.includes("purple") ? "#7c3aed" : gradientClass.includes("green") ? "#047857" : gradientClass.includes("orange") ? "#c2410c" : "#1d4ed8"};
      ">
        <div style="text-align: center; margin-bottom: 16px;">
          <div style="color: white; font-weight: bold; font-size: 18px; margin-bottom: 8px;">HACK ABU DHABI 2025</div>
          <div style="color: white; font-size: 14px; opacity: 0.9;">Nov 15-16 • ADNEC Centre</div>
        </div>
        
        <div style="background: white; border-radius: 8px; padding: 16px; text-align: center;">
          <div style="margin-bottom: 16px;">
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 128px; height: 128px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 4px;" />
          </div>
          
          <div style="margin-bottom: 8px;">
            <div style="font-size: 18px; font-weight: bold; color: #1f2937;">${participant.name}</div>
            ${participant.nickname ? `<div style="font-size: 14px; color: #4b5563;">"${participant.nickname}"</div>` : ""}
            ${participant.pronouns ? `<div style="font-size: 12px; color: #4b5563;">(${participant.pronouns})</div>` : ""}
          </div>
          
          <div style="margin-bottom: 8px;">
            <span style="
              display: inline-block;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 500;
              ${getRoleColor(participant.user_role || "participant")
                .replace("bg-", "background-color: ")
                .replace("text-", "color: ")};
            ">
              ${(participant.user_role || "participant").toUpperCase()}
            </span>
          </div>
          
          <div style="font-size: 12px; color: #4b5563; line-height: 1.4;">
            <div><strong>DOB:</strong> ${formatDate(participant.date_of_birth)}</div>
            <div><strong>ID:</strong> ${participant.qr_id}</div>
            ${participant.nationality ? `<div><strong>Nationality:</strong> ${participant.nationality}</div>` : ""}
            ${participant.city ? `<div><strong>City:</strong> ${participant.city}</div>` : ""}
          </div>
        </div>
        
        <div style="color: white; text-align: center; font-size: 12px; margin-top: 16px; opacity: 0.9;">
          World's Largest High-School Hackathon
        </div>
      </div>
    `
  }

  const handleBulkPrint = async () => {
    if (selectedIds.length === 0) return

    setGenerating(true)

    try {
      const selectedParticipants = safeParticipants.filter((p) => selectedIds.includes(p.id))
      const printWindow = window.open("", "_blank")
      if (!printWindow) return

      let badgesHTML = ""

      // Generate QR codes and HTML for each participant
      for (const participant of selectedParticipants) {
        const qrData = JSON.stringify({
          id: participant.id,
          qr_id: participant.qr_id,
          name: participant.name,
          email: participant.email,
          role: participant.user_role,
        })

        const encodedData = encodeURIComponent(qrData)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}&bgcolor=FFFFFF&color=000000&margin=10`

        badgesHTML += generateBadgeHTML(participant, qrCodeUrl)
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Event Badges - Bulk Print</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
                .badge-container { 
                  width: 3.5in !important; 
                  height: 5in !important; 
                  page-break-after: always;
                  display: block !important;
                }
                @page { 
                  size: 4in 6in; 
                  margin: 0.25in; 
                }
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 0;
              }
            </style>
          </head>
          <body>
            ${badgesHTML}
          </body>
        </html>
      `)

      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 1000) // Longer delay for QR codes to load
    } catch (error) {
      console.error("Failed to generate bulk badges:", error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <QrCode className="h-4 w-4 mr-2" />
          Bulk Badge Generator
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Bulk Badge Generator
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Select participants to generate printable ID badges with QR codes. Each badge includes name, role, DOB,
              pronouns, and a scannable QR code.
            </AlertDescription>
          </Alert>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all-badges"
              checked={selectedIds.length === safeParticipants.length && safeParticipants.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all-badges" className="text-sm font-medium">
              Select All ({safeParticipants.length} participants)
            </label>
          </div>

          <div className="max-h-60 overflow-y-auto border rounded-lg">
            {safeParticipants.map((participant) => (
              <div key={participant.id} className="flex items-center space-x-2 p-3 border-b last:border-b-0">
                <Checkbox
                  id={`badge-participant-${participant.id}`}
                  checked={selectedIds.includes(participant.id)}
                  onCheckedChange={(checked) => handleSelectParticipant(participant.id, checked as boolean)}
                />
                <div className="flex-1 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{participant.name}</div>
                    <div className="text-sm text-muted-foreground">{participant.email}</div>
                    <div className="text-xs text-muted-foreground font-mono">QR: {participant.qr_id}</div>
                  </div>
                  <Badge className={getRoleColor(participant.user_role || "participant")}>
                    {(participant.user_role || "participant").charAt(0).toUpperCase() +
                      (participant.user_role || "participant").slice(1)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {selectedIds.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800">
                {selectedIds.length} badge(s) selected for generation
              </div>
            </div>
          )}

          <div className="text-xs text-gray-500">
            <p>• Badge size: 3.5" × 5" (standard ID badge size)</p>
            <p>• Color-coded by role: Blue (Participant), Purple (Organizer), Green (Volunteer), Orange (Guest)</p>
            <p>• Recommended: Print on cardstock or badge paper</p>
            <p>• Each badge includes QR code for quick scanning</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={generating}>
            Cancel
          </Button>
          <Button onClick={handleBulkPrint} disabled={generating || selectedIds.length === 0} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            {generating ? "Generating..." : `Print ${selectedIds.length} Badge(s)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
