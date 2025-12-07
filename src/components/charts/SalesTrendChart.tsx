"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { SalesTrend } from "@/lib/types";
import { useDashboard } from "../DashboardContext";
import { toast } from "sonner";
import { format, parseISO, isValid } from "date-fns";

interface SalesTrendChartProps {
    data: SalesTrend[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-white/10 bg-black/90 p-4 backdrop-blur-md shadow-2xl">
                <p className="mb-2 text-sm font-medium text-gray-300">
                    {label && isValid(parseISO(label)) ? format(parseISO(label), "MMM dd, yyyy") : label}
                </p>
                <div className="flex flex-col gap-1">
                    <p className="text-2xl font-bold text-indigo-400">
                        ${payload[0].value?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Revenue</p>
                </div>
                {payload[1] && (
                    <div className="flex flex-col gap-1 mt-2 pt-2 border-t border-white/10">
                        <p className="text-xl font-bold text-pink-400">
                            ${payload[1].value?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Comparison</p>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export const SalesTrendChart = ({ data }: SalesTrendChartProps) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { setFilters, filters } = useDashboard();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handlePointClick = (data: any) => {
        if (data && data.activeLabel) {
            toast.info(`Date: ${data.activeLabel}`, {
                description: "Clicking specific dates could be used to zoom in."
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex h-[400px] w-full flex-col rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm"
        >
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Revenue Trend</h3>
            </div>

            <div className="min-h-0 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        onClick={handlePointClick}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorComparison" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis
                            dataKey="date"
                            stroke="#9ca3af"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={50}
                            angle={-30}
                            textAnchor="end"
                            height={60}
                            tickFormatter={(value) => {
                                try {
                                    return format(parseISO(value), "MMM dd");
                                } catch {
                                    return value;
                                }
                            }}
                        />
                        <YAxis
                            stroke="#9ca3af"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value / 1000}k`}
                            width={50}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                            name="Current"
                        />
                        <Area
                            type="monotone"
                            dataKey="comparison"
                            stroke="#ec4899"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorComparison)"
                            strokeDasharray="5 5"
                            name="Comparison"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};
