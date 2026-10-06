import { NextRequest, NextResponse } from "next/server";
import { summarizeWithGemini } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const { query, history } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    // Call Gemini with Search Grounding
    console.log("Calling Gemini with query:", query);
    const response = await summarizeWithGemini(query, history || []);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("Search API error:", error);
    
    // Check if it's a rate limit error (429) based on the error message text
    const isRateLimit = error?.message?.includes("exceeded") || error?.message?.includes("quota") || error?.message?.includes("429");
    const statusCode = isRateLimit ? 429 : 500;
    const errorMessage = isRateLimit 
      ? "API Rate Limit Exceeded. Please try again in a few moments." 
      : (error?.message || "Internal server error");

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}
