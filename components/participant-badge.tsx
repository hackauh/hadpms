"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { QrCode, Printer, Download } from "lucide-react"
import type { Participant } from "@/lib/db"

interface ParticipantBadgeProps {
  participant: Participant
}

export function ParticipantBadge({ participant }: ParticipantBadgeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const badgeRef = useRef<HTMLDivElement>(null)

  const generateQRCode = () => {
    const qrData = JSON.stringify({
      id: participant.id,
      qr_id: participant.qr_id,
      name: participant.name,
      email: participant.email,
      role: participant.user_role,
    })

    const encodedData = encodeURIComponent(qrData)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedData}&bgcolor=FFFFFF&color=000000&margin=10`
    setQrCodeUrl(qrUrl)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "organizer":
        return {
          bg: "bg-gradient-to-br from-purple-500 to-purple-700",
          text: "text-white",
          accent: "border-purple-300",
          badge: "bg-purple-100 text-purple-800",
        }
      case "volunteer":
        return {
          bg: "bg-gradient-to-br from-green-500 to-green-700",
          text: "text-white",
          accent: "border-green-300",
          badge: "bg-green-100 text-green-800",
        }
      case "guest":
        return {
          bg: "bg-gradient-to-br from-orange-500 to-orange-700",
          text: "text-white",
          accent: "border-orange-300",
          badge: "bg-orange-100 text-orange-800",
        }
      default:
        return {
          bg: "bg-gradient-to-br from-blue-500 to-blue-700",
          text: "text-white",
          accent: "border-blue-300",
          badge: "bg-blue-100 text-blue-800",
        }
    }
  }

  const roleColors = getRoleColor(participant.user_role || "participant")

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

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow || !badgeRef.current) return

    const badgeHTML = badgeRef.current.outerHTML

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Event Badge - ${participant.name}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              .badge-container { 
                width: 3.5in; 
                height: 5in; 
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
            .badge-container {
              width: 350px;
              height: 500px;
              margin: 0 auto;
            }
            ${getInlineStyles()}
          </style>
        </head>
        <body>
          ${badgeHTML}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const getInlineStyles = () => `
    .bg-gradient-to-br { background: linear-gradient(to bottom right, var(--tw-gradient-stops)); }
    .from-purple-500 { --tw-gradient-from: #8b5cf6; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(139, 92, 246, 0)); }
    .to-purple-700 { --tw-gradient-to: #7c3aed; }
    .from-green-500 { --tw-gradient-from: #10b981; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(16, 185, 129, 0)); }
    .to-green-700 { --tw-gradient-to: #047857; }
    .from-orange-500 { --tw-gradient-from: #f97316; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(249, 115, 22, 0)); }
    .to-orange-700 { --tw-gradient-to: #c2410c; }
    .from-blue-500 { --tw-gradient-from: #3b82f6; --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(59, 130, 246, 0)); }
    .to-blue-700 { --tw-gradient-to: #1d4ed8; }
    .text-white { color: white; }
    .text-center { text-align: center; }
    .font-bold { font-weight: bold; }
    .text-lg { font-size: 1.125rem; }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.75rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .p-6 { padding: 1.5rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .border-4 { border-width: 4px; }
    .border-white { border-color: white; }
    .bg-white { background-color: white; }
    .text-gray-800 { color: #1f2937; }
    .text-gray-600 { color: #4b5563; }
    .opacity-90 { opacity: 0.9; }
    .shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
  `

  const handleDownload = async () => {
    if (!badgeRef.current) return

    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(badgeRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      })

      const link = document.createElement("a")
      link.download = `badge-${participant.qr_id}-${participant.name.replace(/\s+/g, "-")}.png`
      link.href = canvas.toDataURL()
      link.click()
    } catch (error) {
      console.error("Failed to download badge:", error)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={generateQRCode}>
          <QrCode className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Event Badge - {participant.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Badge Preview */}
          <div
            ref={badgeRef}
            className={`badge-container w-full max-w-sm mx-auto ${roleColors.bg} p-6 rounded-lg shadow-2xl border-4 border-white`}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <div className={`${roleColors.text} font-bold text-lg mb-2`}>HACK ABU DHABI 2025</div>
              <div className={`${roleColors.text} text-sm opacity-90`}>Nov 15-16 • ADNEC Centre</div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-lg p-4 text-center">
              {/* QR Code */}
              {qrCodeUrl && (
                <div className="mb-4">
                  <img
                    src={qrCodeUrl || "/placeholder.svg"}
                    alt={`QR Code for ${participant.name}`}
                    className="w-32 h-32 mx-auto border border-gray-200 rounded"
                    crossOrigin="anonymous"
                  />
                </div>
              )}

              {/* Participant Info */}
              <div className="space-y-2">
                <div className="text-lg font-bold text-gray-800">{participant.name}</div>

                {participant.nickname && <div className="text-sm text-gray-600">"{participant.nickname}"</div>}

                {participant.pronouns && <div className="text-xs text-gray-600">({participant.pronouns})</div>}

                <div className="flex justify-center mb-2">
                  <Badge className={roleColors.badge}>{(participant.user_role || "participant").toUpperCase()}</Badge>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div>
                    <strong>DOB:</strong> {formatDate(participant.date_of_birth)}
                  </div>
                  <div>
                    <strong>ID:</strong> {participant.qr_id}
                  </div>
                  {participant.nationality && (
                    <div>
                      <strong>Nationality:</strong> {participant.nationality}
                    </div>
                  )}
                  {participant.city && (
                    <div>
                      <strong>City:</strong> {participant.city}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className={`${roleColors.text} text-center text-xs mt-4 opacity-90`}>
              World's Largest High-School Hackathon
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-center">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print Badge
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1 bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Print Instructions */}
          <div className="text-xs text-gray-500 text-center">
            <p>Badge size: 3.5" × 5" (standard ID badge size)</p>
            <p>Recommended: Print on cardstock or badge paper</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
