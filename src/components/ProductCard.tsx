"use client";

import { Product } from "@/types";
import { ExternalLink, Star, Trophy, DollarSign, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  isBestOverall?: boolean;
  isBestBudget?: boolean;
  isBestPerformance?: boolean;
}

export default function ProductCard({ 
  product, 
  isBestOverall, 
  isBestBudget, 
  isBestPerformance 
}: ProductCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getBadge = () => {
    if (isBestOverall) return { icon: Trophy, text: "Best Overall", color: "bg-yellow-500" };
    if (isBestBudget) return { icon: DollarSign, text: "Best Budget", color: "bg-green-500" };
    if (isBestPerformance) return { icon: Zap, text: "Best Performance", color: "bg-blue-500" };
    return null;
  };

  const badge = getBadge();

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow relative">
      {/* Badge */}
      {badge && (
        <div className={`absolute -top-3 left-4 ${badge.color} text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1`}>
          <badge.icon className="h-3 w-3" />
          {badge.text}
        </div>
      )}

      {/* Product Image */}
      {product.image && (
        <div className="w-full h-48 bg-muted rounded-lg mb-4 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Product Name */}
      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>

      {/* Price and Rating */}
      <div className="flex items-center justify-between mb-4">
        {product.price && (
          <span className="text-lg font-bold text-primary">{product.price}</span>
        )}
        {product.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
          </div>
        )}
      </div>

      {/* Pros and Cons */}
      <div className="space-y-3 mb-4">
        {product.pros.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-600 mb-1">Pros:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {product.pros.slice(0, 2).map((pro, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-green-500 mt-1">+</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        )}

        {product.cons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-600 mb-1">Cons:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {product.cons.slice(0, 2).map((con, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-red-500 mt-1">-</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Specs (expandable) */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
          >
            {isExpanded ? "Hide Specs" : "Show Specs"}
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          
          {isExpanded && (
            <div className="mt-2 space-y-1">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Source Link */}
      {product.sourceUrl && (
        <a
          href={product.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 border border-border rounded-md px-3 py-2 hover:bg-secondary transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          View Details
        </a>
      )}
    </div>
  );
}
