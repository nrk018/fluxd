import { NextRequest } from "next/server"

function getDummyProviders(eligibility: any) {
  const loanType = eligibility?.loan_type || "Personal"
  const amount = eligibility?.loan_amount || "₹5,00,000"
  return [
    {
      company: "HDFC Bank",
      loanType: loanType,
      maxAmount: amount,
      interestRate: "10.5% - 16%",
      tenure: "12-60 months",
      processingFee: "₹2,500 - ₹5,000",
      emi: "₹9,500 - ₹12,000",
      confidence: "high",
      badges: ["Recommended", "Fast Approval"],
      documents: ["Aadhaar Card", "PAN Card", "Salary Slip", "Bank Statement"],
      approvalTime: "2-5 days",
    },
    {
      company: "ICICI Bank",
      loanType: loanType,
      maxAmount: amount,
      interestRate: "11% - 17%",
      tenure: "12-60 months",
      processingFee: "₹2,000 - ₹4,500",
      emi: "₹9,800 - ₹12,500",
      confidence: "high",
      badges: ["Low EMI", "Fast Approval"],
      documents: ["Aadhaar Card", "PAN Card", "Salary Slip", "Bank Statement", "Employment Proof"],
      approvalTime: "3-7 days",
    },
    {
      company: "Axis Bank",
      loanType: loanType,
      maxAmount: amount,
      interestRate: "10.75% - 16.5%",
      tenure: "12-60 months",
      processingFee: "₹2,500 - ₹5,000",
      emi: "₹9,600 - ₹12,200",
      confidence: "medium",
      badges: ["Recommended"],
      documents: ["Aadhaar Card", "PAN Card", "Salary Slip", "Bank Statement"],
      approvalTime: "5-10 days",
    },
    {
      company: "Bajaj Finserv",
      loanType: loanType,
      maxAmount: amount,
      interestRate: "12% - 18%",
      tenure: "12-84 months",
      processingFee: "₹1,500 - ₹4,000",
      emi: "₹10,000 - ₹13,000",
      confidence: "medium",
      badges: ["Low Processing Fee"],
      documents: ["Aadhaar Card", "PAN Card", "Salary Slip"],
      approvalTime: "1-3 days",
    },
    {
      company: "Fullerton India",
      loanType: loanType,
      maxAmount: amount,
      interestRate: "13% - 20%",
      tenure: "12-60 months",
      processingFee: "₹2,000 - ₹5,000",
      emi: "₹10,500 - ₹14,000",
      confidence: "low",
      badges: [],
      documents: ["Aadhaar Card", "PAN Card", "Salary Slip", "Bank Statement"],
      approvalTime: "7-14 days",
    },
  ]
}

export async function POST(req: NextRequest) {
  try {
    const { eligibility = {} } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      // If no API key, return dummy data immediately
      const providers = getDummyProviders(eligibility)
      return new Response(JSON.stringify({ providers }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const prompt = `Search for real, active loan providers in India (banks, NBFCs, fintech companies) that offer loans matching these criteria:
- Loan Type: ${eligibility.loan_type || 'Personal'}
- Requested Amount: ${eligibility.loan_amount || 'Not specified'}
- Monthly Income: ${eligibility.monthly_income || 'Not specified'}
- Employment: ${eligibility.employment_type || 'Not specified'}
- Credit Score: ${eligibility.credit_score || 'Not specified'}
- City: ${eligibility.city || 'Not specified'}

Return STRICT JSON array with format:
[
  {
    "company": "Company Name",
    "loanType": "Personal/Home/Business/Education/Vehicle",
    "maxAmount": "₹X,XX,XXX",
    "interestRate": "X% - Y%",
    "tenure": "X-Y months/years",
    "processingFee": "₹X,XXX or X%",
    "emi": "₹X,XXX",
    "confidence": "high/medium/low",
    "badges": ["Fast Approval", "Low EMI", "Recommended"],
    "documents": ["Document 1", "Document 2"],
    "approvalTime": "X-Y days"
  }
]

Return at least 3-5 real providers with realistic rates and terms.`

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        }),
      }
    )

    const data = await resp.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]"
    const cleaned = text.replace(/^```[a-z]*\n|```$/g, "")
    let parsed: any[] = []
    try {
      parsed = JSON.parse(cleaned)
    } catch {
      // fallback: try to extract JSON array from text
      const match = cleaned.match(/\[[\s\S]*\]/);
      if (match) {
        try { parsed = JSON.parse(match[0]) } catch {}
      }
    }

    const providers = Array.isArray(parsed) && parsed.length > 0 ? parsed : getDummyProviders(eligibility)
    return new Response(JSON.stringify({ providers }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (e: any) {
    // On error, return dummy data
    const providers = getDummyProviders(eligibility)
    return new Response(JSON.stringify({ providers }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }
}
