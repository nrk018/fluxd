"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <Logo size="sm" />
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive("/dashboard") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/chat"
                className={`text-sm font-medium transition-colors ${
                  isActive("/chat") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Chat
              </Link>
              <Link
                href="/analytics"
                className={`text-sm font-medium transition-colors ${
                  isActive("/analytics") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Analytics
              </Link>
              <Link
                href="/settings"
                className={`text-sm font-medium transition-colors ${
                  isActive("/settings") ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Settings
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm">
                Sign in
              </Button>
            </Link>
            <Link href="/auth">
              <Button className="text-sm">Get started</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
