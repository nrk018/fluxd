"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { LoaderOverlay } from "@/components/loader-overlay"
import { SiteFooter } from "@/components/site-footer"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

export default function HomePage() {
  const lastScrollYRef = useRef(0)
  const [navHidden, setNavHidden] = useState(false)
  const [heroIn, setHeroIn] = useState(false)
  const [pageIn, setPageIn] = useState(false)
  const router = useRouter()
  const [greetingName, setGreetingName] = useState<string | null>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const goingDown = y > lastScrollYRef.current
      const pastHero = y > 64
      setNavHidden(goingDown && pastHero)
      lastScrollYRef.current = y
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const id = setTimeout(() => setHeroIn(true), 40)
    return () => clearTimeout(id)
  }, [])
  // Prevent browser from restoring previous scroll position on reload
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })
  }, [])
  // Reveal-on-scroll for section contents
  useEffect(() => {
    const elements = Array.from(document.querySelectorAll('.reveal-on-scroll')) as HTMLElement[]
    if (elements.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            el.classList.remove('opacity-0', 'translate-y-6')
            el.classList.add('opacity-100', 'translate-y-0')
            observer.unobserve(el)
          }
        }
      },
      { threshold: 0.2 }
    )
    elements.forEach((el) => {
      el.classList.add('opacity-0', 'translate-y-6', 'transition-all', 'duration-700')
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const id = setTimeout(() => setPageIn(true), 20)
    return () => clearTimeout(id)
  }, [])
  const features = [
    {
      id: '001',
      slug: 'eligibility',
      title: 'Instant Loan Eligibility Check',
      desc: 'Users can quickly check how much loan amount they qualify for using minimal personal and financial info.'
    },
    {
      id: '002',
      slug: 'verification',
      title: 'AI-Based Document Verification',
      desc: 'Upload PAN, Aadhaar, and income proof; the app verifies them instantly using OCR and AI.'
    },
    {
      id: '003',
      slug: 'offers',
      title: 'Smart Loan Offers',
      desc: 'Personalized loan plans based on credit score, income, and spending patterns.'
    },
    {
      id: '004',
      slug: 'tracker',
      title: 'Real-Time Application Tracker',
      desc: 'Track your loan progress step-by-step — from submission to approval.'
    },
    {
      id: '005',
      slug: 'sanction',
      title: 'e-Sign & Auto Sanction',
      desc: 'Complete KYC and sign digitally; loan gets sanctioned instantly without visiting any branch.'
    },
    {
      id: '006',
      slug: 'account',
      title: 'Secure Dashboard',
      desc: 'View EMI schedules, payment history, and upcoming dues in one simple, encrypted interface.'
    }
  ] as const
  const handleBegin = () => {
    router.push('/login')
  }

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
  return (
    <main className={`min-h-screen bg-white relative overflow-hidden transition-opacity duration-700 ${pageIn ? "opacity-100" : "opacity-0"}`}>
      <LoaderOverlay />
      {/* Minimal top navbar */}
      <header
        className={`sticky top-0 z-50 transition-transform duration-300 ${navHidden ? "-translate-y-full" : "translate-y-0"}`}
      >
        <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-[1500px] mx-auto px-8 py-4 flex justify-between items-center border-x border-neutral-200">
          {/* Left: Logo with leaf accent */}
          <Link href="/" className="flex items-center gap-2">
            <span className="sr-only">Fluxd</span>
            <TypewriterBrand text="FLUXD" className="h-6" />
          </Link>
          {/* Center: Menu */}
          <ul className="hidden md:flex items-center gap-12">
            {[
              { href: "/eligibility", label: "ELIGIBILITY" },
              { href: "/verification", label: "VERIFICATION" },
              { href: "/offers", label: "OFFERS" },
              { href: "#tracker", label: "TRACKER" },
              { href: "#sanction", label: "SANCTION" },
              { href: "/account", label: "MY ACCOUNT" },
            ].map((item) => (
              <li key={item.label}>
                {item.href.startsWith('#') ? (
                  <a href={item.href} className="text-xs text-black hover:text-neutral-600 transition-colors">
                    <TypewriterHover text={item.label} />
                  </a>
                ) : (
                  <Link href={item.href} className="text-xs text-black hover:text-neutral-600 transition-colors">
                    <TypewriterHover text={item.label} />
                  </Link>
                )}
              </li>
            ))}
          </ul>
          {/* Right: Auth link */}
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

      {/* Subheading strip */}
      <section className="max-w-[1500px] mx-auto px-8 pt-8 border-x border-neutral-200">
        <p className="text-xs uppercase tracking-widest text-neutral-500 text-center">
          HACKX 3.0 | OCT 30–31 | TEAM BUILDIT <span className="text-green-500 ml-1">■</span>
        </p>
      </section>

      {/* Hero title */}
      <section className="max-w-[1500px] mx-auto px-6 md:px-8 pt-6 md:pt-10 pb-6 text-center border-x border-neutral-200">
        <h1
          className={`recap-hero-title font-black tracking-tight text-black leading-[0.88] whitespace-nowrap text-[20vw] sm:text-[18vw] md:text-[16rem] lg:text-[18rem] transition-all duration-700 ${
            heroIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          FLU
          <span className="relative inline-block align-baseline">
            X
            <LeafIcon
              className={`absolute -top-6 -right-7 h-12 w-12 text-green-500 transition-transform duration-[900ms] ease-out ${
                heroIn ? "rotate-0 scale-100" : "-rotate-6 scale-75"
              }`}
            />
          </span>
          D
        </h1>
      </section>

      {/* Description grid - three-section cut */}
      <section className="max-w-[1500px] mx-auto px-6 md:px-8 mb-24 border-x border-neutral-200 relative">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 border-t border-b border-neutral-200">
          {/* Left tall cell spanning two rows */}
          <div className="md:col-span-7 border-b md:border-r border-neutral-200 p-8 md:p-16 row-span-2">
            <h2 className="text-black font-extrabold tracking-tight text-[2.5rem] md:text-[3.75rem] lg:text-[4.75rem] leading-[1]">
              Seamless Lending. Instant Sanction.<br /> Infinite Trust.
            </h2>
          </div>
          {/* Right top cell */}
          <div className="md:col-span-5 border-b border-neutral-200 p-8 md:p-12">
            <p className="text-neutral-800 text-base md:text-[1.1rem] leading-relaxed">
              This app simplifies the entire loan process by allowing users to check eligibility, verify documents, get personalized offers, and receive instant loan sanctions securely — all in one place,<br />in<InlineTypewriter words={["हिन्दी","राजस्थानी","ಕನ್ನಡ","অসমীয়া","اردو","தமிழ்","മലയാളം","తెలుగు"]} />.
            </p>
          </div>
          {/* Right bottom cell with button */}
          <div className="md:col-span-5 p-8 md:p-12">
            <button onClick={handleBegin} className="w-full md:w-[30rem] bg-[#6FFF8A] text-black font-semibold px-10 h-14 rounded-md shadow-sm hover:bg-green-400 transition border border-green-300 text-sm tracking-wide">
              LET’S BEGIN!
            </button>
          </div>
        </div>
        {/* Centered scroll-down arrow */}
        <a href="#highlights" className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2 -bottom-6 h-12 w-12 rounded-full border border-neutral-300 bg-white shadow-sm hover:bg-neutral-50 transition" aria-label="Scroll to highlights">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </a>
      </section>

      {/* Alternating full-viewport feature sections 001–006 */}
      <section id="features" className="max-w-[1500px] mx-auto px-0 md:px-0 border-x border-neutral-200">
        {features.map((f, i) => {
          const imageLeft = i % 2 === 1 // start with image left on 002
          return (
            <div id={f.slug} key={f.id} className="min-h-screen md:h-screen grid grid-cols-1 lg:grid-cols-12 border-t border-neutral-200 scroll-mt-20">
              {/* Image side */}
              <div className={`${imageLeft ? "order-1 lg:order-1" : "order-1 lg:order-2"} lg:col-span-6 border-b lg:border-b-0 lg:border-r border-neutral-200 flex items-center p-6 md:p-10`}>
                <div className="w-full aspect-[16/10] md:aspect-[4/3] lg:aspect-[16/12] rounded-xl border border-neutral-200 bg-gradient-to-br from-neutral-100 to-neutral-50 reveal-on-scroll" />
              </div>
              {/* Text side */}
              <div className={`${imageLeft ? "order-2 lg:order-2" : "order-2 lg:order-1"} lg:col-span-6 flex items-center p-8 md:p-16`}>
                <div className="space-y-6 max-w-2xl reveal-on-scroll">
                  <div className="flex items-center gap-3">
                    <span className="text-[0.65rem] font-bold tracking-[0.25em] text-neutral-500">{f.id}</span>
                    <span className="h-2 w-2 rounded-sm bg-green-400" />
                  </div>
                  <h3 className="text-3xl md:text-5xl font-extrabold leading-[1.05] text-black">{f.title}</h3>
                  <p className="text-neutral-800 text-base md:text-lg leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          )
        })}
        <div className="border-t border-neutral-200" />
      </section>

      <SiteFooter />
    </main>
  )
}

function LeafIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5c-5.5.7-9.5 3.3-11.7 6.7-2.2 3.3-2.5 7.4-2.5 9.8 2.4 0 6.5-.3 9.8-2.5 3.4-2.2 6-6.2 6.7-11.7-.4-.4-1.2-1.2-2.3-2.3Z" />
    </svg>
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

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 220 24" aria-hidden="true">
      <text x="0" y="18" fontFamily="Mona Sans, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" fontWeight="800" fontSize="18" fill="#000">UNIVERSE</text>
      <text x="142" y="18" fontFamily="Mona Sans, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif" fontWeight="800" fontSize="18" fill="#000">25</text>
      <g transform="translate(172,0)">
        <LeafIcon className="h-4 w-4 text-green-500" />
      </g>
    </svg>
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
      onMouseLeave={() => {
        setHovered(false)
        setIndex(0)
      }}
      className="uppercase tracking-widest select-none"
      aria-label={text}
    >
      {text.split("").map((ch, i) => (
        <span
          key={i}
          className={`transition-all duration-150 ${hovered && i < index ? "font-extrabold" : "font-medium"}`}
        >
          {ch}
        </span>
      ))}
    </span>
  )
}

// (animation removed per request)

function InlineTypewriter({ words, className = "" }: { words: string[]; className?: string }) {
  const [wordIndex, setWordIndex] = useState(0)
  const [subIndex, setSubIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const current = words[wordIndex % words.length]

  useEffect(() => {
    const typingSpeed = deleting ? 28 : 55
    const pauseAtEndMs = 600
    const pauseAtStartMs = 180

    if (!deleting && subIndex === current.length) {
      const id = setTimeout(() => setDeleting(true), pauseAtEndMs)
      return () => clearTimeout(id)
    }
    if (deleting && subIndex === 0) {
      setDeleting(false)
      setWordIndex((i) => (i + 1) % words.length)
      const id = setTimeout(() => setSubIndex(1), pauseAtStartMs)
      return () => clearTimeout(id)
    }

    const id = setTimeout(() => {
      setSubIndex((i) => i + (deleting ? -1 : 1))
    }, typingSpeed)
    return () => clearTimeout(id)
  }, [subIndex, deleting, current.length, words.length])

  const shown = current.substring(0, Math.max(0, subIndex))

  return (
    <span className={`inline-flex items-baseline align-baseline whitespace-nowrap ${className}`} aria-live="polite">
      <span className="ml-1 font-semibold text-black">
        {"\u00A0"}
        {shown}
      </span>
    </span>
  )
}
