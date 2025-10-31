"use client"

import { useEffect, useState } from "react"
import { SimpleTree } from "@/components/ui/simple-growth-tree"

export function LoaderOverlay() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const id = setTimeout(() => setVisible(false), 1400)
    return () => clearTimeout(id)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      <div className="absolute inset-0">
        <SimpleTree />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="recap-hero-title text-black font-black tracking-tight text-[12vw] sm:text-[10vw] md:text-[8rem] drop-shadow-[0_1px_2px_rgba(255,255,255,0.6)]">
          FLU<span className="relative inline-block">X</span>D
        </h1>
      </div>
      <div className="absolute inset-0 bg-white/70 transition-opacity duration-700" />
    </div>
  )
}


