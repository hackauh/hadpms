import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface Participant {
  id: number
  fillout_submission_id?: string
  name: string
  email: string
  phone?: string
  university?: string
  major?: string
  year_of_study?: string
  team_name?: string
  dietary_restrictions?: string
  t_shirt_size?: string
  github_username?: string
  linkedin_url?: string
  portfolio_url?: string
  experience_level?: string
  skills?: string[]
  checked_in: boolean
  checked_in_at?: string
  checked_out: boolean
  checked_out_at?: string
  created_at: string
  updated_at: string
  // Hack Abu Dhabi specific fields
  pronouns?: string
  nickname?: string
  address?: string
  city?: string
  state_province?: string
  zip_postal?: string
  country?: string
  whatsapp_number?: string
  date_of_birth?: string
  nationality?: string
  parent_name?: string
  parent_email?: string
  emergency_phone?: string
  medical_allergies?: string
  how_heard?: string
  age_certification?: boolean
  // New manual features
  qr_id: string
  food_fulfilled: boolean
  food_fulfilled_at?: string
  manually_added: boolean
  loops_contact_id?: string
  user_role: "participant" | "organizer" | "volunteer" | "guest"
}

function sanitize<T extends Record<string, any>>(obj: T): T {
  if (!obj || typeof obj !== "object") {
    return obj
  }

  const out: Record<string, any> = {}
  for (const [k, v] of Object.entries(obj)) {
    // Handle different types of empty values
    if (v === "" || v === null || v === undefined) {
      out[k] = null
    } else if (typeof v === "string" && v.trim() === "") {
      out[k] = null
    } else {
      out[k] = v
    }
  }
  return out as T
}

export async function getAllParticipants(): Promise<Participant[]> {
  try {
    console.log("Fetching all participants from database...")
    const result = await sql`
      SELECT * FROM participants 
      ORDER BY created_at DESC
    `
    console.log("Successfully fetched", result.length, "participants")
    return result as Participant[]
  } catch (error) {
    console.error("Error fetching participants:", error)
    // Return empty array instead of throwing
    return []
  }
}

export async function getParticipantById(id: number): Promise<Participant | null> {
  try {
    const result = await sql`
      SELECT * FROM participants 
      WHERE id = ${id}
    `
    return (result[0] as Participant) || null
  } catch (error) {
    console.error("Error fetching participant by ID:", error)
    return null
  }
}

export async function getParticipantByQrId(qrId: string): Promise<Participant | null> {
  try {
    const result = await sql`
      SELECT * FROM participants 
      WHERE qr_id = ${qrId}
    `
    return (result[0] as Participant) || null
  } catch (error) {
    console.error("Error fetching participant by QR ID:", error)
    return null
  }
}

export async function createParticipant(
  data: Omit<Participant, "id" | "created_at" | "updated_at" | "qr_id">,
): Promise<Participant | null> {
  data = sanitize(data)
  try {
    const result = await sql`
      INSERT INTO participants (
        fillout_submission_id, name, email, phone, university, major, 
        year_of_study, team_name, dietary_restrictions, t_shirt_size,
        github_username, linkedin_url, portfolio_url, experience_level,
        skills, checked_in, checked_out, pronouns, nickname, address,
        city, state_province, zip_postal, country, whatsapp_number,
        date_of_birth, nationality, parent_name, parent_email,
        emergency_phone, medical_allergies, how_heard, age_certification,
        food_fulfilled, manually_added, loops_contact_id, user_role, qr_id
      ) VALUES (
        ${data.fillout_submission_id}, ${data.name}, ${data.email}, ${data.phone},
        ${data.university}, ${data.major}, ${data.year_of_study}, ${data.team_name},
        ${data.dietary_restrictions}, ${data.t_shirt_size}, ${data.github_username},
        ${data.linkedin_url}, ${data.portfolio_url}, ${data.experience_level},
        ${data.skills}, ${data.checked_in}, ${data.checked_out}, ${data.pronouns},
        ${data.nickname}, ${data.address}, ${data.city}, ${data.state_province},
        ${data.zip_postal}, ${data.country}, ${data.whatsapp_number}, ${data.date_of_birth},
        ${data.nationality}, ${data.parent_name}, ${data.parent_email}, ${data.emergency_phone},
        ${data.medical_allergies}, ${data.how_heard}, ${data.age_certification},
        ${data.food_fulfilled}, ${data.manually_added}, ${data.loops_contact_id},
        ${data.user_role || "participant"}, 
        CONCAT('HAD-', UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)))
      )
      RETURNING *
    `
    return result[0] as Participant
  } catch (error) {
    console.error("Error creating participant:", error)
    return null
  }
}

export async function updateParticipant(id: number, data: Partial<Participant>): Promise<Participant | null> {
  data = sanitize(data)
  try {
    const result = await sql`
      UPDATE participants 
      SET 
        name = COALESCE(${data.name}, name),
        email = COALESCE(${data.email}, email),
        phone = COALESCE(${data.phone}, phone),
        university = COALESCE(${data.university}, university),
        major = COALESCE(${data.major}, major),
        year_of_study = COALESCE(${data.year_of_study}, year_of_study),
        team_name = COALESCE(${data.team_name}, team_name),
        dietary_restrictions = COALESCE(${data.dietary_restrictions}, dietary_restrictions),
        t_shirt_size = COALESCE(${data.t_shirt_size}, t_shirt_size),
        github_username = COALESCE(${data.github_username}, github_username),
        linkedin_url = COALESCE(${data.linkedin_url}, linkedin_url),
        portfolio_url = COALESCE(${data.portfolio_url}, portfolio_url),
        experience_level = COALESCE(${data.experience_level}, experience_level),
        skills = COALESCE(${data.skills}, skills),
        checked_in = COALESCE(${data.checked_in}, checked_in),
        checked_in_at = COALESCE(${data.checked_in_at}, checked_in_at),
        checked_out = COALESCE(${data.checked_out}, checked_out),
        checked_out_at = COALESCE(${data.checked_out_at}, checked_out_at),
        food_fulfilled = COALESCE(${data.food_fulfilled}, food_fulfilled),
        food_fulfilled_at = COALESCE(${data.food_fulfilled_at}, food_fulfilled_at),
        loops_contact_id = COALESCE(${data.loops_contact_id}, loops_contact_id),
        user_role = COALESCE(${data.user_role}, user_role),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] as Participant
  } catch (error) {
    console.error("Error updating participant:", error)
    return null
  }
}

export async function deleteParticipant(id: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM participants 
      WHERE id = ${id}
      RETURNING id
    `
    return result.length > 0
  } catch (error) {
    console.error("Error deleting participant:", error)
    return false
  }
}

export async function checkInParticipant(id: number): Promise<Participant | null> {
  try {
    const result = await sql`
      UPDATE participants 
      SET 
        checked_in = true,
        checked_in_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] as Participant
  } catch (error) {
    console.error("Error checking in participant:", error)
    return null
  }
}

export async function checkOutParticipant(id: number): Promise<Participant | null> {
  try {
    const result = await sql`
      UPDATE participants 
      SET 
        checked_out = true,
        checked_out_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] as Participant
  } catch (error) {
    console.error("Error checking out participant:", error)
    return null
  }
}

export async function fulfillFood(id: number): Promise<Participant | null> {
  try {
    const result = await sql`
      UPDATE participants 
      SET 
        food_fulfilled = true,
        food_fulfilled_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    return result[0] as Participant
  } catch (error) {
    console.error("Error fulfilling food:", error)
    return null
  }
}

export async function getStats() {
  try {
    const totalResult = await sql`SELECT COUNT(*) as total FROM participants`
    const checkedInResult = await sql`SELECT COUNT(*) as checked_in FROM participants WHERE checked_in = true`
    const checkedOutResult = await sql`SELECT COUNT(*) as checked_out FROM participants WHERE checked_out = true`
    const foodFulfilledResult =
      await sql`SELECT COUNT(*) as food_fulfilled FROM participants WHERE food_fulfilled = true`
    const manuallyAddedResult =
      await sql`SELECT COUNT(*) as manually_added FROM participants WHERE manually_added = true`
    const roleStatsResult = await sql`
      SELECT user_role, COUNT(*) as count 
      FROM participants 
      GROUP BY user_role
    `

    const roleStats = roleStatsResult.reduce((acc: any, row: any) => {
      acc[row.user_role] = Number.parseInt(row.count)
      return acc
    }, {})

    return {
      total: Number.parseInt(totalResult[0].total),
      checkedIn: Number.parseInt(checkedInResult[0].checked_in),
      checkedOut: Number.parseInt(checkedOutResult[0].checked_out),
      notCheckedIn: Number.parseInt(totalResult[0].total) - Number.parseInt(checkedInResult[0].checked_in),
      foodFulfilled: Number.parseInt(foodFulfilledResult[0].food_fulfilled),
      manuallyAdded: Number.parseInt(manuallyAddedResult[0].manually_added),
      participants: roleStats.participant || 0,
      organizers: roleStats.organizer || 0,
      volunteers: roleStats.volunteer || 0,
      guests: roleStats.guest || 0,
    }
  } catch (error) {
    console.error("Error getting stats:", error)
    return {
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
    }
  }
}
