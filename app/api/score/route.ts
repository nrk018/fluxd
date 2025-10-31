import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json()
    if (!transcript || typeof transcript !== 'string') {
      return new Response(JSON.stringify({ error: 'transcript is required' }), { status: 400 })
    }
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return new Response(JSON.stringify({ error: 'GEMINI_API_KEY missing' }), { status: 500 })

    const prompt = `Based on this conversation transcript for a loan application, estimate two values and return STRICT JSON only with fields: {"eligibilityScore": number (0-100), "confidence": number (0-1), "reason": string}. Consider income stability, EMIs vs income, credit score/expenses, and requested amount.

Transcript:\n${transcript}`

    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    })
    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    const cleaned = text.replace(/^```[a-z]*\n|```$/g, '')
    let parsed: any = {}
    try { parsed = JSON.parse(cleaned) } catch {}
    return new Response(JSON.stringify(parsed), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500 })
  }
}


