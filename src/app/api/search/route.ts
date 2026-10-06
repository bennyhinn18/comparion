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

  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
