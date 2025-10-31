"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { SiteFooter } from "@/components/site-footer"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export const dynamic = 'force-dynamic'

type Msg = { role: "user" | "assistant"; text: string }

export default function EligibilityPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi! I’m your loan eligibility assistant. Tell me what you’re looking for." },
  ])
  const [input, setInput] = useState("")

  const [file, setFile] = useState({
    personal: { fullName: "", dob: "", gender: "", city: "", state: "", address: "", contact: "", email: "" },
    employment: { type: "", employer: "", title: "", experienceYears: "", monthlyIncome: "", verification: "" },
    financial: { existingLoans: "", totalEmi: "", monthlyExpenses: "", bankAccountType: "", creditScore: "", annualIncome: "" },
    loan: { type: "", amount: "", tenure: "", purpose: "", startDate: "", collateral: "" },
    additional: { residentialType: "", dependents: "", panOrAadhaar: "", maritalStatus: "" },
    insights: { score: 0, confidence: 0, tone: "—" },
  })

  const [typing, setTyping] = useState(false)
  const [greetingName, setGreetingName] = useState<string | null>(null)
  // Chatbot (form-filling) state
  const questions = [
    { key: 'personal.fullName', q: 'What is your full name?' },
    { key: 'personal.dob', q: 'Your date of birth? (YYYY-MM-DD)' },
    { key: 'personal.city', q: 'Which city do you live in?' },
    { key: 'personal.state', q: 'Which state?' },
    { key: 'personal.contact', q: 'Your contact number?' },
    { key: 'personal.email', q: 'Your email ID?' },
    { key: 'employment.type', q: 'Employment type (Salaried / Self-Employed / Business Owner / Student)?' },
    { key: 'employment.employer', q: 'Employer or business name?' },
    { key: 'employment.title', q: 'Job title/designation?' },
    { key: 'employment.experienceYears', q: 'Work experience in years?' },
    { key: 'employment.monthlyIncome', q: 'Monthly income / business revenue?' },
    { key: 'financial.existingLoans', q: 'Existing loans (Home, Car, Personal, Education) if any?' },
    { key: 'financial.totalEmi', q: 'Total EMI (monthly)?' },
    { key: 'financial.monthlyExpenses', q: 'Average monthly expenses?' },
    { key: 'financial.bankAccountType', q: 'Bank account type (Savings / Current)?' },
    { key: 'financial.creditScore', q: 'Approximate credit score (if known)?' },
    { key: 'loan.type', q: 'Loan type (Personal / Education / Home / Business / Vehicle)?' },
    { key: 'loan.amount', q: 'Loan amount required?' },
    { key: 'loan.tenure', q: 'Preferred tenure (months or years)?' },
    { key: 'loan.purpose', q: 'Purpose of the loan (short text)?' },
    { key: 'loan.startDate', q: 'Preferred repayment start date (YYYY-MM-DD)?' },
    { key: 'loan.collateral', q: 'Collateral (if applicable)?' },
    { key: 'additional.residentialType', q: 'Residential type (Owned / Rented / Company Provided)?' },
    { key: 'additional.dependents', q: 'Number of dependents?' },
    { key: 'additional.panOrAadhaar', q: 'PAN or Aadhaar (text only)?' },
    { key: 'additional.maritalStatus', q: 'Marital status (optional)?' },
  ] as const
  const [qIndex, setQIndex] = useState(0)
  // Try to capture transcript messages from embedded ElevenLabs (if they postMessage)
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      try {
        const data: any = e.data
        if (!data) return
        // Heuristic: accept objects like { type: 'transcript', text: '...' }
        if (typeof data === 'object' && (data.type === 'transcript' || data.event === 'transcript')) {
          const text: string | undefined = data.text || data.payload?.text
          if (text) setMessages((m) => [...m, { role: 'assistant', text }])
        }
      } catch {}
    }
    window.addEventListener('message', onMsg)
    return () => window.removeEventListener('message', onMsg)
  }, [])

  // Mirror main-page greeting
  useEffect(() => {
    let active = true
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        if (active) setGreetingName(null)
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', data.user.id)
        .maybeSingle()
      if (active) setGreetingName(profile?.full_name ?? 'there')
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => { active = false; sub.subscription.unsubscribe() }
  }, [])

  const send = async () => {
    if (!input.trim()) return
    const next: Msg = { role: "user", text: input.trim() }
    setMessages((m) => [...m, next])
    setInput("")
    setTyping(true)
    try {
      const r = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...messages, next] }) })
      const data = await r.json()
      const text: string = data?.text || 'Okay.'
      setMessages((m) => [...m, { role: 'assistant', text }])
      // Naive fill-in demo: pick up amount and months if present
      const amtMatch = text.match(/(?:₹|INR)?\s*([0-9,.]{3,})/)
      const tenureMatch = text.match(/(\d{1,3})\s*(?:months|month)/i)
      setFile((f) => ({
        ...f,
        loan: {
          ...f.loan,
          amount: amtMatch ? `₹${amtMatch[1]}` : f.loan.amount,
          tenure: tenureMatch ? `${tenureMatch[1]} months` : f.loan.tenure,
        },
        insights: { ...f.insights, score: Math.min(98, Math.max(40, (f.insights.score || 60) + 5)), confidence: 0.86 },
      }))
    } catch (_) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Sorry, I could not reach the assistant right now.' }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Navbar copied from main page with active tab highlight */}
      <header className="sticky top-0 z-50 transition-transform duration-300">
        <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-[1500px] mx-auto px-8 py-4 flex justify-between items-center border-x border-neutral-200">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="sr-only">Fluxd</span>
              <TypewriterBrand text="FLUXD" className="h-6" />
            </Link>
            {/* Center: Menu */}
            <ul className="hidden md:flex items-center gap-12">
              {[
                { href: "/eligibility", label: "ELIGIBILITY", active: true },
                { href: "/verification", label: "VERIFICATION" },
                { href: "/offers", label: "OFFERS" },
                { href: "/#tracker", label: "TRACKER" },
                { href: "/#sanction", label: "SANCTION" },
                { href: "/account", label: "MY ACCOUNT" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={`text-xs transition-colors ${item.active ? 'text-black font-extrabold' : 'text-black hover:text-neutral-600'}`}
                  >
                    <TypewriterHover text={item.label} />
                  </Link>
                </li>
              ))}
            </ul>
            {/* Right: Auth */}
            {greetingName ? (
              <button
                onClick={() => router.push('/account')}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-black hover:text-neutral-600"
              >
                <UserIcon className="h-4 w-4" />
                {`Hi, ${greetingName.split(' ')[0]}!`}
              </button>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-black hover:text-neutral-600"
              >
                <UserIcon className="h-4 w-4" />
                SIGN IN
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Content with rectangular grid frame */}
      <section className="relative max-w-[1500px] mx-auto px-6 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 border-x border-t border-b border-neutral-200">
        <div aria-hidden className="pointer-events-none absolute inset-0" />
        {/* Left: AI Interaction (60%) */}
        <div className="lg:col-span-7">
          <div className="relative rounded-2xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold">Voice Agent</h2>
              <button
                onClick={() => window.open('https://elevenlabs.io/app/talk-to?agent_id=agent_1701k8v8gfq4f4nvkjhs93xm66yp', '_blank', 'noopener,noreferrer')}
                className="h-10 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 text-sm"
              >
                Open in new tab
              </button>
            </div>
            <div className="mb-4 text-xs text-neutral-600 space-y-1">
              <p>How to use:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Start the voice agent in the new tab.</li>
                <li>Return here and click <span className="font-semibold">Start recording</span> to capture mic + tab audio.</li>
                <li>When finished, click <span className="font-semibold">Conversation ended • Extract answers</span>. We will transcribe the talk and have Gemini extract the required fields to auto-fill the file.</li>
              </ol>
              <p>If any field is missing or incorrect, edit it directly on the right.</p>
            </div>
            <Recorder
              onTranscript={async (text) => {
                if (!text?.trim()) return
                const next = { role: 'user' as const, text }
                setMessages((m) => [...m, next])
              }}
            />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  const content = messages.map((m) => `${m.role.toUpperCase()}: ${m.text}`).join('\n')
                  const blob = new Blob([content], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'transcript.txt'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="h-10 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 text-sm"
              >
                Download transcript
              </button>
              <button
                onClick={async () => {
                  // If recorder is active, stop and transcribe first
                  if ((window as any).__stopConversationRecording) {
                    await (window as any).__stopConversationRecording()
                  }
                  const transcript = messages.map((m) => `${m.role}: ${m.text}`).join('\n')
                  setTyping(true)
                  try {
                    const r = await fetch('/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript }) })
                    const data = await r.json()
                    const ex = data?.extracted || {}
                    setFile((f) => ({
                      ...f,
                      personal: {
                        fullName: ex?.personal?.fullName ?? f.personal.fullName,
                        dob: ex?.personal?.dob ?? f.personal.dob,
                        gender: ex?.personal?.gender ?? f.personal.gender,
                        city: ex?.personal?.city ?? f.personal.city,
                        state: ex?.personal?.state ?? f.personal.state,
                        address: ex?.personal?.address ?? f.personal.address,
                        contact: ex?.personal?.phone ?? f.personal.contact,
                        email: ex?.personal?.email ?? f.personal.email,
                      },
                      employment: {
                        type: ex?.employment?.type ?? f.employment.type,
                        employer: ex?.employment?.employer ?? f.employment.employer,
                        title: ex?.employment?.title ?? f.employment.title,
                        experienceYears: String(ex?.employment?.experienceYears ?? f.employment.experienceYears),
                        monthlyIncome: ex?.employment?.monthlyIncome ?? f.employment.monthlyIncome,
                        verification: ex?.employment?.verification ?? f.employment.verification,
                      },
                      financial: {
                        existingLoans: ex?.financial?.existingLoans ?? f.financial.existingLoans,
                        totalEmi: ex?.financial?.totalEmi ?? f.financial.totalEmi,
                        monthlyExpenses: ex?.financial?.monthlyExpenses ?? f.financial.monthlyExpenses,
                        bankAccountType: ex?.financial?.bankAccountType ?? f.financial.bankAccountType,
                        creditScore: ex?.financial?.creditScore ?? f.financial.creditScore,
                        annualIncome: ex?.financial?.annualIncome ?? f.financial.annualIncome,
                      },
                      loan: {
                        type: ex?.loan?.type ?? f.loan.type,
                        amount: ex?.loan?.amount ?? f.loan.amount,
                        tenure: ex?.loan?.tenure ?? f.loan.tenure,
                        purpose: ex?.loan?.purpose ?? f.loan.purpose,
                        startDate: ex?.loan?.startDate ?? f.loan.startDate,
                        collateral: ex?.loan?.collateral ?? f.loan.collateral,
                      },
                      additional: {
                        residentialType: ex?.additional?.residentialType ?? f.additional.residentialType,
                        dependents: ex?.additional?.dependents ?? f.additional.dependents,
                        panOrAadhaar: ex?.additional?.panOrAadhaar ?? f.additional.panOrAadhaar,
                        maritalStatus: ex?.additional?.maritalStatus ?? f.additional.maritalStatus,
                      },
                      insights: { ...f.insights },
                    }))
                    // Also fetch eligibility score + confidence
                    const s = await fetch('/api/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript }) })
                    const sv = await s.json()
                    setFile((f)=>({...f, insights:{ ...f.insights, score: Number(sv?.eligibilityScore ?? f.insights.score) || 0, confidence: Number(sv?.confidence ?? f.insights.confidence) || 0, tone: f.insights.tone }}))
                  } catch {
                    // ignore for now
                  } finally {
                    setTyping(false)
                  }
                }}
                className="h-10 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 text-sm"
              >
                Conversation ended • Extract answers
              </button>
              <label className="h-10 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 text-sm inline-flex items-center cursor-pointer">
                Upload transcript
                <input
                  type="file"
                  accept=".txt,.md,.json"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const text = await file.text()
                    setTyping(true)
                    try {
                      const r = await fetch('/api/extract', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: text }) })
                      const data = await r.json()
                      const ex = data?.extracted || {}
                      setFile((f)=>({
                        ...f,
                        personal: { fullName: ex?.personal?.fullName ?? f.personal.fullName, dob: ex?.personal?.dob ?? f.personal.dob, gender: ex?.personal?.gender ?? f.personal.gender, city: ex?.personal?.city ?? f.personal.city, state: ex?.personal?.state ?? f.personal.state, address: ex?.personal?.address ?? f.personal.address, contact: ex?.personal?.phone ?? f.personal.contact, email: ex?.personal?.email ?? f.personal.email },
                        employment: { type: ex?.employment?.type ?? f.employment.type, employer: ex?.employment?.employer ?? f.employment.employer, title: ex?.employment?.title ?? f.employment.title, experienceYears: String(ex?.employment?.experienceYears ?? f.employment.experienceYears), monthlyIncome: ex?.employment?.monthlyIncome ?? f.employment.monthlyIncome, verification: ex?.employment?.verification ?? f.employment.verification },
                        financial: { existingLoans: ex?.financial?.existingLoans ?? f.financial.existingLoans, totalEmi: ex?.financial?.totalEmi ?? f.financial.totalEmi, monthlyExpenses: ex?.financial?.monthlyExpenses ?? f.financial.monthlyExpenses, bankAccountType: ex?.financial?.bankAccountType ?? f.financial.bankAccountType, creditScore: ex?.financial?.creditScore ?? f.financial.creditScore, annualIncome: ex?.financial?.annualIncome ?? f.financial.annualIncome },
                        loan: { type: ex?.loan?.type ?? f.loan.type, amount: ex?.loan?.amount ?? f.loan.amount, tenure: ex?.loan?.tenure ?? f.loan.tenure, purpose: ex?.loan?.purpose ?? f.loan.purpose, startDate: ex?.loan?.startDate ?? f.loan.startDate, collateral: ex?.loan?.collateral ?? f.loan.collateral },
                        additional: { residentialType: ex?.additional?.residentialType ?? f.additional.residentialType, dependents: ex?.additional?.dependents ?? f.additional.dependents, panOrAadhaar: ex?.additional?.panOrAadhaar ?? f.additional.panOrAadhaar, maritalStatus: ex?.additional?.maritalStatus ?? f.additional.maritalStatus },
                      }))
                      const s = await fetch('/api/score', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transcript: text }) })
                      const sv = await s.json()
                      setFile((f)=>({...f, insights:{ ...f.insights, score: Number(sv?.eligibilityScore ?? f.insights.score) || 0, confidence: Number(sv?.confidence ?? f.insights.confidence) || 0 }}))
                    } finally {
                      setTyping(false)
                    }
                  }}
                />
              </label>
            </div>
            {/* Transcript list */}
            <div className="mt-4 h-[46vh] overflow-y-auto space-y-3 pr-1">
              {messages.map((m, i) => (
                <div key={i} className={`max-w-[85%] ${m.role === 'user' ? 'ml-auto' : ''}`}>
                  <div className={`rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-white border border-neutral-200' : 'bg-white/70 border border-neutral-200'}`}>
                    <p className="leading-relaxed text-black">{m.text}</p>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="max-w-[70%]">
                  <div className="rounded-2xl px-4 py-3 text-sm bg-white/70 border border-neutral-200 inline-flex gap-2">
                    <span className="h-2 w-2 rounded-full bg-black animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-black animate-bounce [animation-delay:120ms]" />
                    <span className="h-2 w-2 rounded-full bg-black animate-bounce [animation-delay:240ms]" />
                  </div>
                </div>
              )}
            </div>
            {/* Chatbot quick-fill */}
            <div className="mt-4 border-t border-neutral-200 pt-3">
              <div className="text-xs text-neutral-600 mb-2">Assistant will ask for details and fill the file.</div>
              <div className="rounded-lg border border-neutral-200 bg-white p-3">
                <div className="text-sm mb-2">{questions[qIndex]?.q ?? 'All questions answered. You can edit fields on the right.'}</div>
                {questions[qIndex] && (
                  <form
                    onSubmit={(e)=>{
                      e.preventDefault()
                      const form = e.currentTarget as HTMLFormElement
                      const input = form.elements.namedItem('answer') as HTMLInputElement
                      const value = input.value.trim()
                      if (!value) return
                      // store
                      const path = questions[qIndex].key.split('.') as string[]
                      setFile((prev:any)=>{
                        const next = JSON.parse(JSON.stringify(prev))
                        let cur:any = next
                        for (let i=0;i<path.length-1;i++) cur = cur[path[i]]
                        cur[path[path.length-1]] = value
                        return next
                      })
                      input.value = ''
                      setQIndex((i)=>Math.min(i+1, questions.length))
                    }}
                    className="flex items-center gap-2"
                  >
                    <input name="answer" className="flex-1 h-10 rounded-md border border-neutral-200 px-3 text-sm outline-none" placeholder="Your answer" />
                    <button className="h-10 px-4 rounded-md bg-black text-white text-sm">Send</button>
                  </form>
                )}
              </div>
              <div className="mt-2 flex items-center justify-end">
                <button
                  onClick={async ()=>{
                    // Save file in Supabase
                    const { data: auth } = await supabase.auth.getUser()
                    const userId = auth.user?.id
                    if (!userId) return
                    const payload = {
                      user_id: userId,
                      data: file,
                      eligibility_score: file.insights.score,
                      confidence: file.insights.confidence,
                      status: 'pending',
                    }
                    const { data: ins, error } = await supabase.from('loan_files').insert(payload).select('id').single()
                    // Also upsert into eligibility table (linked by user_id)
                    const flat = {
                      user_id: userId,
                      full_name: file.personal.fullName || null,
                      dob: file.personal.dob || null,
                      gender: file.personal.gender || null,
                      city: file.personal.city || null,
                      state: file.personal.state || null,
                      address: file.personal.address || null,
                      phone: file.personal.contact || null,
                      email: file.personal.email || null,
                      employment_type: file.employment.type || null,
                      employer: file.employment.employer || null,
                      title: file.employment.title || null,
                      experience_years: file.employment.experienceYears || null,
                      monthly_income: file.employment.monthlyIncome || null,
                      existing_loans: file.financial.existingLoans || null,
                      total_emi: file.financial.totalEmi || null,
                      monthly_expenses: file.financial.monthlyExpenses || null,
                      bank_account_type: file.financial.bankAccountType || null,
                      credit_score: file.financial.creditScore || null,
                      annual_income: file.financial.annualIncome || null,
                      loan_type: file.loan.type || null,
                      loan_amount: file.loan.amount || null,
                      loan_tenure: file.loan.tenure || null,
                      loan_purpose: file.loan.purpose || null,
                      repayment_start_date: file.loan.startDate || null,
                      collateral: file.loan.collateral || null,
                      residential_type: file.additional.residentialType || null,
                      dependents: file.additional.dependents || null,
                      pan_or_aadhaar: file.additional.panOrAadhaar || null,
                      marital_status: file.additional.maritalStatus || null,
                      eligibility_score: file.insights.score || null,
                      confidence: file.insights.confidence || null,
                    }
                    await supabase.from('eligibility').upsert(flat, { onConflict: 'user_id' })
                    if (!error && ins?.id) router.push(`/account/files/${ins.id}`)
                  }}
                  className="h-10 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 text-sm"
                >
                  Save file
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Loan file card (40%) */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
              <h2 className="text-base font-semibold">Live Loan Request File</h2>
              <div className="text-xs text-neutral-600">Tracking</div>
            </div>

            <div className="p-6 grid grid-cols-1 gap-4">
              <Section title="Personal Info">
                <Edit k="Full Name" v={file.personal.fullName} onChange={(v)=>setFile(f=>({...f, personal:{...f.personal, fullName:v}}))} />
                <Edit k="Date of Birth" v={file.personal.dob} onChange={(v)=>setFile(f=>({...f, personal:{...f.personal, dob:v}}))} type="date" />
                <Edit k="Gender" v={file.personal.gender} onChange={(v)=>setFile(f=>({...f, personal:{...f.personal, gender:v}}))} />
                <Edit k="City" v={file.personal.city} onChange={(v)=>setFile(f=>({...f, personal:{...f.personal, city:v}}))} />
                <Edit k="State" v={file.personal.state} onChange={(v)=>setFile(f=>({...f, personal:{...f.personal, state:v}}))} />
                <Edit k="Address" v={file.personal.address} onChange={(v)=>setFile(f=>({...f, personal:{...f.personal, address:v}}))} />
                <Edit k="Contact" v={file.personal.contact} onChange={(v)=>setFile(f=>({...f, personal:{...f.personal, contact:v}}))} />
                <Edit k="Email" v={file.personal.email} onChange={(v)=>setFile(f=>({...f, personal:{...f.personal, email:v}}))} />
              </Section>

              <Section title="Employment & Income">
                <Edit k="Employment Type" v={file.employment.type} onChange={(v)=>setFile(f=>({...f, employment:{...f.employment, type:v}}))} />
                <Edit k="Employer / Business" v={file.employment.employer} onChange={(v)=>setFile(f=>({...f, employment:{...f.employment, employer:v}}))} />
                <Edit k="Job Title" v={file.employment.title} onChange={(v)=>setFile(f=>({...f, employment:{...f.employment, title:v}}))} />
                <Edit k="Experience (years)" v={String(file.employment.experienceYears)} onChange={(v)=>setFile(f=>({...f, employment:{...f.employment, experienceYears:v}}))} />
                <Edit k="Monthly Income / Revenue" v={file.employment.monthlyIncome} onChange={(v)=>setFile(f=>({...f, employment:{...f.employment, monthlyIncome:v}}))} />
                <Edit k="Employment Verification" v={file.employment.verification} onChange={(v)=>setFile(f=>({...f, employment:{...f.employment, verification:v}}))} />
              </Section>

              <Section title="Financial Details">
                <Edit k="Existing Loans" v={file.financial.existingLoans} onChange={(v)=>setFile(f=>({...f, financial:{...f.financial, existingLoans:v}}))} />
                <Edit k="Total EMI" v={file.financial.totalEmi} onChange={(v)=>setFile(f=>({...f, financial:{...f.financial, totalEmi:v}}))} />
                <Edit k="Avg. Monthly Expenses" v={file.financial.monthlyExpenses} onChange={(v)=>setFile(f=>({...f, financial:{...f.financial, monthlyExpenses:v}}))} />
                <Edit k="Bank Account Type" v={file.financial.bankAccountType} onChange={(v)=>setFile(f=>({...f, financial:{...f.financial, bankAccountType:v}}))} />
                <Edit k="Credit Score" v={file.financial.creditScore} onChange={(v)=>setFile(f=>({...f, financial:{...f.financial, creditScore:v}}))} />
                <Edit k="Annual Income" v={file.financial.annualIncome} onChange={(v)=>setFile(f=>({...f, financial:{...f.financial, annualIncome:v}}))} />
              </Section>

              <Section title="Loan Request">
                <Edit k="Loan Type" v={file.loan.type} onChange={(v)=>setFile(f=>({...f, loan:{...f.loan, type:v}}))} />
                <Edit k="Loan Amount" v={file.loan.amount} onChange={(v)=>setFile(f=>({...f, loan:{...f.loan, amount:v}}))} />
                <Edit k="Preferred Tenure" v={file.loan.tenure} onChange={(v)=>setFile(f=>({...f, loan:{...f.loan, tenure:v}}))} />
                <Edit k="Purpose" v={file.loan.purpose} onChange={(v)=>setFile(f=>({...f, loan:{...f.loan, purpose:v}}))} />
                <Edit k="Repayment Start Date" v={file.loan.startDate} onChange={(v)=>setFile(f=>({...f, loan:{...f.loan, startDate:v}}))} type="date" />
                <Edit k="Collateral" v={file.loan.collateral} onChange={(v)=>setFile(f=>({...f, loan:{...f.loan, collateral:v}}))} />
              </Section>

              <Section title="Additional Criteria">
                <Edit k="Residential Type" v={file.additional.residentialType} onChange={(v)=>setFile(f=>({...f, additional:{...f.additional, residentialType:v}}))} />
                <Edit k="Dependents" v={file.additional.dependents} onChange={(v)=>setFile(f=>({...f, additional:{...f.additional, dependents:v}}))} />
                <Edit k="PAN / Aadhaar" v={file.additional.panOrAadhaar} onChange={(v)=>setFile(f=>({...f, additional:{...f.additional, panOrAadhaar:v}}))} />
                <Edit k="Marital Status" v={file.additional.maritalStatus} onChange={(v)=>setFile(f=>({...f, additional:{...f.additional, maritalStatus:v}}))} />
              </Section>

              <Section title="AI Insights">
                <KV k="Eligibility Score" v={`${file.insights.score}%`} />
                <KV k="Confidence" v={`${Math.round(file.insights.confidence * 100)}%`} />
                <KV k="Tone" v={file.insights.tone} />
                <div className="mt-3 h-2 rounded-full bg-neutral-200 overflow-hidden">
                  <div className="h-full bg-black" style={{ width: `${file.insights.score}%` }} />
                </div>
              </Section>

              <Link href="/account/files/123" className="mt-2 inline-flex items-center justify-center h-11 rounded-xl bg-black text-white text-sm hover:opacity-90">
                View Full File
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      <SiteFooter />
    </main>
  )
}

function TypewriterBrand({ text, className = "" }: { text: string; className?: string }) {
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (index >= text.length) return
    const id = setTimeout(() => setIndex((i) => i + 1), 90)
    return () => clearTimeout(id)
  }, [index, text])
  return (
    <div className={className} aria-label={text} role="img">
      <span className="inline-flex items-baseline gap-0.5 select-none" style={{fontFamily: 'Mona Sans, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif'}}>
        {text.split("").map((ch, i) => (
          <span
            key={i}
            className={`uppercase tracking-wider transition-all duration-200 ${i < index ? "font-extrabold text-black opacity-100 translate-y-0" : "font-medium text-neutral-400 opacity-30 translate-y-0.5"}`}
            style={{fontSize: 18}}
          >
            {ch}
          </span>
        ))}
      </span>
    </div>
  )
}

function TypewriterHover({ text }: { text: string }) {
  const [hovered, setHovered] = useState(false)
  const [index, setIndex] = useState(0)
  useEffect(() => {
    if (!hovered) return
    setIndex(0)
    let cancelled = false
    const tick = (i: number) => {
      if (cancelled) return
      if (i > text.length) return
      setIndex(i)
      setTimeout(() => tick(i + 1), 55)
    }
    tick(1)
    return () => {
      cancelled = true
    }
  }, [hovered, text])
  return (
    <span
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setIndex(0) }}
      className="uppercase tracking-widest select-none"
      aria-label={text}
    >
      {text.split("").map((ch, i) => (
        <span key={i} className={`transition-all duration-150 ${hovered && i < index ? "font-extrabold" : "font-medium"}`}>{ch}</span>
      ))}
    </span>
  )
}

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white/60 backdrop-blur-md p-4">
      <div className="text-xs uppercase tracking-widest text-neutral-600 mb-3">{title}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-black">{children}</div>
    </div>
  )
}

function KV({ k, v }: { k: string; v: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-black/60">{k}</span>
      <span className="font-semibold">{String(v)}</span>
    </div>
  )
}

function Edit({ k, v, onChange, type = 'text' }: { k: string; v: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm">
      <span className="text-neutral-600 whitespace-nowrap">{k}</span>
      <input
        type={type}
        value={v}
        onChange={(e) => onChange(e.target.value)}
        className="w-[60%] h-9 rounded-md border border-neutral-200 bg-white px-2 text-sm outline-none"
        placeholder="—"
      />
    </label>
  )
}

function Recorder({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [recording, setRecording] = useState(false)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const chunksRef = useState<Blob[]>([])[0]
  const queueRef = useState<Blob[]>([])[0]
  const processingRef = useState<{ running: boolean }>({ running: false })[0]
  const [srSupported, setSrSupported] = useState<boolean>(false)
  const srInstanceRef = useState<any>(null)[0]

  // Expose stop via window for the parent button to call before extraction (optional)
  useEffect(() => {
    ;(window as any).__stopConversationRecording = async () => {
      if (recorder && recorder.state !== 'inactive') recorder.stop()
      // wait a tick
      await new Promise((r) => setTimeout(r, 200))
      if (chunksRef.length === 0) return ''
      const blob = new Blob(chunksRef.splice(0, chunksRef.length), { type: 'audio/webm' })
      const b64 = await blobToBase64(blob)
      const r = await fetch('/api/transcribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ audio: b64, mimeType: 'audio/webm' }) })
      const data = await r.json()
      const text: string = data?.transcript || ''
      if (text) onTranscript(text)
      return text
    }
  }, [recorder, chunksRef, onTranscript])

  const start = async () => {
    // Mic-only recording with live chunk transcription
    const mic = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => null)
    if (!mic) return
    const mr = new MediaRecorder(mic as MediaStream, { mimeType: 'audio/webm' })
    mr.ondataavailable = (e) => {
      if (e.data && e.data.size) {
        chunksRef.push(e.data)
        queueRef.push(e.data)
        processQueue()
      }
    }
    mr.onstop = () => { setRecording(false); try { (mic as MediaStream).getTracks().forEach(t=>t.stop()) } catch {} }
    mr.start(2000)
    setRecorder(mr)
    setRecording(true)

    // Start Web Speech API as a microphone-only fallback for immediate transcript of user speech
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (SR) {
      setSrSupported(true)
      const rec = new SR()
      rec.lang = 'en-IN'
      rec.interimResults = true
      rec.continuous = true
      rec.onresult = (e: any) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i]
          if (res.isFinal) onTranscript(res[0].transcript)
        }
      }
      rec.onerror = () => {}
      rec.start()
      // store instance so we can stop it later
      ;(srInstanceRef as any).current = rec
    }
  }

  async function processQueue() {
    if (processingRef.running) return
    processingRef.running = true
    try {
      while (queueRef.length) {
        const blob = queueRef.shift() as Blob
        const b64 = await blobToBase64(blob)
        const r = await fetch('/api/transcribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ audio: b64, mimeType: 'audio/webm' }) })
        const data = await r.json()
        const text: string = data?.transcript || ''
        if (text) onTranscript(text)
      }
    } catch {}
    processingRef.running = false
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-xs text-neutral-600">{recording ? `Recording mic${srSupported ? ' + speech-recognition' : ''}…` : 'Idle'}</div>
      {!recording ? (
        <button onClick={start} className="h-10 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 text-sm">Start recording</button>
      ) : (
        <button onClick={() => { if (recorder) recorder.stop(); try { (srInstanceRef as any).current && (srInstanceRef as any).current.stop() } catch {} }} className="h-10 px-4 rounded-md bg-black text-white text-sm">Stop</button>
      )}
    </div>
  )
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result as string
      const b64 = dataUrl.split(',')[1] || ''
      resolve(b64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}


