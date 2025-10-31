"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export const dynamic = 'force-dynamic'

type TesseractNS = typeof import("tesseract.js")
type PdfJsLib = any

export default function VerificationPage() {
  const router = useRouter()
  const [greetingName, setGreetingName] = useState<string | null>(null)
  const [expectedAadhaar, setExpectedAadhaar] = useState<string>("")
  const [ocrText, setOcrText] = useState<string>("")
  const [foundAadhaar, setFoundAadhaar] = useState<string>("")
  const [match, setMatch] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const tessRef = useRef<TesseractNS | null>(null)
  const pdfRef = useRef<PdfJsLib | null>(null)
  const verifyingRef = useRef(false)

  // Load greeting and expected Aadhaar from latest loan file, fallback to profile
  useEffect(() => {
    let active = true
    const load = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return
      // Primary: fetch from eligibility table
      const { data: elig } = await supabase
        .from('eligibility')
        .select('full_name, pan_or_aadhaar')
        .eq('user_id', data.user.id)
        .maybeSingle()
      if (active && elig?.full_name) setGreetingName(elig.full_name)
      // Try eligibility table first
      const fromEligibility = elig?.pan_or_aadhaar ? String(elig.pan_or_aadhaar).replace(/\D/g, "") : ""
      if (active && fromEligibility && fromEligibility.length === 12) {
        setExpectedAadhaar(fromEligibility)
        return
      }
      // Fallback: loan_files
      const { data: lf } = await supabase
        .from('loan_files')
        .select('data')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
      const fromFile = lf?.[0]?.data?.additional?.panOrAadhaar || lf?.[0]?.data?.additional?.aadhaar
      // Fallback: profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, additional')
        .eq('user_id', data.user.id)
        .maybeSingle() as any
      if (active && !elig?.full_name && profile?.full_name) setGreetingName(profile.full_name)
      const fromProfile = (profile as any)?.additional?.panOrAadhaar
      const candidate = String(fromFile || fromProfile || "").replace(/\D/g, "")
      if (active && candidate && candidate.length === 12) setExpectedAadhaar(candidate)
    }
    load()
    return () => { active = false }
  }, [])

  // Load Tesseract from CDN once
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (typeof window === 'undefined') return
      if ((window as any).Tesseract) {
        tessRef.current = (window as any).Tesseract
        return
      }
      const s = document.createElement('script')
      s.src = 'https://unpkg.com/tesseract.js@4.0.2/dist/tesseract.min.js'
      s.async = true
      s.onload = () => { if (!cancelled) tessRef.current = (window as any).Tesseract }
      document.body.appendChild(s)
    })()
    return () => { cancelled = true }
  }, [])

  // Load PDF.js (window.pdfjsLib)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (typeof window === 'undefined') return
      if ((window as any).pdfjsLib) {
        pdfRef.current = (window as any).pdfjsLib
        return
      }
      const s = document.createElement('script')
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      s.async = true
      s.onload = () => {
        if (!cancelled) {
          const lib = (window as any).pdfjsLib
          // set worker src
          try { lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js' } catch {}
          pdfRef.current = lib
        }
      }
      document.body.appendChild(s)
    })()
    return () => { cancelled = true }
  }, [])

  const extractAadhaar = (text: string) => {
    // 12 digits with optional spaces between groups
    const cleaned = text.replace(/[^0-9]/g, '')
    const m = cleaned.match(/\d{12}/)
    return m ? m[0] : ''
  }

  const handleFile = async (file: File) => {
    if (!file || !tessRef.current) return
    setLoading(true)
    setOcrText('')
    setFoundAadhaar('')
    setMatch(null)
    try {
      let text = ''
      if (file.type === 'application/pdf' && pdfRef.current) {
        // Render each page to canvas and OCR
        const arrayBuf = await file.arrayBuffer()
        const pdf = await pdfRef.current.getDocument({ data: arrayBuf }).promise
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p)
          const viewport = page.getViewport({ scale: 2 })
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')!
          canvas.width = viewport.width
          canvas.height = viewport.height
          await page.render({ canvasContext: ctx, viewport }).promise
          const blob: Blob = await new Promise((res) => canvas.toBlob((b)=>res(b as Blob), 'image/png'))
          const { data } = await tessRef.current!.recognize(blob, 'eng', { logger: () => {} })
          text += (data?.text || '') + '\n'
        }
      } else {
        const { data } = await tessRef.current!.recognize(file, 'eng', { logger: () => {} })
        text = data?.text || ''
      }
      setOcrText(text)
      const got = extractAadhaar(text)
      setFoundAadhaar(got)
      
      // If expected wasn't loaded, try fetching from eligibility table now
      let expected = expectedAadhaar
      if (!expected) {
        const { data: auth } = await supabase.auth.getUser()
        const uid = auth.user?.id
        if (uid) {
          const { data: elig } = await supabase
            .from('eligibility')
            .select('pan_or_aadhaar')
            .eq('user_id', uid)
            .maybeSingle()
          if (elig?.pan_or_aadhaar) {
            expected = String(elig.pan_or_aadhaar).replace(/\D/g, "")
            if (expected && expected.length === 12) setExpectedAadhaar(expected)
          }
        }
      }
      
      if (expected && got) {
        const ok = got.replace(/\D/g,'') === expected.replace(/\D/g,'')
        setMatch(ok)
        if (ok) {
          // Update eligibility.verified = 'yes'
          const { data: auth } = await supabase.auth.getUser()
          const uid = auth.user?.id
          if (uid) {
            await supabase.from('eligibility').update({ verified: 'yes' }).eq('user_id', uid)
          }
        }
      } else if (got && !expected) {
        setMatch(false)
      }
    } catch (e) {
      setOcrText('OCR failed. Try a clearer image.')
    } finally {
      setLoading(false)
    }
  }

  const verifyNow = async () => {
    if (verifyingRef.current) return
    verifyingRef.current = true
    try {
      const { data: auth } = await supabase.auth.getUser()
      const uid = auth.user?.id
      if (!uid) return
      const expected = (expectedAadhaar || '').replace(/\D/g, '')
      if (!expected || expected.length !== 12) return
      // Persist expected into eligibility.pan_or_aadhaar
      await supabase.from('eligibility').upsert({ user_id: uid, pan_or_aadhaar: expected }, { onConflict: 'user_id' })
      // Load stored to compare when OCR not present
      const { data: elig } = await supabase.from('eligibility').select('pan_or_aadhaar').eq('user_id', uid).maybeSingle()
      const stored = (elig?.pan_or_aadhaar ? String(elig.pan_or_aadhaar) : '').replace(/\D/g, '')
      const candidate = foundAadhaar ? foundAadhaar.replace(/\D/g, '') : stored
      if (candidate && candidate.length === 12 && candidate === expected) {
        await supabase.from('eligibility').update({ verified: 'yes' }).eq('user_id', uid)
        setMatch(true)
      } else {
        setMatch(false)
      }
    } finally {
      verifyingRef.current = false
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      {/* Navbar (same as main) */}
      <header className="sticky top-0 z-50 transition-transform duration-300">
        <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-[1500px] mx-auto px-8 py-4 flex justify-between items-center border-x border-neutral-200">
            <Link href="/" className="text-sm font-extrabold tracking-widest">FLUXD</Link>
            <ul className="hidden md:flex items-center gap-12">
              {[
                { href: "/eligibility", label: "ELIGIBILITY" },
                { href: "/verification", label: "VERIFICATION", active: true },
                { href: "/offers", label: "OFFERS" },
                { href: "/tracker", label: "TRACKER" },
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
        {/* Left: Upload + ElevenLabs */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6">
            <h2 className="text-base font-semibold mb-2">Verify Docs</h2>
            <p className="text-xs text-neutral-600 mb-4">Upload a clear image of your Aadhaar. We’ll OCR and cross-verify the number with your details.</p>
            <div className="mb-4">
              <label className="inline-flex items-center gap-3 h-10 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 text-sm cursor-pointer">
                Upload image or PDF
                <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) handleFile(f) }} />
              </label>
            </div>
            <div className="rounded-lg border border-neutral-200 bg-white p-3 text-sm min-h-[140px]">
              {loading ? 'Running OCR…' : (ocrText ? <pre className="whitespace-pre-wrap text-neutral-800">{ocrText}</pre> : 'OCR output will appear here.')}
            </div>

            {/* Manual Aadhaar input chatbot */}
            <div className="mt-6 border-t border-neutral-200 pt-4">
              <div className="text-xs text-neutral-600 mb-2">Or enter Aadhaar number manually</div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.currentTarget as HTMLFormElement
                  const input = form.elements.namedItem('aadhaar') as HTMLInputElement
                  const value = input.value.trim().replace(/\D/g, '')
                  if (value && value.length === 12) {
                    setExpectedAadhaar(value)
                    // If OCR already found a number, check match immediately
                    if (foundAadhaar) {
                      const ok = foundAadhaar.replace(/\D/g, '') === value.replace(/\D/g, '')
                      setMatch(ok)
                      if (ok) {
                        const { data: auth } = await supabase.auth.getUser()
                        const uid = auth.user?.id
                        if (uid) {
                          await supabase.from('eligibility').update({ verified: 'yes' }).eq('user_id', uid)
                        }
                      }
                    }
                    input.value = ''
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  name="aadhaar"
                  type="text"
                  maxLength={14}
                  placeholder="Enter 12-digit Aadhaar"
                  className="flex-1 h-10 rounded-md border border-neutral-200 px-3 text-sm outline-none placeholder:text-neutral-500"
                  pattern="[0-9\s]{12,14}"
                />
                <button type="submit" className="h-10 px-4 rounded-md bg-black text-white text-sm hover:opacity-90">Set</button>
              </form>
            </div>

            <div className="mt-6">
              <h3 className="text-xs uppercase tracking-widest text-neutral-600 mb-2">Voice Assistance (optional)</h3>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4">
                <p className="text-xs text-neutral-600">Open the verification voice agent in a new tab, then upload your document here.</p>
                <button
                  onClick={() => window.open('https://elevenlabs.io/app/talk-to?agent_id=agent_8101k8v94apyery8ypyx30c30k8g', '_blank', 'noopener,noreferrer')}
                  className="h-10 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 text-sm"
                >
                  Open agent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-neutral-200 bg-white/60 backdrop-blur-xl shadow-sm p-6">
            <h2 className="text-base font-semibold mb-4">Verification Status</h2>
            <div className="space-y-3 text-sm">
              <Row k="Expected Aadhaar" v={expectedAadhaar ? formatAadhaar(expectedAadhaar) : '—'} />
              <Row k="OCR Aadhaar" v={foundAadhaar ? formatAadhaar(foundAadhaar) : '—'} />
              <Row k="Matched" v={match == null ? '—' : match ? 'Yes' : 'No'} />
            </div>
            <div className="mt-6 flex items-center gap-2">
              <button onClick={verifyNow} className="h-10 px-4 rounded-md bg-black text-white text-sm">Verify Now</button>
              <button onClick={()=>{ if (ocrText){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([ocrText],{type:'text/plain'})); a.download='ocr.txt'; a.click(); } }} className="h-10 px-4 rounded-md border border-neutral-300 hover:bg-neutral-50 text-sm">Download OCR text</button>
              <button onClick={()=>router.push('/eligibility')} className="h-10 px-4 rounded-md bg-black text-white text-sm">Back to Eligibility</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-neutral-600">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  )
}

function formatAadhaar(n: string) {
  const d = n.replace(/\D/g, '')
  return d ? d.replace(/(\d{4})(\d{4})(\d{4}).*/, '$1 $2 $3') : n
}


