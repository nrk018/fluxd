interface MessageBubbleProps {
  content: string
  isAI: boolean
  timestamp?: string
}

export function MessageBubble({ content, isAI, timestamp }: MessageBubbleProps) {
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
          isAI
            ? "glass-card glow-blue border border-primary/30 bg-primary/5"
            : "bg-primary text-primary-foreground rounded-br-none"
        }`}
      >
        <p className="text-sm leading-relaxed">{content}</p>
        {timestamp && <p className="text-xs mt-1 opacity-70">{timestamp}</p>}
      </div>
    </div>
  )
}
