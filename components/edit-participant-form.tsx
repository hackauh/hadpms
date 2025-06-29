"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Participant } from "@/lib/db"

interface EditParticipantFormProps {
  participant: Participant
  onUpdate: () => void
}

export function EditParticipantForm({ participant, onUpdate }: EditParticipantFormProps) {
  const [formData, setFormData] = useState({
    name: participant.name || "",
    email: participant.email || "",
    nickname: participant.nickname || "",
    pronouns: participant.pronouns || "",
    phone: participant.phone || "",
    whatsapp_number: participant.whatsapp_number || "",
    address: participant.address || "",
    city: participant.city || "",
    state_province: participant.state_province || "",
    zip_postal: participant.zip_postal || "",
    country: participant.country || "",
    nationality: participant.nationality || "",
    date_of_birth: participant.date_of_birth || "",
    team_name: participant.team_name || "",
    dietary_restrictions: participant.dietary_restrictions || "",
    t_shirt_size: participant.t_shirt_size || "",
    parent_name: participant.parent_name || "",
    parent_email: participant.parent_email || "",
    emergency_phone: participant.emergency_phone || "",
    medical_allergies: participant.medical_allergies || "",
    how_heard: participant.how_heard || "",
    user_role: participant.user_role || "participant",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/participants/${participant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onUpdate()
      }
    } catch (error) {
      console.error("Failed to update participant:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nickname">Nickname</Label>
          <Input id="nickname" value={formData.nickname} onChange={(e) => handleChange("nickname", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
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
          <Input id="pronouns" value={formData.pronouns} onChange={(e) => handleChange("pronouns", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
          <Input
            id="whatsapp_number"
            value={formData.whatsapp_number}
            onChange={(e) => handleChange("whatsapp_number", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            value={formData.nationality}
            onChange={(e) => handleChange("nationality", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date_of_birth">Date of Birth</Label>
        <Input
          id="date_of_birth"
          type="date"
          value={formData.date_of_birth}
          onChange={(e) => handleChange("date_of_birth", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={formData.city} onChange={(e) => handleChange("city", e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state_province">State/Province</Label>
          <Input
            id="state_province"
            value={formData.state_province}
            onChange={(e) => handleChange("state_province", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip_postal">Zip/Postal Code</Label>
          <Input
            id="zip_postal"
            value={formData.zip_postal}
            onChange={(e) => handleChange("zip_postal", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input id="country" value={formData.country} onChange={(e) => handleChange("country", e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="team_name">Team Name</Label>
          <Input
            id="team_name"
            value={formData.team_name}
            onChange={(e) => handleChange("team_name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="t_shirt_size">T-Shirt Size</Label>
          <Select value={formData.t_shirt_size} onValueChange={(value) => handleChange("t_shirt_size", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="XS">XS</SelectItem>
              <SelectItem value="S">S</SelectItem>
              <SelectItem value="M">M</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="XL">XL</SelectItem>
              <SelectItem value="XXL">XXL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
        <Textarea
          id="dietary_restrictions"
          value={formData.dietary_restrictions}
          onChange={(e) => handleChange("dietary_restrictions", e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold">Parent/Guardian Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="parent_name">Parent/Guardian Name</Label>
            <Input
              id="parent_name"
              value={formData.parent_name}
              onChange={(e) => handleChange("parent_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent_email">Parent/Guardian Email</Label>
            <Input
              id="parent_email"
              type="email"
              value={formData.parent_email}
              onChange={(e) => handleChange("parent_email", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergency_phone">Emergency Phone Number</Label>
          <Input
            id="emergency_phone"
            value={formData.emergency_phone}
            onChange={(e) => handleChange("emergency_phone", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="medical_allergies">Medical Allergies/Dietary Concerns</Label>
        <Textarea
          id="medical_allergies"
          value={formData.medical_allergies}
          onChange={(e) => handleChange("medical_allergies", e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="how_heard">How did you hear about Hack Abu Dhabi?</Label>
        <Textarea
          id="how_heard"
          value={formData.how_heard}
          onChange={(e) => handleChange("how_heard", e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Participant"}
        </Button>
      </div>
    </form>
  )
}
