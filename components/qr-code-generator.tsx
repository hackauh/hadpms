"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { QrCode } from "lucide-react"
import type { Participant } from "@/lib/db"

interface QRCodeGeneratorProps {
  participant: Participant
}

export function QRCodeGenerator({ participant }: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  const generateQRCode = () => {
    // Using QR Server API for QR code generation
    const qrData = JSON.stringify({
      id: participant.id,
      qr_id: participant.qr_id,
      name: participant.name,
      email: participant.email,
    })

    const encodedData = encodeURIComponent(qrData)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodedData}`
    setQrCodeUrl(qrUrl)
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
          <DialogTitle>QR Code for {participant.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">QR ID: {participant.qr_id}</p>
            <p className="text-xs text-muted-foreground">{participant.email}</p>
          </div>
          {qrCodeUrl && (
            <div className="border rounded-lg p-4">
              <img
                src={qrCodeUrl || "/placeholder.svg"}
                alt={`QR Code for ${participant.name}`}
                className="w-64 h-64"
              />
            </div>
          )}
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (qrCodeUrl) {
                  const link = document.createElement("a")
                  link.href = qrCodeUrl
                  link.download = `qr-${participant.qr_id}.png`
                  link.click()
                }
              }}
              disabled={!qrCodeUrl}
            >
              Download QR Code
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
