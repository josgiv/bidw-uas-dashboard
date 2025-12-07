import React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonInsightProps {
    current: number;
    baseline: number;
    metric: string;
    inverse?: boolean; // If true, lower is better (e.g. Bounce Rate, Churn)
    formatValue?: (val: number) => string;
}

export const ComparisonInsight = ({
    current,
    baseline,
    metric,
    inverse = false,
    formatValue = (v) => v.toLocaleString()
}: ComparisonInsightProps) => {
    if (!baseline) return null;

    const diff = current - baseline;
    const pct = (diff / baseline) * 100;

    // Determine sentiment
    // Standard: Higher is Good (Green), Lower is Bad (Red)
    // Inverse: Higher is Bad (Red), Lower is Good (Green)
    const isPositive = diff > 0;
    const isNeutral = diff === 0;

    const isGood = inverse ? !isPositive : isPositive;

    const sentimentColor = isNeutral
        ? "text-gray-500"
        : isGood ? "text-emerald-600" : "text-red-500";

    const bgColor = isNeutral
        ? "bg-gray-100"
        : isGood ? "bg-emerald-50" : "bg-red-50";

    const Icon = isNeutral ? Minus : isPositive ? ArrowUp : ArrowDown;

    return (
        <div className={cn("mt-4 p-3 rounded-lg border flex items-center gap-3", bgColor, "border-transparent")}>
            <div className={cn("p-2 rounded-full bg-white shadow-sm flex items-center justify-center", sentimentColor)}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{metric} vs Comparison</p>
                <div className="flex items-baseline gap-2">
                    <span className={cn("text-sm font-bold", sentimentColor)}>
                        {Math.abs(pct).toFixed(1)}% {isPositive ? "Higher" : "Lower"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        ({diff > 0 ? "+" : ""}{formatValue(diff)})
                    </span>
                </div>
            </div>
        </div>
    );
};
