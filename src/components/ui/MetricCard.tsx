import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: number;
    trendLabel?: string;
    icon?: React.ReactNode;
    description?: string;
}

export const MetricCard = ({ title, value, trend, trendLabel, icon, description }: MetricCardProps) => {
    const isPositive = trend && trend >= 0;

    return (
        <Card className="hover:shadow-md transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                {icon ? (
                    <div className="text-muted-foreground">{icon}</div>
                ) : (
                    <Activity className="h-4 w-4 text-muted-foreground" />
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {(trend !== undefined || description) && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        {trend !== undefined && (
                            <span className={cn("flex items-center font-medium", isPositive ? "text-emerald-600" : "text-rose-600")}>
                                {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                {Math.abs(trend)}%
                            </span>
                        )}
                        <span>{trendLabel || description}</span>
                    </p>
                )}
            </CardContent>
        </Card>
    );
};
