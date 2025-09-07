"use client";

import { ComparisonData } from "@/types";
import ProductCard from "./ProductCard";
import ComparisonSummaryCard from "./ComparisonSummaryCard";
import SearchInterface from "./SearchInterface";

interface ComparisonResultsProps {
  data: ComparisonData;
  onFollowUp: (query: string) => void;
  isLoading: boolean;
}

export default function ComparisonResults({ data, onFollowUp, isLoading }: ComparisonResultsProps) {
  return (
    <div className="space-y-8">
      {/* Summary Section */}
      <ComparisonSummaryCard summary={data.summary} />

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product}
            isBestOverall={product.id === data.summary.bestOverall?.id}
            isBestBudget={product.id === data.summary.bestBudget?.id}
            isBestPerformance={product.id === data.summary.bestPerformance?.id}
          />
        ))}
      </div>

      {/* Follow-up Search */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold mb-4">Refine your search</h3>
        <SearchInterface onSearch={onFollowUp} isLoading={isLoading} />
      </div>
    </div>
  );
}
