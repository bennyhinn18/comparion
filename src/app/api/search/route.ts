import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/searxng";
import { summarizeWithGemini } from "@/lib/gemini";
import { ComparisonData, Product } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { query, context, sessionId } = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Query is required" },
        { status: 400 }
      );
    }

    // Step 1: Search with SearXNG
    console.log("Searching for:", query);
    const searchResults = await searchProducts(query);

    if (!searchResults || searchResults.length === 0) {
      return NextResponse.json(
        { success: false, error: "No search results found" },
        { status: 404 }
      );
    }

    // Step 2: Summarize with Gemini AI
    console.log("Summarizing with Gemini...");
    const comparisonData = await summarizeWithGemini(query, searchResults, context);

    // Step 3: Return structured data
    const response: ComparisonData = {
      query,
      products: comparisonData.products,
      summary: comparisonData.summary,
      searchResults,
    };

    return NextResponse.json({ success: true, data: response });

  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
