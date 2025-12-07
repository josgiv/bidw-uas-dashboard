"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface HistogramProps {
    data: { name: string; value: number }[];
    label: string;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        return (
            <div className="bg-slate-900/95 text-white px-4 py-3 rounded-lg border border-white/10 shadow-xl">
                <div className="font-semibold text-sm mb-2">Order Value Range</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <span className="text-slate-400">Range</span>
                    <span className="font-medium text-right">${label}</span>
                    <span className="text-slate-400">Orders</span>
                    <span className="font-medium text-right text-green-400">{value.toLocaleString()}</span>
                </div>
            </div>
        );
    }
    return null;
};

export function DistributionHistogram({ data, label }: HistogramProps) {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    const maxValue = Math.max(...data.map(d => d.value));

    return (
        <Card className="h-full border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{label}</CardTitle>
                <CardDescription className="text-xs">{total.toLocaleString()} total orders across {data.length} ranges</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px] w-full p-4 pt-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barCategoryGap={2}>
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="hsl(var(--border))"
                            vertical={false}
                            opacity={0.5}
                        />
                        <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                            tickLine={false}
                            axisLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={55}
                            interval={0}
                            tickFormatter={(value: string) => `$${value}`}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            width={45}
                            tickFormatter={(value: number) => {
                                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                return value.toString();
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
                        <Bar dataKey="value" radius={[3, 3, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.value === maxValue ? '#22c55e' : '#6366f1'}
                                    opacity={0.8 + (entry.value / maxValue) * 0.2}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
