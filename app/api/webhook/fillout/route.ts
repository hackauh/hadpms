import { type NextRequest, NextResponse } from "next/server"
import { createParticipant, updateParticipant } from "@/lib/db"
import { createLoopsContact } from "@/lib/loops"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Fillout webhook payload structure
    const { submissionId, questions } = body

    // Map Fillout form fields to our participant structure
    const participantData = {
      fillout_submission_id: submissionId,
      name: getAnswerByTitle(questions, "What's your full name?") || "",
      email: getAnswerByTitle(questions, "What is your email?") || "",
      phone: getAnswerByTitle(questions, "What's the best phone number to reach you at?"),
      university: "High School", // Since this is for high school students
      major: getAnswerByTitle(questions, "What should we call you?"), // Using nickname field
      year_of_study: "High School",
      team_name: null, // Will be assigned later
      dietary_restrictions: getAnswerByTitle(questions, "Dietary Restrictions?"),
      t_shirt_size: getAnswerByTitle(questions, "T-Shirt Size"),
      github_username: null,
      linkedin_url: null,
      portfolio_url: null,
      experience_level: "Beginner", // Default for high school
      skills: [],
      checked_in: false,
      checked_out: false,
      food_fulfilled: false,
      manually_added: false,
      // Additional fields specific to this hackathon
      pronouns: getAnswerByTitle(questions, "Please select your pronouns:"),
      nickname: getAnswerByTitle(questions, "What should we call you?"),
      address: getAnswerByTitle(questions, "Address (What's your home address?)"),
      city: getAnswerByTitle(questions, "City (What's your home address?)"),
      state_province: getAnswerByTitle(questions, "State/Province (What's your home address?)"),
      zip_postal: getAnswerByTitle(questions, "Zip/Postal code (What's your home address?)"),
      country: getAnswerByTitle(questions, "Country (What's your home address?)"),
      whatsapp_number: getAnswerByTitle(questions, "What's your WhatsApp Number? (Optional)"),
      date_of_birth: getAnswerByTitle(questions, "Date of Birth"),
      nationality: getAnswerByTitle(questions, "What is your Nationality?"),
      parent_name: getAnswerByTitle(questions, "What is your parent's name?"),
      parent_email: getAnswerByTitle(questions, "What is the best email for your parent?"),
      emergency_phone: getAnswerByTitle(questions, "What's the best emergency phone number for you?"),
      medical_allergies: getAnswerByTitle(
        questions,
        "Do you have any medical allergies, allergies or dietary concerns?",
      ),
      how_heard: getAnswerByTitle(questions, "How did you hear about Hack Abu Dhabi?"),
      age_certification:
        getAnswerByTitle(
          questions,
          "I certify that I'm currently enrolled in secondary school / high school and that I'm under 19 years of age.",
        ) === "Yes",
    }

    // Create participant in database
    const participant = await createParticipant(participantData)

    // Create Loops contact for email marketing
    if (participant.email) {
      const loopsContactId = await createLoopsContact({
        email: participant.email,
        firstName: participant.name.split(" ")[0],
        lastName: participant.name.split(" ").slice(1).join(" "),
        userGroup: "hackathon-participants",
        userId: participant.id.toString(),
        nationality: participant.nationality,
        city: participant.city,
        qrId: participant.qr_id,
        registrationSource: "fillout-form",
      })

      if (loopsContactId) {
        // Update participant with Loops contact ID
        await updateParticipant(participant.id, { loops_contact_id: loopsContactId })
      }
    }

    return NextResponse.json({
      success: true,
      participant: participant,
    })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ success: false, error: "Failed to process webhook" }, { status: 500 })
  }
}

function getAnswerByTitle(questions: any[], title: string): string | undefined {
  const question = questions.find((q) => q.title === title)
  return question?.answer
}
