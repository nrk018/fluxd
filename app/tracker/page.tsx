"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { TrackerTable } from "@/components/tracker-table"
import { SiteFooter } from "@/components/site-footer"
import Link from "next/link"

export const dynamic = 'force-dynamic'

type TrackerEntry = {
  id: string
  application_id: string
  loan_type: string
  amount: number
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'disbursed' | 'completed'
  progress: number
  next_step: string | null
  current_stage: string
  updated_at: string
}

export default function TrackerPage() {
  const router = useRouter()
  const [greetingName, setGreetingName] = useState<string | null>(null)
  const [entries, setEntries] = useState<TrackerEntry[]>([])
  const [loading, setLoading] = useState(true)
  // Calculator state
  const [amount, setAmount] = useState<number>(500000)
  const [interest, setInterest] = useState<number>(12)
  const [tenure, setTenure] = useState<number>(60)
  const [offers, setOffers] = useState<any[]>([])

  useEffect(() => {
    let active = true
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', data.user.id)
        .maybeSingle()
      if (active) setGreetingName(profile?.full_name ?? 'there')

      // Load tracker entries
      const { data: trackerData, error } = await supabase
        .from('tracker')
        .select('*')
        .eq('user_id', data.user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Failed to load tracker entries:', error)
      } else if (active) {
        setEntries((trackerData || []) as TrackerEntry[])
      }

      if (active) setLoading(false)
    }
    load()
    return () => { active = false }
  }, [router])

  const { emi, totalInterest, totalPayment } = useEmi(amount, interest, tenure)
  const suggestions = useSuggestions(amount, interest, tenure)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const r = await fetch('/api/loan-providers', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ eligibility: { loan_amount: amount, loan_type: 'Personal', monthly_income: 0 } })
        })
        const j = await r.json()
        if (active) setOffers(j?.providers || [])
      } catch {}
    })()
    return () => { active = false }
  }, [amount])

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Navbar */}
      <header className="sticky top-0 z-50 transition-transform duration-300">
        <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-[1500px] mx-auto px-8 py-4 flex justify-between items-center border-x border-neutral-200">
            <Link href="/" className="text-sm font-extrabold tracking-widest">FLUXD</Link>
            <ul className="hidden md:flex items-center gap-12">
              {[
                { href: "/eligibility", label: "ELIGIBILITY" },
                { href: "/verification", label: "VERIFICATION" },
                { href: "/offers", label: "OFFERS" },
                { href: "/tracker", label: "TRACKER", active: true },
                { href: "/account", label: "MY ACCOUNT" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={`text-xs transition-colors ${item.active ? 'text-black font-extrabold' : 'text-black hover:text-neutral-600'}`}>{item.label}</Link>
                </li>
              ))}
            </ul>
            {greetingName ? (
              <button onClick={() => router.push('/account')} className="text-xs uppercase tracking-widest">{`Hi, ${greetingName.split(' ')[0]}!`}</button>
            ) : (
              <button onClick={() => router.push('/login')} className="text-xs uppercase tracking-widest">SIGN IN</button>
            )}
          </div>
        </nav>
      </header>

      {/* Frame */}
      <section className="relative max-w-[1500px] mx-auto px-6 md:px-8 py-8 border-x border-t border-b border-neutral-200">
        {/* Interactive EMI Calculator */}
        <div className="rounded-2xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6 mb-6">
          <div className="flex items-start gap-6 flex-col lg:flex-row">
            {/* Controls */}
            <div className="flex-1 w-full">
              <h2 className="text-base font-semibold mb-4">Loan Calculator</h2>
              <SliderRow label="Loan Amount" value={`₹${amount.toLocaleString('en-IN')}`}>
                <input type="range" min={50000} max={5000000} step={10000} value={amount} onChange={(e)=>setAmount(Number(e.target.value))} className="w-full" />
              </SliderRow>
              <SliderRow label="Interest Rate" value={`${interest.toFixed(2)}%`}> 
                <input type="range" min={6} max={24} step={0.1} value={interest} onChange={(e)=>setInterest(Number(e.target.value))} className="w-full" />
              </SliderRow>
              <SliderRow label="Tenure" value={`${tenure} months`}>
                <input type="range" min={6} max={360} step={1} value={tenure} onChange={(e)=>setTenure(Number(e.target.value))} className="w-full" />
              </SliderRow>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-sm">
                <Stat k="EMI" v={`₹${Math.round(emi).toLocaleString('en-IN')}`} />
                <Stat k="Total Interest" v={`₹${Math.round(totalInterest).toLocaleString('en-IN')}`} />
                <Stat k="Total Payment" v={`₹${Math.round(totalPayment).toLocaleString('en-IN')}`} />
              </div>
            </div>
            {/* Pie chart */}
            <div className="w-full lg:w-64 flex flex-col items-center justify-center gap-3">
              <Donut principal={amount} interest={totalInterest} />
              <div className="text-xs text-neutral-600">Principal vs Interest</div>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="rounded-2xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold mb-4">Suggested Combinations (Lower EMI / Interest)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {suggestions.map((s, i) => (
              <button key={i} onClick={()=>{ setInterest(s.interest); setTenure(s.tenure); }} className="text-left rounded-xl border border-neutral-200 bg-white p-4 hover:bg-neutral-50">
                <div className="text-sm font-semibold mb-1">{s.title}</div>
                <div className="text-xs text-neutral-600">Rate: {s.interest.toFixed(2)}% • Tenure: {s.tenure} mo</div>
                <div className="text-sm mt-2">EMI: <span className="font-semibold">₹{Math.round(s.emi).toLocaleString('en-IN')}</span></div>
                <div className="text-xs text-neutral-600">Interest: ₹{Math.round(s.totalInterest).toLocaleString('en-IN')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Comparative Offers */}
        <div className="rounded-2xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6 mb-6">
          <h2 className="text-base font-semibold mb-4">Comparative Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {offers.slice(0,3).map((o, idx) => {
              const midRate = getMidRate(o.interestRate)
              const months = getMonths(o.tenure) || tenure
              const calc = computeEmi(amount, midRate, months)
              return (
                <div key={idx} className="rounded-xl border border-neutral-200 bg-white p-4">
                  <div className="text-sm font-semibold mb-1">{o.company}</div>
                  <div className="text-xs text-neutral-600">{o.loanType} • {o.interestRate} • {o.tenure}</div>
                  <div className="text-sm mt-2">EMI: <span className="font-semibold">₹{Math.round(calc.emi).toLocaleString('en-IN')}</span></div>
                  <div className="text-xs text-neutral-600">Interest: ₹{Math.round(calc.totalInterest).toLocaleString('en-IN')}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Existing Tracker Table */}
        {loading ? (
          <div className="h-64 rounded-2xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm animate-pulse" />
        ) : (
          <TrackerTable entries={entries} />
        )}
      </section>

      <SiteFooter />
    </main>
  )
}

function SliderRow({ label, value, children }: { label: string; value: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-neutral-600">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      {children}
    </div>
  )
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3">
      <div className="text-neutral-600 text-xs">{k}</div>
      <div className="font-semibold text-sm">{v}</div>
    </div>
  )
}

function Donut({ principal, interest }: { principal: number; interest: number }) {
  const total = Math.max(principal + interest, 1)
  const pctPrincipal = (principal / total) * 100
  const pctInterest = 100 - pctPrincipal
  const radius = 46
  const circumference = 2 * Math.PI * radius
  const strokeInterest = (pctInterest / 100) * circumference
  const strokePrincipal = circumference - strokeInterest
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" className="block">
      <circle cx="60" cy="60" r={radius} stroke="#e5e5e5" strokeWidth="10" fill="none" />
      <circle cx="60" cy="60" r={radius} stroke="#111111" strokeWidth="10" fill="none" strokeDasharray={`${strokeInterest} ${strokePrincipal}`} transform="rotate(-90 60 60)" />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12" fill="#111111">{Math.round(pctInterest)}% interest</text>
    </svg>
  )
}

function computeEmi(amount: number, annualRate: number, months: number) {
  const r = annualRate / 12 / 100
  if (r === 0) {
    const emi = amount / months
    return { emi, totalPayment: emi * months, totalInterest: emi * months - amount }
  }
  const f = Math.pow(1 + r, months)
  const emi = amount * r * f / (f - 1)
  const totalPayment = emi * months
  const totalInterest = totalPayment - amount
  return { emi, totalPayment, totalInterest }
}

function useEmi(amount: number, annualRate: number, months: number) {
  return useMemo(() => computeEmi(amount, annualRate, months), [amount, annualRate, months])
}

function useSuggestions(amount: number, interest: number, tenure: number) {
  return useMemo(() => {
    const candidates: Array<{ title: string; interest: number; tenure: number; emi: number; totalInterest: number }> = []
    const ranges = [
      { title: 'Lower Rate', ir: Math.max(6, interest - 1.5), tn: tenure },
      { title: 'Longer Tenure', ir: interest, tn: Math.min(360, tenure + 24) },
      { title: 'Balanced', ir: Math.max(6, interest - 0.75), tn: Math.min(360, tenure + 12) },
    ]
    for (const r of ranges) {
      const c = computeEmi(amount, r.ir, r.tn)
      candidates.push({ title: r.title, interest: r.ir, tenure: r.tn, emi: c.emi, totalInterest: c.totalInterest })
    }
    return candidates.sort((a,b)=> a.emi - b.emi)
  }, [amount, interest, tenure])
}

function getMidRate(text: string | undefined): number {
  if (!text) return 12
  const m = text.match(/(\d+\.?\d*)%\s*-\s*(\d+\.?\d*)%/)
  if (m) return (parseFloat(m[1]) + parseFloat(m[2]))/2
  const s = text.match(/(\d+\.?\d*)%/)
  return s ? parseFloat(s[1]) : 12
}

function getMonths(text: string | undefined): number | null {
  if (!text) return null
  const m1 = text.match(/(\d+)\s*months/i)
  if (m1) return parseInt(m1[1], 10)
  const m2 = text.match(/(\d+)\s*years?/i)
  if (m2) return parseInt(m2[1], 10) * 12
  return null
}

