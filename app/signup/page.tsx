"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const onSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    const redirectTo = `${typeof window !== 'undefined' ? window.location.origin : ''}/login`
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    })
    setLoading(false)
    if (err) setError(err.message)
    else setMessage("Check your inbox to confirm your email, then sign in.")
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Create account</h1>
            <p className="text-sm text-neutral-600">Sign up with email and password</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSignup} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button disabled={loading} type="submit" className="w-full">{loading ? "Creating..." : "Create account"}</Button>
            {error && <p className="text-xs text-red-600 text-center">{error}</p>}
            {message && <p className="text-xs text-green-700 text-center">{message}</p>}
          </form>
          <p className="text-center text-sm text-neutral-600 mt-4">
            Already have an account? <Link href="/login" className="underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
