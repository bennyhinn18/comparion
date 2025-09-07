import { GoogleGenerativeAI } from "@google/generative-ai";
import { ComparisonData, Product, ComparisonSummary } from "@/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function summarizeWithGemini(
  query: string, 
  searchResults: any[], 
  context?: string
): Promise<ComparisonData> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = createComparisonPrompt(query, searchResults, context);
    
    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini response received");
    
    // Parse the JSON response
    const parsedData = parseGeminiResponse(text);
    
    return {
      query,
      products: parsedData.products,
      summary: parsedData.summary,
      searchResults,
    };

  } catch (error) {
    console.error("Gemini API error:", error);
    
    // Fallback: return mock comparison data
    if (process.env.NODE_ENV === "development") {
      console.log("Using fallback mock comparison data");
      return getMockComparisonData(query, searchResults);
    }
    
    throw error;
  }
}

function createComparisonPrompt(query: string, searchResults: any[], context?: string): string {
  const contextSection = context ? `\nContext from previous query: ${context}\n` : "";
  
  const resultsText = searchResults
    .slice(0, 10) // Limit to avoid token limits
    .map((result, index) => `
${index + 1}. Title: ${result.title}
   URL: ${result.url}
   Content: ${result.content}
`)
    .join("\n");

  return `You are an expert product comparison analyst. Analyze the following search results for the query "${query}" and create a structured comparison.

${contextSection}

Search Results:
${resultsText}

TASK: Create a JSON response with the following structure:

{
  "products": [
    {
      "id": "unique_id",
      "name": "Product Name",
      "price": "$XXX" or null,
      "image": "image_url" or null,
      "sourceUrl": "product_url",
      "rating": 4.5 or null,
      "pros": ["advantage 1", "advantage 2", "advantage 3"],
      "cons": ["disadvantage 1", "disadvantage 2"],
      "specs": {
        "CPU": "processor info",
        "RAM": "memory info",
        "Storage": "storage info",
        "GPU": "graphics info",
        "Display": "screen info",
        "Battery": "battery info",
        "OS": "operating system"
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

REQUIREMENTS:
1. Extract 3-6 distinct products from the search results
2. Infer specifications from the content when available
3. Assign realistic pros/cons based on the information
4. Choose best overall, budget, and performance picks
5. Ensure all prices are in consistent format
6. Create meaningful, actionable summaries
7. Only include specs that are relevant to the product category
8. Make sure the JSON is valid and properly formatted

Return ONLY the JSON response, no additional text or explanation.`;
}

function parseGeminiResponse(text: string): { products: Product[], summary: ComparisonSummary } {
  try {
    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const jsonStr = jsonMatch[0];
    const parsed = JSON.parse(jsonStr);

    // Validate and process the response
    const products: Product[] = parsed.products.map((p: any, index: number) => ({
      id: p.id || `product_${index}`,
      name: p.name || "Unknown Product",
      price: p.price || null,
      image: p.image || null,
      sourceUrl: p.sourceUrl || null,
      rating: p.rating || null,
      pros: Array.isArray(p.pros) ? p.pros : [],
      cons: Array.isArray(p.cons) ? p.cons : [],
      specs: p.specs || {},
      category: p.category || "general",
    }));

    const summary: ComparisonSummary = {
      bestOverall: parsed.summary?.bestOverall || products[0] || null,
      bestBudget: parsed.summary?.bestBudget || products[1] || null,
      bestPerformance: parsed.summary?.bestPerformance || products[2] || null,
      summary: parsed.summary?.summary || "Product comparison completed.",
    };

    return { products, summary };

  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to parse AI response");
  }
}

// Mock data for development/testing
function getMockComparisonData(query: string, searchResults: any[]): ComparisonData {
  const mockProducts: Product[] = [
    {
      id: "laptop_1",
      name: "Gaming Laptop Pro X1",
      price: "$1,299",
      image: null,
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
      price: "$799",
      image: null,
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
      price: "$2,499",
      image: null,
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
    searchResults,
  };
}
