import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "messages must be an array" }), { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return new Response(JSON.stringify({ error: "GEMINI_API_KEY missing" }), { status: 500 })

    // Minimal Gemini 1.5 generation call
    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: messages.map((m: any) => `${m.role}: ${m.text}`).join("\n") }],
          },
        ],
      }),
    })
    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ""
    return new Response(JSON.stringify({ text }), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "unknown error" }), { status: 500 })
  }
}


