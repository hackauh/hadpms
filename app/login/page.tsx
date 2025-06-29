import { LoginForm } from "@/components/login-form"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"

interface LoginPageProps {
  searchParams: { error?: string }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  console.log("=== LOGIN PAGE ===")
  console.log("Search params:", searchParams)

  // Check if user is already logged in
  try {
    const user = await getCurrentUser()
    if (user) {
      console.log("User already logged in, redirecting to dashboard")
      redirect("/dashboard")
    }
  } catch (error) {
    console.log("No valid session found, showing login form")
  }

  return <LoginForm error={searchParams.error} />
}
