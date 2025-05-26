import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const apiRes = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer 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`,
    },
    body: JSON.stringify(body),
  })
  const data = await apiRes.json()
  return NextResponse.json(data, { status: apiRes.status })
} 