interface SearXNGResult {
  title: string;
  url: string;
  content: string;
  engine: string;
  parsed_url: string[];
  template: string;
  positions: number[];
  score: number;
  category: string;
}

interface SearXNGResponse {
  query: string;
  number_of_results: number;
  results: SearXNGResult[];
  answers: any[];
  corrections: any[];
  infoboxes: any[];
  suggestions: string[];
  unresponsive_engines: string[];
}

export async function searchProducts(query: string): Promise<SearXNGResult[]> {
  // List of public SearXNG instances to try
  const searxngInstances = [
    process.env.SEARXNG_URL || "https://searx.be",
    "https://searx.ninja",
    "https://search.privacyguides.net",
    "https://searx.tiekoetter.com"
  ];
  
  for (const searxngUrl of searxngInstances) {
    try {
      const searchUrl = new URL("/search", searxngUrl);
      searchUrl.searchParams.set("q", query);
      searchUrl.searchParams.set("format", "json");
      searchUrl.searchParams.set("categories", "general,shopping");
      searchUrl.searchParams.set("engines", "google,bing,duckduckgo");
      searchUrl.searchParams.set("safesearch", "1");

      console.log("Trying SearXNG URL:", searchUrl.toString());

      const response = await fetch(searchUrl.toString(), {
        headers: {
          "User-Agent": "Comparion/1.0",
          "Accept": "application/json",
        },
        // Add timeout
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        console.warn(`SearXNG instance ${searxngUrl} returned ${response.status}, trying next...`);
        continue;
      }

      const data: SearXNGResponse = await response.json();
    
      // Filter and limit results
      const filteredResults = data.results
        .filter((result) => {
          // Filter out low-quality results
          return (
            result.title && 
            result.content && 
            result.url &&
            result.title.length > 10 &&
            result.content.length > 50 &&
            !result.url.includes("youtube.com") &&
            !result.url.includes("twitter.com") &&
            !result.url.includes("facebook.com")
          );
        })
        .slice(0, 20); // Limit to first 20 results

      console.log(`Found ${filteredResults.length} filtered results from ${searxngUrl}`);
      return filteredResults;

    } catch (error) {
      console.warn(`Failed to fetch from ${searxngUrl}:`, error);
      // Continue to next instance
    }
  }
  
  // If all instances failed, use fallback
  console.error("All SearXNG instances failed");
  
  // Fallback: return mock data for development
  if (process.env.NODE_ENV === "development") {
    console.log("Using fallback mock data for development");
    return getMockSearchResults(query);
  }
  
  throw new Error("All SearXNG instances unavailable");
}

// Mock data for development/testing
function getMockSearchResults(query: string): SearXNGResult[] {
  const mockResults: SearXNGResult[] = [
    {
      title: "Best Gaming Laptop 2024 - High Performance",
      url: "https://example.com/gaming-laptop-1",
      content: "Powerful gaming laptop with RTX 4070, Intel i7-13700H, 16GB RAM, 1TB SSD. Perfect for AAA games and content creation. Price: $1,299",
      engine: "google",
      parsed_url: ["https", "example.com", "/gaming-laptop-1", "", "", ""],
      template: "default.html",
      positions: [1],
      score: 0.95,
      category: "general"
    },
    {
      title: "Budget Gaming Laptop - Best Value Under $800",
      url: "https://example.com/budget-laptop",
      content: "Affordable gaming laptop with GTX 1650, AMD Ryzen 5, 8GB RAM, 512GB SSD. Great performance for 1080p gaming. Price: $799",
      engine: "bing",
      parsed_url: ["https", "example.com", "/budget-laptop", "", "", ""],
      template: "default.html",
      positions: [2],
      score: 0.87,
      category: "general"
    },
    {
      title: "Premium Gaming Laptop - Ultimate Performance",
      url: "https://example.com/premium-laptop",
      content: "Top-tier gaming laptop with RTX 4080, Intel i9-13900H, 32GB RAM, 2TB SSD. Designed for 4K gaming and professional work. Price: $2,499",
      engine: "duckduckgo",
      parsed_url: ["https", "example.com", "/premium-laptop", "", "", ""],
      template: "default.html",
      positions: [3],
      score: 0.92,
      category: "general"
    }
  ];

  return mockResults;
}
