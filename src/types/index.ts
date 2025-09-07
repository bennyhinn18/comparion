export interface Product {
  id: string;
  name: string;
  price?: string;
  image?: string;
  sourceUrl?: string;
  rating?: number;
  pros: string[];
  cons: string[];
  specs?: Record<string, string>;
  category?: string;
}

export interface ComparisonSummary {
  bestOverall?: Product;
  bestBudget?: Product;
  bestPerformance?: Product;
  summary: string;
}

export interface ComparisonData {
  products: Product[];
  summary: ComparisonSummary;
  query: string;
  searchResults?: any[];
}

export interface Session {
  id: string;
  query: string;
  timestamp: Date;
  results: ComparisonData | null;
}

export interface SearchResponse {
  success: boolean;
  data?: ComparisonData;
  error?: string;
}
