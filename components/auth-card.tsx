import type React from "react"

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Blurred background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-black to-black -z-10" />

      {/* Glass card container */}
      <div className="glass-card w-full max-w-md mx-4 p-8 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-balance glow-text">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
        </div>

        {/* Content */}
        {children}
      </div>
    </div>
  )
}
