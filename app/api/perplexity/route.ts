import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Optional: temporary log for API key (see above)
  console.log("PERPLEXITY_API_KEY loaded:", process.env.PERPLEXITY_API_KEY ? "Yes" : "NO");

  const bodyFromClient = await req.json();
  console.log(
    "--- Body received from client (and being sent to Perplexity) ---:",
    JSON.stringify(bodyFromClient, null, 2)
  );

  try {
    const apiRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(bodyFromClient),
    });

    const responseData = await apiRes.json(); // Try to parse JSON regardless of status for more info
    console.log("--- Response status from Perplexity API ---:", apiRes.status);
    console.log(
      "--- Response data from Perplexity API ---:",
      JSON.stringify(responseData, null, 2) // This might contain Perplexity's specific error message
    );

    return NextResponse.json(responseData, { status: apiRes.status });

  } catch (error: any) {
    console.error("--- Error during fetch to Perplexity API ---:", error);
    return NextResponse.json({ error: "Failed to fetch from Perplexity", details: error.message }, { status: 500 });
  }
}