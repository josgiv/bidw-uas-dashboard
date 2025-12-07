"use client";

import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";
import { ProductPerformance } from "@/lib/types";
import { useDashboard } from "../DashboardContext";
import { toast } from "sonner";

interface TopProductsChartProps {
    data: ProductPerformance[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-white/10 bg-black/90 p-4 backdrop-blur-md shadow-2xl">
                <p className="mb-2 max-w-[200px] text-sm font-medium text-gray-300 break-words">{label}</p>
                <div className="flex flex-col gap-1">
                    <p className="text-2xl font-bold text-emerald-400">
                        ${payload[0].value?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Revenue</p>
                </div>
            </div>
        );
    }
    return null;
};

export const TopProductsChart = ({ data }: TopProductsChartProps) => {
    const { setFilters, filters } = useDashboard();
    const top10 = data.slice(0, 10);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBarClick = (data: any) => {
        if (data && data.name) {
            // Check if already filtered by this product to toggle off? 
            // For now, let's just set it.
            if (filters.product === data.name) {
                setFilters({ ...filters, product: 'ALL' });
                toast.dismiss();
                toast.info(`Cleared filter for ${data.name}`);
            } else {
                setFilters({ ...filters, product: data.name });
                toast.success(`Filtered by product: ${data.name}`);
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex h-[500px] w-full flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm"
        >
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Top Products by Revenue</h3>
                <span className="text-xs text-gray-500">Click bar to filter</span>
            </div>

            {/* 
                CRITICAL FIX: 
                Container must have flex-1 and min-h-0 to allow ResponsiveContainer to size correctly within a flex column 
                without collapsing to 0 or growing infinitely.
            */}
            <div className="min-h-0 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={top10}
                        layout="vertical"
                        margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
                        onMouseLeave={() => setActiveIndex(null)}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis type="number" hide />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={120}
                            stroke="#9ca3af"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => value.length > 18 ? `${value.substring(0, 18)}...` : value}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            content={<CustomTooltip />}
                        />
                        <Bar
                            dataKey="revenue"
                            radius={[0, 4, 4, 0]}
                            barSize={24}
                            onClick={handleBarClick}
                            className="cursor-pointer"
                        >
                            {top10.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={
                                        filters.product === entry.name
                                            ? "#10b981" // Active filter color (Solid)
                                            : activeIndex === index
                                                ? "#34d399" // Hover color
                                                : "rgba(16, 185, 129, 0.6)" // Default transparent-ish
                                    }
                                    className="transition-all duration-300"
                                    onMouseEnter={() => setActiveIndex(index)}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};
