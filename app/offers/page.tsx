"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { SiteFooter } from "@/components/site-footer"

type Offer = {
  company: string
  loanType: string
  maxAmount: string
  interestRate: string
  tenure: string
  processingFee: string
  emi: string
  confidence: "high" | "medium" | "low"
  badges?: string[]
  documents?: string[]
  approvalTime?: string
}

export default function OffersPage() {
  const router = useRouter()
  const [greetingName, setGreetingName] = useState<string | null>(null)
  const [eligibility, setEligibility] = useState<any | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [filters, setFilters] = useState({ type: "", confidence: "", tenure: "" })

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

      const { data: elig } = await supabase
        .from('eligibility')
        .select('*')
        .eq('user_id', data.user.id)
        .maybeSingle()
      if (active) setEligibility(elig || null)

      setLoading(true)
      try {
        const r = await fetch('/api/loan-providers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eligibility: elig || {} }),
        })
        const data = await r.json()
        if (active) setOffers(data.providers || [])
      } catch (e) {
        console.error('Failed to fetch offers', e)
        // Even on error, API should return dummy data
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => { active = false }
  }, [router])

  const filtered = offers.filter((o) => {
    if (filters.type && !o.loanType.toLowerCase().includes(filters.type.toLowerCase())) return false
    if (filters.confidence && o.confidence !== filters.confidence) return false
    return true
  })

  const score = eligibility?.eligibility_score ?? 0
  const conf = eligibility?.confidence ?? 0
  const confLevel = score >= 80 ? "High" : score >= 60 ? "Medium" : "Low"

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
                { href: "/offers", label: "OFFERS", active: true },
                { href: "/#tracker", label: "TRACKER" },
                { href: "/#sanction", label: "SANCTION" },
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
      <section className="relative max-w-[1500px] mx-auto px-6 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 border-x border-t border-b border-neutral-200">
        {/* Main content */}
        <div className="lg:col-span-9 space-y-6">
          {/* Header */}
          <div className="rounded-2xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Your Personalized Loan Offers</h1>
                <p className="text-sm text-neutral-600">Based on your profile and eligibility, here are the best available plans for you.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-neutral-600 mb-1">AI Confidence</div>
                  <div className={`text-sm font-semibold ${score >= 80 ? 'text-green-700' : score >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>{confLevel}</div>
                </div>
                <div className="relative h-16 w-16">
                  <svg className="transform -rotate-90 h-16 w-16">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-neutral-200" />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${(score / 100) * 175.9} 175.9`}
                      className={score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold">{score}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Offers grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6 animate-pulse h-64" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6 text-center text-neutral-600">
              {!eligibility ? (
                <p>Complete your eligibility form first to see personalized offers.</p>
              ) : (
                <p>No offers found matching your criteria.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((offer, i) => (
                <OfferCard key={i} offer={offer} onView={() => setSelectedOffer(offer)} />
              ))}
            </div>
          )}

          {/* Comparison table */}
          {filtered.length > 0 && (
            <div className="rounded-xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-200">
                <h2 className="text-lg font-semibold">Loan Comparison</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/40 border-b border-neutral-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-neutral-600">Loan Type</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-neutral-600">Max Amount</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-neutral-600">Interest</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-neutral-600">Tenure</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-neutral-600">EMI</th>
                      <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-neutral-600">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o, i) => (
                      <tr key={i} className="border-b border-neutral-200 hover:bg-white/40">
                        <td className="px-4 py-3 font-medium">{o.loanType}</td>
                        <td className="px-4 py-3">{o.maxAmount}</td>
                        <td className="px-4 py-3">{o.interestRate}</td>
                        <td className="px-4 py-3">{o.tenure}</td>
                        <td className="px-4 py-3">{o.emi}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-1 rounded-full uppercase ${o.confidence === 'high' ? 'bg-green-500/20 text-green-800' : o.confidence === 'medium' ? 'bg-yellow-400/20 text-yellow-800' : 'bg-red-500/20 text-red-800'}`}>
                            {o.confidence}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Summary */}
          {eligibility && (
            <div className="rounded-xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-3">AI Summary</h2>
              <p className="text-sm text-neutral-700 leading-relaxed">
                Based on your profile, your repayment ability is {score >= 70 ? 'strong' : score >= 50 ? 'moderate' : 'needs improvement'}, 
                and you qualify for loans up to {eligibility.loan_amount || 'varying amounts'} based on the loan type.
              </p>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-4 sticky top-24">
            <h3 className="text-sm font-semibold mb-3">Filters</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 mb-1">Loan Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full h-9 rounded-md border border-neutral-200 px-2 text-sm"
                >
                  <option value="">All</option>
                  <option value="Personal">Personal</option>
                  <option value="Home">Home</option>
                  <option value="Business">Business</option>
                  <option value="Education">Education</option>
                  <option value="Vehicle">Vehicle</option>
                </select>
              </div>
              <div>
                <label className="block text-neutral-600 mb-1">Confidence</label>
                <select
                  value={filters.confidence}
                  onChange={(e) => setFilters({ ...filters, confidence: e.target.value })}
                  className="w-full h-9 rounded-md border border-neutral-200 px-2 text-sm"
                >
                  <option value="">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-200">
              <h3 className="text-xs uppercase tracking-widest text-neutral-600 mb-2">Voice Assistant</h3>
              <button
                onClick={() => window.open('https://elevenlabs.io/app/talk-to?agent_id=agent_1501k8v9c2m6eynbwwcc3ga4be1m', '_blank', 'noopener,noreferrer')}
                className="w-full h-10 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 text-sm"
              >
                Open agent
              </button>
            </div>

            <button
              onClick={() => {
                const content = filtered.map((o) => 
                  `${o.company} - ${o.loanType}: ${o.maxAmount} at ${o.interestRate}, EMI ${o.emi}, Tenure ${o.tenure}`
                ).join('\n')
                const blob = new Blob([content], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'loan-offers.txt'
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="mt-4 w-full h-10 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 text-sm"
            >
              Download Summary
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedOffer(null)}>
          <div className="rounded-xl border border-neutral-200 bg-white shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">{selectedOffer.company} - {selectedOffer.loanType}</h2>
              <button onClick={() => setSelectedOffer(null)} className="text-neutral-600 hover:text-black">✕</button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-neutral-600">Max Amount</span><div className="font-semibold">{selectedOffer.maxAmount}</div></div>
                <div><span className="text-neutral-600">Interest Rate</span><div className="font-semibold">{selectedOffer.interestRate}</div></div>
                <div><span className="text-neutral-600">Tenure</span><div className="font-semibold">{selectedOffer.tenure}</div></div>
                <div><span className="text-neutral-600">Processing Fee</span><div className="font-semibold">{selectedOffer.processingFee}</div></div>
                <div><span className="text-neutral-600">Monthly EMI</span><div className="font-semibold">{selectedOffer.emi}</div></div>
                <div><span className="text-neutral-600">Approval Time</span><div className="font-semibold">{selectedOffer.approvalTime || 'N/A'}</div></div>
              </div>
              {selectedOffer.documents && selectedOffer.documents.length > 0 && (
                <div>
                  <div className="text-neutral-600 mb-2">Required Documents</div>
                  <ul className="list-disc pl-5 space-y-1">
                    {selectedOffer.documents.map((d, i) => (
                      <li key={i} className="text-neutral-700">{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t border-neutral-200">
                <button onClick={() => router.push('/#sanction')} className="flex-1 h-11 rounded-md bg-black text-white text-sm hover:opacity-90">Apply Now</button>
                <button onClick={() => setSelectedOffer(null)} className="flex-1 h-11 rounded-md border border-neutral-300 hover:bg-neutral-50 text-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </main>
  )
}

function OfferCard({ offer, onView }: { offer: Offer; onView: () => void }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-semibold text-base mb-1">{offer.company}</div>
          <div className="text-xs text-neutral-600">{offer.loanType}</div>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full uppercase ${offer.confidence === 'high' ? 'bg-green-500/20 text-green-800' : offer.confidence === 'medium' ? 'bg-yellow-400/20 text-yellow-800' : 'bg-red-500/20 text-red-800'}`}>
          {offer.confidence}
        </span>
      </div>
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-neutral-600">Amount</span>
          <span className="font-semibold">{offer.maxAmount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Interest</span>
          <span className="font-semibold">{offer.interestRate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">EMI</span>
          <span className="font-semibold">{offer.emi}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600">Tenure</span>
          <span className="font-semibold">{offer.tenure}</span>
        </div>
      </div>
      {offer.badges && offer.badges.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {offer.badges.map((b, i) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-black/10 text-neutral-700">{b}</span>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <button onClick={onView} className="flex-1 h-9 rounded-md border border-neutral-300 hover:bg-neutral-50 text-xs">View Details</button>
        <button onClick={() => window.location.href = '/#sanction'} className="flex-1 h-9 rounded-md bg-black text-white text-xs hover:opacity-90">Apply Now</button>
      </div>
    </div>
  )
}

