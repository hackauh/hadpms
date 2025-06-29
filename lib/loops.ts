// Loops.so integration for email marketing
const LOOPS_API_KEY = process.env.LOOPS_API_KEY
const LOOPS_BASE_URL = "https://app.loops.so/api/v1"

export interface LoopsContact {
  email: string
  firstName?: string
  lastName?: string
  userGroup?: string
  userId?: string
  [key: string]: any
}

export async function createLoopsContact(contact: LoopsContact): Promise<string | null> {
  if (!LOOPS_API_KEY) {
    console.warn("LOOPS_API_KEY not configured")
    return null
  }

  try {
    const response = await fetch(`${LOOPS_BASE_URL}/contacts/create`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contact),
    })

    if (response.ok) {
      const data = await response.json()
      return data.id
    } else {
      console.error("Failed to create Loops contact:", await response.text())
      return null
    }
  } catch (error) {
    console.error("Error creating Loops contact:", error)
    return null
  }
}

export async function updateLoopsContact(contactId: string, updates: Partial<LoopsContact>): Promise<boolean> {
  if (!LOOPS_API_KEY) {
    console.warn("LOOPS_API_KEY not configured")
    return false
  }

  try {
    const response = await fetch(`${LOOPS_BASE_URL}/contacts/update`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: contactId,
        ...updates,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error updating Loops contact:", error)
    return false
  }
}

export async function sendLoopsEvent(
  email: string,
  eventName: string,
  eventProperties?: Record<string, any>,
): Promise<boolean> {
  if (!LOOPS_API_KEY) {
    console.warn("LOOPS_API_KEY not configured")
    return false
  }

  try {
    const response = await fetch(`${LOOPS_BASE_URL}/events/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOOPS_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        eventName,
        eventProperties,
      }),
    })

    return response.ok
  } catch (error) {
    console.error("Error sending Loops event:", error)
    return false
  }
}
