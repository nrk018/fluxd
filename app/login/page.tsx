"use client"

import { AuthCard } from "@/components/auth-card"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setLoading(false)
      setError(err.message)
      return
    }
    // Check for existing profile; if found, go home, else onboarding
    const { data: userRes } = await supabase.auth.getUser()
    const userId = userRes.user?.id
    if (!userId) {
      setLoading(false)
      window.location.href = "/login"
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    setLoading(false)
    window.location.href = profile ? '/' : '/onboarding'
  }
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Sign in</h1>
            <p className="text-sm text-neutral-600">Use your email and password</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onEmailLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button disabled={loading} type="submit" className="w-full">{loading ? "Signing in..." : "Sign in"}</Button>
            {error && <p className="text-xs text-red-600 text-center">{error}</p>}
          </form>
          <p className="text-center text-sm text-neutral-600 mt-4">
            Don’t have an account? <Link href="/signup" className="underline">Sign up</Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
