"use client";

import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HistogramProps {
    data: { name: string; value: number }[];
    label: string;
}

export function DistributionHistogram({ data, label }: HistogramProps) {
    return (
        <Card className="h-[350px] w-full border-border/40 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Distribution: {label}</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] w-full pl-0">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barCategoryGap={1}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                            tickLine={false}
                            axisLine={false}
                            angle={-45}
                            textAnchor="end"
                            height={50}
                            interval={0}
                        />
                        <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                            }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}

