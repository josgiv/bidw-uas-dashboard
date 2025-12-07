"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// Mock data structure for segment - needs to be calculated in processing
interface CustomerSegment {
    name: string;
    value: number;
    color: string;
}

interface CustomerStatsChartProps {
    newVsRepeat: { name: string; value: number }[];
}

const COLORS = ["#8b5cf6", "#ec4899"];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-white/10 bg-black/80 p-4 backdrop-blur-md">
                <p className="text-lg font-bold text-white">
                    {payload[0].name}
                </p>
                <p className="text-sm text-gray-400">
                    {payload[0].value} Customers
                </p>
            </div>
        );
    }
    return null;
};

export const CustomerStatsChart = ({ newVsRepeat }: CustomerStatsChartProps) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const onPieEnter = (_: unknown, index: number) => {
        setActiveIndex(index);
    };

    const activeItem = activeIndex !== null ? newVsRepeat[activeIndex] : null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative h-[400px] w-full rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-6 backdrop-blur-sm"
        >
            <h3 className="mb-6 text-xl font-bold text-white">Customer Segmentation</h3>
            <div className="flex h-[300px] w-full items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={newVsRepeat}
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {newVsRepeat.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                    stroke="none"
                                    className="transition-all duration-300 outline-none"
                                    style={{
                                        filter: activeIndex === index ? `drop-shadow(0 0 10px ${COLORS[index % COLORS.length]})` : "none",
                                        transform: activeIndex === index ? "scale(1.05)" : "scale(1)",
                                        transformOrigin: "center center"
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Text Overlay */}
                <AnimatePresence>
                    {!activeItem && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                        >
                            <span className="text-4xl font-bold text-white">
                                {newVsRepeat.reduce((acc, curr) => acc + curr.value, 0)}
                            </span>
                            <span className="text-sm text-gray-500">Total Customers</span>
                        </motion.div>
                    )}
                    {activeItem && (
                        <motion.div
                            key="active-content"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                        >
                            <span className="text-4xl font-bold text-white" style={{ color: COLORS[activeIndex!] }}>
                                {((activeItem.value / newVsRepeat.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(0)}%
                            </span>
                            <span className="text-sm text-gray-400">{activeItem.name}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
