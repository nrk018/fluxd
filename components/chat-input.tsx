"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mic, Send } from "lucide-react"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
}

export function ChatInput({ onSend, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSend(message)
      setMessage("")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <input
        type="text"
        placeholder="Ask Fluxd anything about your finances..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isLoading}
        className="glass-input flex-1"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground"
        disabled={isLoading}
      >
        <Mic className="w-5 h-5" />
      </Button>
      <Button
        type="submit"
        size="icon"
        className="bg-primary hover:bg-primary/90 text-primary-foreground glow-blue"
        disabled={isLoading || !message.trim()}
      >
        <Send className="w-5 h-5" />
      </Button>
    </form>
  )
}
