"use client";

import React, { useMemo } from "react";
import { useDashboard } from "./DashboardContext";
import { MasterRecord, DimensionField, MetricField, FilterMeta } from "@/lib/types";
import { aggregateData, calculateHistogram, aggregateMatrix } from "@/lib/aggregator_v2";
import { calculateCascadingCounts } from "@/lib/filterUtils";
import { DynamicLineChart } from "./charts/DynamicLineChart";
import { MultiBarChart } from "./charts/MultiBarChart";
import { DynamicPieChart } from "./charts/DynamicPie";
import { TreemapVis } from "./charts/TreemapVis";
import { CorrelationHeatmap } from "./charts/CorrelationHeatmap";
import { DistributionHistogram } from "./charts/DistributionHistogram";
import { CustomerScatter } from "./charts/CustomerScatter";
import { PlaygroundChart } from "./charts/PlaygroundChart_v2";
import { MetricCard } from "./ui/MetricCard";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { TopProductsChart } from "./charts/TopProductsChart";
import { SalesTrendChart } from "./charts/SalesTrendChart";
import { GeoMapChart } from "./charts/GeoMapChart";
import { CategoryTrendChart } from "./charts/CategoryTrendChart";

interface DashboardProps {
    data: MasterRecord[];
    meta: FilterMeta;
}

export function DashboardClient({ data, meta }: DashboardProps) {
    const { analysisDimension, analysisMetric, filters, compareMode, comparisonFilters } = useDashboard();

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
    const filteredData = useMemo(() => getFilteredSubSet(data, filters), [data, filters]);

    // 1b. Filter Data (Comparison)
    const compFilteredData = useMemo(() =>
        compareMode ? getFilteredSubSet(data, comparisonFilters) : [],
        [data, comparisonFilters, compareMode]
    );

    // 2. High Level KPIs (Main)
    const kpi = useMemo(() => {
        const revenue = filteredData.reduce((acc, r) => acc + r.revenue, 0);
        const quantity = filteredData.reduce((acc, r) => acc + r.quantity, 0);
        const orders = new Set(filteredData.map(r => r.orderId)).size;
        const customers = new Set(filteredData.map(r => r.customerId)).size;
        return { revenue, quantity, orders, customers, aov: orders ? revenue / orders : 0 };
    }, [filteredData]);

    // 2b. High Level KPIs (Comparison)
    const compKpi = useMemo(() => {
        if (!compareMode) return null;
        const revenue = compFilteredData.reduce((acc, r) => acc + r.revenue, 0);
        const quantity = compFilteredData.reduce((acc, r) => acc + r.quantity, 0);
        const orders = new Set(compFilteredData.map(r => r.orderId)).size;
        const customers = new Set(compFilteredData.map(r => r.customerId)).size;
        return { revenue, quantity, orders, customers, aov: orders ? revenue / orders : 0 };
    }, [compFilteredData, compareMode]);

    // Helper to calculate % change
    const getChange = (current: number, previous: number | undefined) => {
        if (!previous) return undefined;
        return ((current - previous) / previous) * 100;
    };

    // 3. Chart Aggregations

    const trendData = useMemo(() =>
        aggregateData(filteredData, { groupBy: 'dateStr', metric: analysisMetric, orderBy: 'name' }),
        [filteredData, analysisMetric]
    );

    const compTrendData = useMemo(() =>
        compareMode ? aggregateData(compFilteredData, { groupBy: 'dateStr', metric: analysisMetric, orderBy: 'name' }) : [],
        [compFilteredData, analysisMetric, compareMode]
    );

    const breakdownData = useMemo(() =>
        aggregateData(filteredData, { groupBy: analysisDimension, metric: analysisMetric, orderBy: 'value', orderDirection: 'desc', limit: 10 }),
        [filteredData, analysisDimension, analysisMetric]
    );

    // Matrix: Comparison. If ViewBy is Category, compare with Gender? 
    // If ViewBy is Country, compare with Category?
    const secondaryDim: DimensionField = analysisDimension === 'gender' ? 'category' : 'gender';

    const matrixData = useMemo(() =>
        aggregateMatrix(filteredData, analysisDimension, secondaryDim, analysisMetric),
        [filteredData, analysisDimension, secondaryDim, analysisMetric]
    );

    const treemapData = useMemo(() =>
        aggregateData(filteredData, { groupBy: 'subcategory', metric: 'revenue' }),
        [filteredData]
    );

    const histogramData = useMemo(() =>
        calculateHistogram(filteredData, 'revenue', 200),
        [filteredData]
    );

    const customerScatter = useMemo(() => {
        const custMap = new Map<string, { x: number, y: number, z: number, name: string, country: string }>();
        filteredData.forEach(r => {
            if (!custMap.has(r.customerId)) {
                custMap.set(r.customerId, { x: 0, y: 0, z: 0, name: r.customerName, country: r.country });
            }
            const rec = custMap.get(r.customerId)!;
            rec.x++;
            rec.y += r.revenue;
            rec.z += 1;
        });
        return Array.from(custMap.values()).sort((a, b) => b.y - a.y).slice(0, 100);
    }, [filteredData]);

    // SalesTrendChart expects { date: string, revenue: number, orders: number }
    // Comparison: Merge main and comparison data
    const salesTrendData = useMemo(() => {
        // Map main data
        const mainMap = new Map(trendData.map(d => [d.name, d.value]));
        const compMap = new Map(compTrendData.map(d => [d.name, d.value]));

        // Union of all dates
        const allDates = Array.from(new Set([...Array.from(mainMap.keys()), ...Array.from(compMap.keys())])).sort();

        return allDates.map(date => ({
            date,
            revenue: mainMap.get(date) || 0,
            // Estimate orders for main
            orders: Math.round((mainMap.get(date) || 0) / (kpi.aov || 50)),
            // Comparison value (if any)
            comparison: compMap.get(date) || 0
        }));
    }, [trendData, compTrendData, kpi.aov]);

    // TopProductsChart expects { name, revenue, profit, quantity, contribution }
    const topProductsData = useMemo(() => {
        const productMap = new Map<string, { revenue: number, quantity: number }>();
        const totalRevenue = filteredData.reduce((acc, r) => acc + r.revenue, 0);

        filteredData.forEach(r => {
            const curr = productMap.get(r.productName) || { revenue: 0, quantity: 0 };
            productMap.set(r.productName, {
                revenue: curr.revenue + r.revenue,
                quantity: curr.quantity + r.quantity
            });
        });

        return Array.from(productMap.entries())
            .map(([name, val]) => ({
                name,
                revenue: val.revenue,
                profit: val.revenue * 0.2,
                quantity: val.quantity,
                contribution: totalRevenue ? (val.revenue / totalRevenue) * 100 : 0
            }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [filteredData]);

    const geoMapData = useMemo(() => {
        const countryMap = new Map<string, number>();
        const countryNameMap: Record<string, string> = {
            'USA': 'United States',
            'UNITED STATES': 'United States',
            'UK': 'United Kingdom',
            'UNITED KINGDOM': 'United Kingdom',
            'DE': 'Germany',
            'GERMANY': 'Germany',
            'FRANCE': 'France',
            'AUSTRALIA': 'Australia',
            'CANADA': 'Canada',
            'UNKNOWN': 'Unknown'
        };

        const toTitleCase = (str: string) => {
            return str.replace(
                /\w\S*/g,
                text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
            );
        };

        filteredData.forEach(r => {
            const raw = r.country ? r.country.toUpperCase() : 'UNKNOWN';
            // Use mapped name or fallback to Title Case (e.g. "CANADA" -> "Canada")
            const country = countryNameMap[raw] || toTitleCase(raw);
            if (country !== 'Unknown') {
                countryMap.set(country, (countryMap.get(country) || 0) + r.revenue);
            }
        });
        return Array.from(countryMap.entries()).map(([name, value]) => ({ name, value }));
    }, [filteredData]);

    const categoryTrendData = useMemo(() => {
        const map = new Map<string, number>();
        filteredData.forEach(r => {
            const date = r.dateStr; // MasterRecord has dateStr
            const key = `${date}|${r.category}`;
            map.set(key, (map.get(key) || 0) + r.revenue);
        });

        return Array.from(map.entries()).map(([key, value]) => {
            const [date, category] = key.split('|');
            return { date, category, value };
        }).sort((a, b) => a.date.localeCompare(b.date));
    }, [filteredData]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen space-y-6 p-4 md:p-8 md:pt-6 pb-20 overflow-x-hidden">
            {/* KPI Section */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                    title="Total Revenue"
                    value={`$${kpi.revenue.toLocaleString()}`}
                    icon={<DollarSign className="h-4 w-4" />}
                    trend={compareMode && compKpi ? getChange(kpi.revenue, compKpi.revenue) : undefined}
                />
                <MetricCard
                    title="Total Orders"
                    value={kpi.orders.toLocaleString()}
                    icon={<ShoppingCart className="h-4 w-4" />}
                    trend={compareMode && compKpi ? getChange(kpi.orders, compKpi.orders) : undefined}
                />
                <MetricCard
                    title="Unique Customers"
                    value={kpi.customers.toLocaleString()}
                    icon={<Users className="h-4 w-4" />}
                    trend={compareMode && compKpi ? getChange(kpi.customers, compKpi.customers) : undefined}
                />
                <MetricCard
                    title="Avg Order Value"
                    value={`$${kpi.aov.toFixed(0)}`}
                    icon={<TrendingUp className="h-4 w-4" />}
                    trend={compareMode && compKpi ? getChange(kpi.aov, compKpi.aov) : undefined}
                />
            </div>

            {/* Main Visuals Container */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-6"
            >
                {/* 1. Top Level Trend & Distribution */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <motion.div variants={itemVariants} className="lg:col-span-8 h-[350px]">
                        <SalesTrendChart data={salesTrendData} />
                    </motion.div>
                    <motion.div variants={itemVariants} className="lg:col-span-4 h-[350px]">
                        <DynamicPieChart data={breakdownData} title={`Top ${analysisDimension} by ${analysisMetric}`} />
                    </motion.div>
                </div>

                {/* 1.5. Category Gradient Trend (New) */}
                <motion.div variants={itemVariants} className="h-[400px]">
                    <CategoryTrendChart data={categoryTrendData} />
                </motion.div>

                {/* 2. Product Analysis (Bar Charts) */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <motion.div variants={itemVariants} className="h-[400px]">
                        <TopProductsChart data={topProductsData} />
                    </motion.div>
                    <motion.div variants={itemVariants} className="h-[400px]">
                        <MultiBarChart
                            data={matrixData.data}
                            keys={matrixData.columns}
                            colors={["#f472b6", "#60a5fa", "#a78bfa", "#34d399"]}
                            stacked
                            title={`${analysisDimension} vs ${secondaryDim}`}
                        />
                    </motion.div>
                </div>

                {/* 3. Advanced Playground (Custom Interactive Area) */}
                <motion.div variants={itemVariants}>
                    <PlaygroundChart data={filteredData} meta={meta} />
                </motion.div>

                {/* 4. Deep Dive Rows */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 2xl:grid-cols-3">
                    <motion.div variants={itemVariants} className="h-[400px] col-span-1 lg:col-span-2 2xl:col-span-3">
                        <GeoMapChart data={geoMapData} />
                    </motion.div>
                    <motion.div variants={itemVariants} className="h-[350px]">
                        <TreemapVis data={treemapData} />
                    </motion.div>
                    <motion.div variants={itemVariants} className="h-[350px]">
                        <DistributionHistogram data={histogramData} label="Order Value Distribution" />
                    </motion.div>
                    <motion.div variants={itemVariants} className="h-[350px]">
                        <CustomerScatter data={customerScatter} xLabel="Line Items" yLabel="Lifetime Value" />
                    </motion.div>
                </div>

                {/* 5. Logic Check Heatmap */}
                <motion.div variants={itemVariants} className="h-[450px]">
                    <CorrelationHeatmap data={matrixData.data} columns={matrixData.columns} metricLabel={analysisMetric} />
                </motion.div>
            </motion.div>
        </div>
    );
}
