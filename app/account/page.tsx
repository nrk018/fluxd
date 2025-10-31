"use client"

import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useEffect, useState } from "react"

export const dynamic = 'force-dynamic'

export default function AccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState<string>("")
  const [profile, setProfile] = useState<any>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [files, setFiles] = useState<any[]>([])
  const [eligibility, setEligibility] = useState<any | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        if (!data.user) {
          router.push('/login')
          return
        }
        setEmail(data.user.email || '')
        const { data: prof, error: perr } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle()
        if (perr) console.warn('profiles select error:', perr)
        if (active) setProfile(prof)
        // Load recent loan files
        const { data: lf } = await supabase
          .from('loan_files')
          .select('id, data, eligibility_score, confidence, status, created_at')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false })
          .limit(6)
        if (active) setFiles(lf || [])
        const { data: elig } = await supabase
          .from('eligibility')
          .select('*')
          .eq('user_id', data.user.id)
          .maybeSingle()
        if (active) setEligibility(elig || null)
      } catch (e) {
        console.error('Failed to load profile', e)
        if (active) setLoadError('Could not load your profile. Try editing it or contact support.')
      } finally {
        if (active) setLoading(false)
      }
    }
    // Add a 6s safety timeout so UI never spins forever
    const timeout = setTimeout(() => active && setLoading(false), 6000)
    load()
    return () => { active = false; clearTimeout(timeout) }
  }, [router])

  const labelCls = "text-xs uppercase tracking-widest text-neutral-500"
  const valueCls = "text-base md:text-lg font-semibold text-black"

  return (
    <main className="min-h-screen bg-[rgba(255,255,255,0.6)] backdrop-blur-xl">
      <section className="relative max-w-[1500px] mx-auto px-6 md:px-8 py-10 border-x border-t border-b border-neutral-200">
        {/* Grid overlay aligned to container edges */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {/* Vertical edges already by border-x; add subtle inner guides if needed later */}
          {/* Horizontal lines (top/bottom) are border-t/b on section */}
        </div>
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">My Account</h1>
          <p className="text-neutral-600 mt-2">Manage your profile and view your details.</p>
        </div>

        {loading ? (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 rounded-xl border border-neutral-200 bg-white/40 backdrop-blur-md p-6 animate-pulse h-64" />
              <div className="lg:col-span-5 rounded-xl border border-neutral-200 bg-white/40 backdrop-blur-md p-6 animate-pulse h-64" />
            </div>
            {/* Eligibility snapshot */}
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-neutral-700 mb-3">Eligibility (saved)</h2>
              {!eligibility ? (
                <div className="rounded-xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6 text-sm text-neutral-600">No eligibility form saved yet.</div>
              ) : (
                <div className="rounded-xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div><span className="text-neutral-600">Name</span><div className="font-semibold">{eligibility.full_name || '—'}</div></div>
                  <div><span className="text-neutral-600">DOB</span><div className="font-semibold">{eligibility.dob || '—'}</div></div>
                  <div><span className="text-neutral-600">City</span><div className="font-semibold">{eligibility.city || '—'}</div></div>
                  <div><span className="text-neutral-600">Employment</span><div className="font-semibold">{eligibility.employment_type || '—'}</div></div>
                  <div><span className="text-neutral-600">Monthly income</span><div className="font-semibold">{eligibility.monthly_income || '—'}</div></div>
                  <div><span className="text-neutral-600">Loan type</span><div className="font-semibold">{eligibility.loan_type || '—'}</div></div>
                  <div><span className="text-neutral-600">Loan amount</span><div className="font-semibold">{eligibility.loan_amount || '—'}</div></div>
                  <div><span className="text-neutral-600">Eligibility score</span><div className="font-semibold">{eligibility.eligibility_score ?? '—'}</div></div>
                  <div className="md:col-span-2 flex items-center gap-2">
                    <span className="text-neutral-600">Verification</span>
                    {eligibility.verified === 'yes' ? (
                      <span className="inline-flex items-center gap-1 text-green-700 text-sm">
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                        Verified
                      </span>
                    ) : (
                      <span className="text-neutral-600 text-sm">Not verified</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left large card */}
            <div className="lg:col-span-7 rounded-xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6">
              {loadError ? (
                <div className="text-red-600 text-sm">{loadError}</div>
              ) : !profile ? (
                <div className="space-y-3">
                  <p className="text-neutral-700">No profile found. Complete your profile to personalize your experience.</p>
                  <a href="/onboarding" className="inline-flex items-center justify-center h-10 px-4 rounded-md bg-black text-white hover:opacity-90">Complete profile</a>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <div className={labelCls}>Full name</div>
                  <div className={valueCls}>{profile?.full_name || '—'}</div>
                </div>
                <div>
                  <div className={labelCls}>Email</div>
                  <div className={valueCls}>{email || '—'}</div>
                </div>
                <div>
                  <div className={labelCls}>Username</div>
                  <div className={valueCls}>{profile?.username || '—'}</div>
                </div>
                <div>
                  <div className={labelCls}>Occupation</div>
                  <div className={valueCls}>{profile?.occupation || '—'}</div>
                </div>
                <div>
                  <div className={labelCls}>Income category</div>
                  <div className={valueCls}>{profile?.earnings || '—'}</div>
                </div>
                <div>
                  <div className={labelCls}>Annual income (INR)</div>
                  <div className={valueCls}>{profile?.annual_income != null ? String(profile.annual_income) : '—'}</div>
                </div>
                <div>
                  <div className={labelCls}>Birthday</div>
                  <div className={valueCls}>{profile?.birthday || '—'}</div>
                </div>
                <div>
                  <div className={labelCls}>Phone</div>
                  <div className={valueCls}>{profile?.phone || '—'}</div>
                </div>
                <div>
                  <div className={labelCls}>Location</div>
                  <div className={valueCls}>{[profile?.city, profile?.country || 'India'].filter(Boolean).join(', ') || '—'}</div>
                </div>
                {/* Render any extra columns to ensure nothing is hidden */}
                {Object.entries(profile).filter(([k]) => !['user_id','full_name','occupation','earnings','city','country','username','birthday','phone','created_at','updated_at'].includes(k)).map(([k,v]) => (
                  <div key={k} className="md:col-span-2">
                    <div className={labelCls}>{k.replace(/_/g,' ')}</div>
                    <div className={valueCls}>{String(v ?? '—')}</div>
                  </div>
                ))}
              </div>
              )}
            </div>

            {/* Right actions card */}
            <div className="lg:col-span-5 rounded-xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6 flex flex-col gap-4">
              <a href="/onboarding" className="w-full text-center h-11 rounded-md border border-neutral-300 hover:bg-neutral-50 inline-flex items-center justify-center">Edit profile</a>
              <button onClick={() => router.push('/')} className="w-full h-11 rounded-md border border-neutral-300 hover:bg-neutral-50">Back Home</button>
              <button
                onClick={async () => { try { await supabase.auth.signOut() } finally { window.location.href = '/' } }}
                className="w-full h-11 rounded-md bg-black text-white hover:opacity-90"
              >Log out</button>
            </div>
          </div>
          {/* Recent files */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-neutral-700 mb-3">Saved loan files</h2>
            {files.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6 text-sm text-neutral-600">No files yet. Create one from Eligibility.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((r) => {
                  const type = r.data?.loan?.type || 'Loan File'
                  const amount = r.data?.loan?.amount || '—'
                  const score = r.eligibility_score ?? 0
                  const conf = Math.round((r.confidence ?? 0) * 100)
                  return (
                    <a key={r.id} href={`/account/files/${r.id}`} className="rounded-2xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-4 hover:bg-white/80 transition">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-semibold">{type}</div>
                        <span className="text-[10px] px-2 py-1 rounded-full uppercase tracking-widest border border-neutral-300">{r.status || 'pending'}</span>
                      </div>
                      <div className="text-sm text-neutral-800">Amount: <span className="font-semibold">{amount}</span></div>
                      <div className="text-xs text-neutral-600 mt-1">Eligibility: {score}% • Confidence: {conf}%</div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
          </>
        )}
      </section>
    </main>
  )
}


