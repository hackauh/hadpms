"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, AlertCircle } from "lucide-react"

interface ManualAddParticipantProps {
  onParticipantAdded: () => void
}

export function ManualAddParticipant({ onParticipantAdded }: ManualAddParticipantProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nickname: "",
    pronouns: "",
    phone: "",
    whatsapp_number: "",
    address: "",
    city: "",
    state_province: "",
    zip_postal: "",
    country: "",
    nationality: "",
    date_of_birth: "",
    team_name: "",
    dietary_restrictions: "",
    t_shirt_size: "",
    parent_name: "",
    parent_email: "",
    emergency_phone: "",
    medical_allergies: "",
    how_heard: "Manual Entry",
    user_role: "participant",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const participantData = {
        ...formData,
        university: "High School",
        year_of_study: "High School",
        experience_level: "Beginner",
        skills: [],
        checked_in: false,
        checked_out: false,
        food_fulfilled: false,
        manually_added: true,
        age_certification: true,
      }

      const payload = Object.fromEntries(Object.entries(participantData).map(([k, v]) => [k, v === "" ? null : v]))

      const response = await fetch("/api/participants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add participant")
      }

      // Reset form
      setFormData({
        name: "",
        email: "",
        nickname: "",
        pronouns: "",
        phone: "",
        whatsapp_number: "",
        address: "",
        city: "",
        state_province: "",
        zip_postal: "",
        country: "",
        nationality: "",
        date_of_birth: "",
        team_name: "",
        dietary_restrictions: "",
        t_shirt_size: "",
        parent_name: "",
        parent_email: "",
        emergency_phone: "",
        medical_allergies: "",
        how_heard: "Manual Entry",
        user_role: "participant",
      })

      setOpen(false)
      onParticipantAdded()
      // Refresh the page to show new participant
      window.location.reload()
    } catch (error) {
      console.error("Failed to add participant:", error)
      setError(error instanceof Error ? error.message : "Failed to add participant")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Participant Manually
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Participant Manually</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => handleChange("nickname", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_role">User Role</Label>
              <Select value={formData.user_role} onValueChange={(value) => handleChange("user_role", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="participant">Participant</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                  <SelectItem value="volunteer">Volunteer</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pronouns">Pronouns</Label>
              <Select value={formData.pronouns} onValueChange={(value) => handleChange("pronouns", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pronouns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="he/him">he/him</SelectItem>
                  <SelectItem value="she/her">she/her</SelectItem>
                  <SelectItem value="they/them">they/them</SelectItem>
                  <SelectItem value="other">other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Participant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
