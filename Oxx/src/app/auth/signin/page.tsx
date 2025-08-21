"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignIn() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession()
      if (session) {
        router.push("/")
      }
    }
    checkSession()
  }, [router])

  const handleSignIn = async () => {
    setLoading(true)
    try {
      await signIn("credentials", { redirect: false })
      router.push("/")
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Oxlas AI Workspace</CardTitle>
          <CardDescription>
            Sign in to access your AI-powered workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleSignIn} 
            disabled={loading}
            className="w-full"
          >
            {loading ? "Signing in..." : "Sign In as Developer"}
          </Button>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            This is a development environment. No authentication required.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}