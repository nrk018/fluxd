"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState("")
  const [occupation, setOccupation] = useState("")
  const [earnings, setEarnings] = useState("")
  const [annualIncome, setAnnualIncome] = useState<string>("")
  const [city, setCity] = useState("")
  const [country] = useState("India")
  const [username, setUsername] = useState("")
  const [birthday, setBirthday] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push("/login")
        return
      }
      // Try load existing profile to prefill
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, occupation, earnings, city, country, username, birthday, phone, annual_income")
        .eq("user_id", data.user.id)
        .maybeSingle()
      if (profile) {
        setFullName(profile.full_name ?? "")
        setOccupation(profile.occupation ?? "")
        setEarnings(profile.earnings ?? "")
        setCity(profile.city ?? "")
        // country fixed to India
        setUsername(profile.username ?? "")
        setBirthday(profile.birthday ?? "")
        setPhone(profile.phone ?? "")
        if (profile.annual_income != null) setAnnualIncome(String(profile.annual_income))
      }
    })
  }, [router])

  const getIncomeCategory = (amount: number) => {
    if (amount < 300000) return "Economically Weaker Section (EWS)"
    if (amount < 600000) return "Lower Income Group (LIG)"
    if (amount < 1200000) return "Middle Income Group I (MIG-I)"
    if (amount < 1800000) return "Middle Income Group II (MIG-II)"
    return "High Income Group (HIG)"
  }

  // Derive income category from amount (INR per year)
  useEffect(() => {
    const amount = parseInt(annualIncome.replace(/[^0-9]/g, ""), 10)
    if (isNaN(amount)) return
    setEarnings(getIncomeCategory(amount))
  }, [annualIncome])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { data: session } = await supabase.auth.getUser()
    if (!session.user) {
      setLoading(false)
      router.push("/login")
      return
    }
    const amount = parseInt(annualIncome.replace(/[^0-9]/g, ''), 10)
    const { error: err } = await supabase.from("profiles").upsert(
      {
        user_id: session.user.id,
        full_name: fullName,
        occupation,
        earnings,
        city,
        country,
        username: username || null,
        birthday: birthday || null,
        phone: phone || null,
        annual_income: isNaN(amount) ? null : amount,
      },
      { onConflict: "user_id" }
    )
    setLoading(false)
    if (err) setError(err.message)
    else router.push("/")
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">Complete your profile</h1>
            <p className="text-sm text-neutral-600">Tell us a bit about you</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <select
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                required
                className="w-full h-11 px-3 rounded-md border border-neutral-300 bg-white focus:ring-2 focus:ring-green-300 focus:outline-none"
              >
                <option value="" disabled>Select your occupation</option>
                <option>Farmers & Rural Workers</option>
                <option>Students</option>
                <option>Small Business Owners / Entrepreneurs</option>
                <option>Salaried Employees</option>
                <option>Home Buyers</option>
                <option>Vehicle Buyers</option>
                <option>Freelancers / Gig Workers</option>
                <option>Startups / Early-Stage Founders</option>
                <option>Retirees / Pensioners</option>
                <option>Self-Help Groups (SHGs) / NGOs</option>
              </select>
            </div>
            <div>
              <Label htmlFor="income">Annual Income (INR)</Label>
              <Input id="income" type="number" min="0" step="1000" value={annualIncome} onChange={(e) => setAnnualIncome(e.target.value)} required />
              {earnings && (
                <p className="text-xs text-neutral-600 mt-2">Detected category: <span className="font-medium">{earnings}</span></p>
              )}
              <div className="mt-2">
                <Label htmlFor="earnCat">Income Category</Label>
                <select id="earnCat" value={earnings} onChange={(e)=>setEarnings(e.target.value)} className="w-full h-11 px-3 rounded-md border border-neutral-300 bg-white focus:ring-2 focus:ring-green-300 focus:outline-none">
                  <option value="">Select amount above to auto-select</option>
                  <option>Economically Weaker Section (EWS)</option>
                  <option>Lower Income Group (LIG)</option>
                  <option>Middle Income Group I (MIG-I)</option>
                  <option>Middle Income Group II (MIG-II)</option>
                  <option>High Income Group (HIG)</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input list="indian-cities" id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Start typing..." />
              <datalist id="indian-cities">
                <option>Delhi</option>
                <option>Mumbai</option>
                <option>Bengaluru</option>
                <option>Hyderabad</option>
                <option>Ahmedabad</option>
                <option>Chennai</option>
                <option>Kolkata</option>
                <option>Pune</option>
                <option>Jaipur</option>
                <option>Surat</option>
              </datalist>
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={country} disabled />
            </div>
            <div>
              <Label htmlFor="birthday">Birthday</Label>
              <Input id="birthday" type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Contact number</Label>
              <Input id="phone" type="tel" inputMode="numeric" pattern="[0-9]{10}" placeholder="10-digit mobile" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="username">Username (optional)</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
            <div className="md:col-span-2">
              <Button disabled={loading} type="submit" className="w-full">{loading ? "Saving..." : "Save and continue"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}


