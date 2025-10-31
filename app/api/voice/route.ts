import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { text, voiceId } = await req.json()
    if (!text) return new Response("Missing text", { status: 400 })
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) return new Response("ELEVENLABS_API_KEY missing", { status: 500 })

    const voice = voiceId || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM" // default Rachel
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.4, similarity_boost: 0.8 },
      }),
    })

    if (!r.ok) {
      const t = await r.text()
      return new Response(t, { status: r.status })
    }

    const arrayBuf = await r.arrayBuffer()
    return new Response(Buffer.from(arrayBuf), {
      status: 200,
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    })
  } catch (e: any) {
    return new Response(e?.message || "error", { status: 500 })
  }
}


