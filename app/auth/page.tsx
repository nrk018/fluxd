"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navbar } from "@/components/navbar"
import { Github, Mail } from "lucide-react"

export default function AuthPage() {
  const [email, setEmail] = useState("")

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-20">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
            <p className="text-muted-foreground">Join Fluxd to get started with intelligent financial advice</p>
          </div>

          <div className="space-y-3">
            <Button variant="outline" className="w-full bg-transparent" size="lg">
              <Github className="w-4 h-4 mr-2" />
              Sign up with GitHub
            </Button>
            <Button variant="outline" className="w-full bg-transparent" size="lg">
              <Mail className="w-4 h-4 mr-2" />
              Sign up with Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="gh-input"
              />
            </div>
            <Button type="submit" className="w-full" size="lg">
              Continue
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
