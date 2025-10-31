import { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json()
    if (!transcript || typeof transcript !== 'string') {
      return new Response(JSON.stringify({ error: 'transcript is required' }), { status: 400 })
    }
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) return new Response(JSON.stringify({ error: 'GEMINI_API_KEY missing' }), { status: 500 })

    const schema = {
      type: 'object',
      properties: {
        personal: {
          type: 'object',
          properties: {
            fullName: { type: 'string' },
            dob: { type: 'string' },
            gender: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            address: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
          },
        },
        employment: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            employer: { type: 'string' },
            title: { type: 'string' },
            experienceYears: { type: 'number' },
            monthlyIncome: { type: 'string' },
            verification: { type: 'string' },
          },
        },
        financial: {
          type: 'object',
          properties: {
            existingLoans: { type: 'string' },
            totalEmi: { type: 'string' },
            monthlyExpenses: { type: 'string' },
            bankAccountType: { type: 'string' },
            creditScore: { type: 'string' },
            annualIncome: { type: 'string' },
          },
        },
        loan: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            amount: { type: 'string' },
            tenure: { type: 'string' },
            purpose: { type: 'string' },
            startDate: { type: 'string' },
            collateral: { type: 'string' },
          },
        },
        additional: {
          type: 'object',
          properties: {
            residentialType: { type: 'string' },
            dependents: { type: 'string' },
            panOrAadhaar: { type: 'string' },
            maritalStatus: { type: 'string' },
          },
        },
      },
    }

    const prompt = `Extract the following fields from the conversation transcript. Return STRICT JSON only that matches this JSON Schema:
${JSON.stringify(schema)}

Transcript:\n${transcript}`

    const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
    })
    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
    // Try parse JSON; strip code fences if present
    const cleaned = text.replace(/^```[a-z]*\n|```$/g, '')
    let parsed: any = {}
    try { parsed = JSON.parse(cleaned) } catch {}
    return new Response(JSON.stringify({ extracted: parsed }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500 })
  }
}


