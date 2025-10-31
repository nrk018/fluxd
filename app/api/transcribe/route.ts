import { NextRequest } from "next/server"

function toBase64(buf: ArrayBuffer) {
  return Buffer.from(new Uint8Array(buf)).toString('base64')
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return new Response(JSON.stringify({ error: 'GEMINI_API_KEY missing' }), { status: 500 })

    const contentType = req.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')
    let audioB64 = ''
    let mime = 'audio/webm'
    if (isJson) {
      const { audio, mimeType } = await req.json()
      audioB64 = audio
      mime = mimeType || mime
    } else {
      const arrayBuf = await req.arrayBuffer()
      audioB64 = toBase64(arrayBuf)
    }
    if (!audioB64) return new Response(JSON.stringify({ error: 'no audio' }), { status: 400 })

    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: 'Transcribe this meeting between a voice agent and a user. Return plain text.' },
            { inlineData: { mimeType: mime, data: audioB64 } },
          ],
        },
      ],
    }

    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}` , {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return new Response(JSON.stringify({ transcript: text }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500 })
  }
}


