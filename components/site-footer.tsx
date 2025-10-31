"use client"

import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200">
      <div className="max-w-[1500px] mx-auto px-6 md:px-8 py-10 flex flex-col md:flex-row gap-6 items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="sr-only">Fluxd</span>
          <span className="text-sm font-extrabold tracking-wider">FLUXD</span>
          <span className="h-2 w-2 rounded-sm bg-green-400" />
        </Link>

        {/* Nav links */}
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-neutral-700">
          {[
            { label: "About", href: "/namde" },
            { label: "Contact", href: "/namde" },
            { label: "Privacy", href: "/namde" },
            { label: "Terms", href: "/namde" },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Socials */}
        <div className="flex items-center gap-4">
          <a href="https://x.com/NirmalModaliyar" target="_blank" rel="noreferrer" aria-label="X Profile" className="text-neutral-800 hover:text-neutral-600">
            {/* X icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M18.146 2H21l-6.744 7.72L22.5 22h-6.9l-5.4-6.97L3.5 22H1l7.3-8.36L1.5 2h6.9l4.94 6.377L18.146 2Zm-2.387 18h1.8L7.412 4h-1.8l10.147 16Z" />
            </svg>
          </a>
          <a href="https://github.com/nrk018" target="_blank" rel="noreferrer" aria-label="GitHub Profile" className="text-neutral-800 hover:text-neutral-600">
            {/* GitHub icon */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M12 .5C5.73.5.98 5.24.98 11.5c0 4.85 3.14 8.96 7.49 10.41.55.1.75-.24.75-.54 0-.27-.01-1.16-.02-2.11-3.05.66-3.7-1.3-3.7-1.3-.5-1.27-1.22-1.61-1.22-1.61-.99-.68.08-.67.08-.67 1.1.08 1.68 1.13 1.68 1.13.98 1.68 2.57 1.19 3.19.91.1-.71.38-1.19.69-1.46-2.43-.28-4.98-1.22-4.98-5.45 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.42.11-2.96 0 0 .92-.3 3.02 1.13.88-.24 1.82-.36 2.75-.36.93 0 1.87.12 2.75.36 2.1-1.43 3.02-1.13 3.02-1.13.6 1.54.22 2.68.11 2.96.7.77 1.13 1.75 1.13 2.95 0 4.24-2.56 5.16-5 5.43.39.33.73.98.73 1.99 0 1.44-.01 2.6-.01 2.95 0 .29.2.64.76.53 4.34-1.45 7.48-5.56 7.48-10.41C23.02 5.24 18.27.5 12 .5Z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
      <div className="border-t border-neutral-200">
        <div className="max-w-[1500px] mx-auto px-6 md:px-8 py-6 text-[11px] text-neutral-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} FLUXD</span>
          <span className="hidden md:block">Crafted with ♥︎</span>
        </div>
      </div>
    </footer>
  )
}


