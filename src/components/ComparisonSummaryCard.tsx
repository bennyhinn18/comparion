"use client";

import { ComparisonSummary } from "@/types";
import { Trophy, DollarSign, Zap, Lightbulb } from "lucide-react";

interface ComparisonSummaryCardProps {
  summary: ComparisonSummary;
}

export default function ComparisonSummaryCard({ summary }: ComparisonSummaryCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">AI Summary</h2>
      </div>

      {/* Summary Text */}
      <div className="mb-6">
        <p className="text-muted-foreground leading-relaxed">
          {summary.summary}
        </p>
      </div>

      {/* Top Picks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Overall */}
        {summary.bestOverall && (
          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800 dark:text-yellow-200">Best Overall</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {summary.bestOverall.name}
            </p>
            {summary.bestOverall.price && (
              <p className="text-sm text-muted-foreground">
                {summary.bestOverall.price}
              </p>
            )}
          </div>
        )}

        {/* Best Budget */}
        {summary.bestBudget && (
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800 dark:text-green-200">Best Budget</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {summary.bestBudget.name}
            </p>
            {summary.bestBudget.price && (
              <p className="text-sm text-muted-foreground">
                {summary.bestBudget.price}
              </p>
            )}
          </div>
        )}

        {/* Best Performance */}
        {summary.bestPerformance && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800 dark:text-blue-200">Best Performance</span>
            </div>
            <p className="text-sm font-semibold text-foreground">
              {summary.bestPerformance.name}
            </p>
            {summary.bestPerformance.price && (
              <p className="text-sm text-muted-foreground">
                {summary.bestPerformance.price}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
