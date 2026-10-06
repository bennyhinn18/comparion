import { GoogleGenAI } from "@google/genai";
import { ComparisonData, Product, ComparisonSummary, Message, SearchResponse } from "@/types";

// Initialize the new @google/genai client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function summarizeWithGemini(
  query: string,
  history: Message[] = []
): Promise<SearchResponse> {
  try {
    const prompt = createComparisonPrompt(query, history);
    
    let response;
    try {
      console.log("Sending prompt to Gemini 3.5 Flash with Search Grounding...");
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { tools: [{ googleSearch: {} }] }
      });
    } catch (primaryError: any) {
      console.warn(`Gemini 3.5 Flash failed (Status: ${primaryError?.status || 'Unknown'}). Falling back to Gemini 2.5 Flash...`);
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { tools: [{ googleSearch: {} }] }
        });
      } catch (secondaryError: any) {
        console.warn(`Gemini 2.5 Flash failed (Status: ${secondaryError?.status || 'Unknown'}). Falling back to Gemini 3.5 Flash Lite...`);
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
          config: { tools: [{ googleSearch: {} }] }
        });
      }
    }

    const text = response.text || "";
    console.log("Gemini response received");
    
    // Parse the JSON response
    const parsedData = parseGeminiResponse(text);
    
    if (parsedData.isClarifying) {
      return {
        success: true,
        isClarifying: true,
        clarificationQuestion: parsedData.clarificationQuestion
      };
    }
    
    return {
      success: true,
      data: {
        query,
        products: parsedData.products,
        summary: parsedData.summary,
      }
    };

  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Fallback for development
    if (process.env.NODE_ENV === "development") {
      console.log("Using fallback mock comparison data");
      return {
        success: true,
        data: getMockComparisonData(query)
      };
    }
    
    throw error;
  }
}

function createComparisonPrompt(query: string, history: Message[]): string {
  const historyText = history.length > 0 
    ? `\nConversation History:\n${history.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}\n`
    : "";
  
  return `You are an expert product comparison assistant. The user wants to find or compare products.
Current request: "${query}"
${historyText}

INSTRUCTIONS:
1. First, evaluate if the user's request and history provide enough specific details to make a good recommendation (e.g., budget, use case, preferences).
2. If the request is too broad (e.g., just "best laptops" with no history), and you need more info to give a helpful recommendation, ask ONE clarifying question (specify budget in ₹ if applicable).
3. If you have enough information, use your Google Search tool to search the web for the best current products matching the criteria in INDIA and provide a full comparison.

TASK: Create a JSON response with the following structure:

Option A (Needs Clarification):
{
  "isClarifying": true,
  "clarificationQuestion": "What is your primary use case for the laptop (e.g., gaming, work, casual) and what is your budget in ₹?"
}

Option B (Ready to Search and Compare):
{
  "isClarifying": false,
  "products": [
    {
      "id": "unique_id",
      "name": "Product Name",
      "price": "₹XXX,XXX",
      "image": "image_url",
      "sourceUrl": "product_url",
      "rating": 4.5,
      "pros": ["advantage 1", "advantage 2", "advantage 3"],
      "cons": ["disadvantage 1", "disadvantage 2"],
      "specs": {
        "CPU": "processor info",
        "RAM": "memory info",
        "Storage": "storage info"
      },
      "category": "product_category"
    }
  ],
  "summary": {
    "bestOverall": { product object },
    "bestBudget": { product object },
    "bestPerformance": { product object },
    "summary": "A comprehensive 2-3 sentence summary explaining the key differences and recommendations"
  }
}

REQUIREMENTS FOR OPTION B:
- Extract 3-6 distinct products from your search results.
- Target the Indian market. Prioritize results from Amazon.in, Flipkart, Croma, or Reliance Digital.
- All prices MUST be in Indian Rupees (₹).
- For 'sourceUrl', you MUST provide the EXACT, real URL from your Google Search results. NEVER guess, make up, or hallucinate URLs. If you don't have the exact real link, set it to null.
- Assign realistic pros/cons based on the information.
- Choose best overall, budget, and performance picks.

Return ONLY the JSON response, no additional text, markdown formatting like \`\`\`json, or explanation.`;
}

function parseGeminiResponse(text: string): any {
  try {
    // Clean the response to extract JSON in case of markdown formatting
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const jsonStr = jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    if (parsed.isClarifying) {
      return {
        isClarifying: true,
        clarificationQuestion: parsed.clarificationQuestion || "Could you provide more details?"
      };
    }

    // Validate and process the response
    const products: Product[] = (parsed.products || []).map((p: any, index: number) => {
      let finalUrl = p.sourceUrl;
      // If no URL provided, or it looks like a placeholder, create a Google Search link optimized for India
      if (!finalUrl || finalUrl === "null" || finalUrl.includes("example.com") || finalUrl.includes("your-domain.com")) {
        finalUrl = `https://www.google.com/search?q=${encodeURIComponent((p.name || "Unknown Product") + " price in India buy")}&gl=in`;
      }

      return {
        id: p.id || `product_${index}`,
        name: p.name || "Unknown Product",
        price: p.price || undefined,
        image: p.image || undefined,
        sourceUrl: finalUrl,
        rating: p.rating || undefined,
        pros: Array.isArray(p.pros) ? p.pros : [],
        cons: Array.isArray(p.cons) ? p.cons : [],
        specs: p.specs || {},
        category: p.category || "general",
      };
    });

    const summary: ComparisonSummary = {
      bestOverall: parsed.summary?.bestOverall || products[0] || undefined,
      bestBudget: parsed.summary?.bestBudget || products[1] || undefined,
      bestPerformance: parsed.summary?.bestPerformance || products[2] || undefined,
      summary: parsed.summary?.summary || "Product comparison completed.",
    };

    return { isClarifying: false, products, summary };

  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    console.log("Raw response text:", text);
    throw new Error("Failed to parse AI response");
  }
}

// Mock data for development/testing
function getMockComparisonData(query: string): ComparisonData {
  const mockProducts: Product[] = [
    {
      id: "laptop_1",
      name: "Gaming Laptop Pro X1",
      price: "₹1,05,999",
      image: undefined,
      sourceUrl: "https://example.com/laptop-1",
      rating: 4.5,
      pros: ["Excellent gaming performance", "Good build quality", "Fast SSD storage"],
      cons: ["Battery life could be better", "Runs hot under load"],
      specs: {
        "CPU": "Intel i7-13700H",
        "RAM": "16GB DDR5",
        "GPU": "RTX 4070",
        "Storage": "1TB NVMe SSD",
        "Display": "15.6\" 144Hz",
        "Battery": "6-8 hours"
      },
      category: "laptops"
    },
    {
      id: "laptop_2",
      name: "Budget Gaming Laptop",
      price: "₹65,990",
      image: undefined,
      sourceUrl: "https://example.com/laptop-2",
      rating: 4.0,
      pros: ["Great value for money", "Decent 1080p gaming", "Lightweight design"],
      cons: ["Limited upgrade options", "Plastic build"],
      specs: {
        "CPU": "AMD Ryzen 5 5600H",
        "RAM": "8GB DDR4",
        "GPU": "GTX 1650",
        "Storage": "512GB SSD",
        "Display": "15.6\" 60Hz",
        "Battery": "5-7 hours"
      },
      category: "laptops"
    },
    {
      id: "laptop_3",
      name: "Premium Gaming Beast",
      price: "₹2,10,000",
      image: undefined,
      sourceUrl: "https://example.com/laptop-3",
      rating: 4.8,
      pros: ["Top-tier performance", "4K gaming capable", "Premium build quality"],
      cons: ["Very expensive", "Heavy and bulky"],
      specs: {
        "CPU": "Intel i9-13900H",
        "RAM": "32GB DDR5",
        "GPU": "RTX 4080",
        "Storage": "2TB NVMe SSD",
        "Display": "17.3\" 240Hz",
        "Battery": "4-6 hours"
      },
      category: "laptops"
    }
  ];

  const summary: ComparisonSummary = {
    bestOverall: mockProducts[0],
    bestBudget: mockProducts[1],
    bestPerformance: mockProducts[2],
    summary: "For gaming laptops, the Pro X1 offers the best balance of performance and value, while the Budget option is perfect for entry-level gaming, and the Premium Beast delivers uncompromising performance for enthusiasts."
  };

  return {
    query,
    products: mockProducts,
    summary,
  };
}
