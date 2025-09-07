"use client";

import { useState } from "react";
import { Search, Sparkles } from "lucide-react";

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

export default function SearchInterface({ onSearch, isLoading }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const exampleQueries = [
    "Best laptops under $1000",
    "Gaming headsets comparison",
    "Electric toothbrushes review",
    "Smartphone cameras 2024",
    "Coffee makers under $200",
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'Best laptops under $1000' or 'Gaming headsets comparison'"
            className="w-full pl-12 pr-16 py-4 text-lg border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Compare
              </>
            )}
          </button>
        </div>
      </form>

      {/* Example Queries */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">Try these examples:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
              disabled={isLoading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
