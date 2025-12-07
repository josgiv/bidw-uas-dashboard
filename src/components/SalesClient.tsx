
"use client";
import React, { useMemo } from "react";
import { MasterRecord } from "@/lib/types";
import { useDashboard } from "./DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DynamicLineChart } from "@/components/charts/DynamicLineChart";
import { MultiBarChart } from "@/components/charts/MultiBarChart";
import { MetricCard } from "@/components/ui/MetricCard";
import { DollarSign, TrendingUp, ShoppingCart } from "lucide-react";
import { ComparisonInsight } from "@/components/ui/ComparisonInsight";

interface SalesClientProps {
    data: MasterRecord[];
}

export function SalesClient({ data: allData }: SalesClientProps) {
    const { filters, compareMode, comparisonFilters } = useDashboard();

    // Reusable filter function
    const getFilteredSubSet = (sourceData: MasterRecord[], currentFilters: typeof filters) => {
        return sourceData.filter(r => {
            const matches = (key: keyof typeof filters, val: string) => {
                if (key === 'dateRange' || key === 'compareMode') return true;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const filterVal = (currentFilters as any)[key];
                if (filterVal === 'ALL') return true;
                if (Array.isArray(filterVal)) return (filterVal as string[]).includes(val);
                return filterVal === val;
            };

            if (!matches('category', r.category)) return false;
            if (!matches('subcategory', r.subcategory)) return false;
            if (!matches('country', r.country)) return false;
            if (!matches('gender', r.gender)) return false;
            if (!matches('maritalStatus', r.maritalStatus)) return false;
            if (!matches('product', r.productName)) return false;
            return true;
        });
    };

    // 1. Filter Data (Main)
    const filteredData = useMemo(() => getFilteredSubSet(allData, filters), [allData, filters]);

    // 2. Filter Data (Comparison)
    const compFilteredData = useMemo(() =>
        compareMode ? getFilteredSubSet(allData, comparisonFilters) : [],
        [allData, comparisonFilters, compareMode]
    );

    // Helper: Calculate KPIs for a dataset
    const calculateKPIs = (d: MasterRecord[]) => {
        const totalRevenue = d.reduce((sum, r) => sum + r.revenue, 0);
        const totalQuantity = d.reduce((sum, r) => sum + r.quantity, 0);
        const uniqueOrderCount = new Set(d.map(r => r.orderId)).size;
        const avgOrderValue = uniqueOrderCount > 0 ? totalRevenue / uniqueOrderCount : 0;
        return { totalRevenue, totalQuantity, uniqueOrderCount, avgOrderValue };
    };

    const mainKPI = calculateKPIs(filteredData);
    const compKPI = calculateKPIs(compFilteredData);

    const getChange = (current: number, previous: number) => {
        if (!previous) return undefined;
        return ((current - previous) / previous) * 100;
    };

    // Revenue by category
    const getCategoryRevenue = (d: MasterRecord[]) => {
        const catMap = d.reduce((acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + r.revenue;
            return acc;
        }, {} as Record<string, number>);
        return Object.entries(catMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    };

    const revenueData = getCategoryRevenue(filteredData);

    // Trend Data Logic (Merged)
    const getMonthlyTrend = (d: MasterRecord[]) => {
        const map = new Map<number, number>();
        d.forEach(r => {
            map.set(r.month, (map.get(r.month) || 0) + r.revenue);
        });
        return map;
    };

    const mainTrend = getMonthlyTrend(filteredData);
    const compTrend = getMonthlyTrend(compFilteredData);
    const allMonths = Array.from(new Set([...Array.from(mainTrend.keys()), ...Array.from(compTrend.keys())])).sort((a, b) => a - b);

    // Prepare Dataset for Chart
    const trendDataset = {
        xAxis: allMonths.map(m => `Month ${m}`),
        series: [
            { name: "Current", data: allMonths.map(m => mainTrend.get(m) || 0), color: "#6366f1" },
            ...(compareMode ? [{ name: "Comparison", data: allMonths.map(m => compTrend.get(m) || 0), color: "#cbd5e1" }] : [])
        ]
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Sales Analytics</h1>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <MetricCard
                    title="Total Revenue"
                    value={`$${mainKPI.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="h-4 w-4" />}
                    trend={compareMode ? getChange(mainKPI.totalRevenue, compKPI.totalRevenue) : undefined}
                />
                <MetricCard
                    title="Total Units Sold"
                    value={mainKPI.totalQuantity.toLocaleString()}
                    icon={<ShoppingCart className="h-4 w-4" />}
                    trend={compareMode ? getChange(mainKPI.totalQuantity, compKPI.totalQuantity) : undefined}
                />
                <MetricCard
                    title="Avg Order Value"
                    value={`$${mainKPI.avgOrderValue.toFixed(0)}`}
                    icon={<TrendingUp className="h-4 w-4" />}
                    trend={compareMode ? getChange(mainKPI.avgOrderValue, compKPI.avgOrderValue) : undefined}
                />
            </div>

            {/* Comparison Insights (Only in Compare Mode) */}
            {compareMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ComparisonInsight
                        current={mainKPI.totalRevenue}
                        baseline={compKPI.totalRevenue}
                        metric="Total Revenue"
                        formatValue={(v) => `$${v.toLocaleString()}`}
                    />
                    <ComparisonInsight
                        current={mainKPI.totalQuantity}
                        baseline={compKPI.totalQuantity}
                        metric="Total Units"
                    />
                    {/* Placeholder for third insight if needed */}
                </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DynamicLineChart
                    dataset={trendDataset}
                    yLabel="Revenue"
                    title="Monthly Revenue Trend"
                />
                <MultiBarChart
                    data={revenueData.slice(0, 5)} // Need to figure out if we show comparison bars too? For now, simplistic.
                    keys={['value']}
                    colors={['#10b981']}
                    title="Revenue by Category (Current)"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sales Insights</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Top Category</span>
                            <span className="text-sm text-muted-foreground">
                                {revenueData[0]?.name || 'N/A'}
                            </span>
                        </div>
                        <div className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm font-medium">Total Orders</span>
                            <span className="text-sm text-muted-foreground">
                                {mainKPI.uniqueOrderCount.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Avg Units per Order</span>
                            <span className="text-sm text-muted-foreground">
                                {(mainKPI.uniqueOrderCount > 0 ? mainKPI.totalQuantity / mainKPI.uniqueOrderCount : 0).toFixed(1)}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
