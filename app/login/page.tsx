"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Providers } from "@/components/providers"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function LoginContent() {
  const router = useRouter()
  const { login, isLoading, user } = useAuth()

  const handleLogin = async () => {
    login()
    // Wait for login to complete then redirect
    setTimeout(() => {
      router.push("/account")
    }, 600)
  }

  // Redirect if already logged in
  if (user) {
    router.push("/account")
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome to <span className="text-primary">UWAZI</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Sign in to save your questions and track legislation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              variant="outline"
              className="w-full gap-3 border-border bg-secondary py-6 text-secondary-foreground hover:bg-muted"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              Continue with Google
            </Button>
            
            <p className="text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Providers>
      <LoginContent />
    </Providers>
  )
}
