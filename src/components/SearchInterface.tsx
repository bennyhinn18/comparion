"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles } from "lucide-react";

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  hideExamples?: boolean;
}

const exampleQueries = [
  "Best gaming laptops under ₹80000",
  "Smartphones with best camera",
  "Wireless noise cancelling headphones",
  "Coffee makers for home use",
  "Budget 4K smart TVs",
];

export default function SearchInterface({ onSearch, isLoading, hideExamples }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [queryIndex, setQueryIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const currentQuery = exampleQueries[queryIndex];
    
    if (isDeleting) {
      if (placeholder === "") {
        setIsDeleting(false);
        setQueryIndex((prev) => (prev + 1) % exampleQueries.length);
        timer = setTimeout(() => {}, 400); // Wait before typing next
      } else {
        timer = setTimeout(() => {
          setPlaceholder(currentQuery.substring(0, placeholder.length - 1));
        }, 40); // Deleting speed
      }
    } else {
      if (placeholder === currentQuery) {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 2500); // Pause before deleting
      } else {
        timer = setTimeout(() => {
          setPlaceholder(currentQuery.substring(0, placeholder.length + 1));
        }, 60); // Typing speed
      }
    }
    
    return () => clearTimeout(timer);
  }, [placeholder, queryIndex, isDeleting]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder ? `e.g., "${placeholder}"` : "e.g., \"\""}
            className="w-full pl-12 pr-16 py-4 text-lg border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-ellipsis"
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
      {!hideExamples && (
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
      )}
    </div>
  );
}
