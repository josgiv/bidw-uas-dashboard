"use client";
import React, { useMemo, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import * as echarts from 'echarts';

interface CategoryTrendProps {
    data: {
        date: string;
        category: string;
        value: number;
    }[];
}

export const CategoryTrendChart = ({ data }: CategoryTrendProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const options = useMemo(() => {
        // 1. Aggregate data by date for efficiency
        const dateMap = new Map<string, Map<string, number>>();
        const categorySet = new Set<string>();

        data.forEach(d => {
            categorySet.add(d.category);
            if (!dateMap.has(d.date)) {
                dateMap.set(d.date, new Map());
            }
            const catMap = dateMap.get(d.date)!;
            catMap.set(d.category, (catMap.get(d.category) || 0) + d.value);
        });

        const dates = Array.from(dateMap.keys()).sort();
        const categories = Array.from(categorySet);

        // 2. Sample data for performance (max 60 points)
        const maxPoints = 60;
        const step = Math.max(1, Math.floor(dates.length / maxPoints));
        const sampledDates = dates.filter((_, i) => i % step === 0);

        // 3. Prepare Series Data
        const gradientColors = [
            { start: '#80ffa5', end: '#01bfec' },
            { start: '#00ddff', end: '#4d77ff' },
            { start: '#37a2ff', end: '#7415db' },
            { start: '#ff0087', end: '#87009d' },
            { start: '#ffbf00', end: '#e03e4c' }
        ];

        const series = categories.map((cat, index) => {
            const grad = gradientColors[index % gradientColors.length];
            return {
                name: cat,
                type: 'line',
                stack: 'Total',
                smooth: 0.4,
                sampling: 'lttb',
                lineStyle: { width: 0 },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.85,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: grad.start },
                        { offset: 1, color: grad.end }
                    ])
                },
                emphasis: { focus: 'series' },
                data: sampledDates.map(date => {
                    const catMap = dateMap.get(date);
                    return catMap?.get(cat) || 0;
                }),
                animationDuration: 800,
                animationEasing: 'cubicOut'
            };
        });

        return {
            backgroundColor: 'transparent',
            color: gradientColors.map(g => g.start),
            animation: true,
            animationThreshold: 2000,
            animationDuration: 800,
            animationEasing: 'cubicOut',
            tooltip: {
                trigger: 'axis',
                confine: true,
                enterable: false,
                appendToBody: true,
                axisPointer: {
                    type: 'cross',
                    animation: true,
                    label: { backgroundColor: '#6a7985' }
                },
                backgroundColor: 'rgba(0,0,0,0.85)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: [12, 16],
                textStyle: {
                    color: '#fff',
                    fontSize: 12
                },
                formatter: (params: { seriesName: string; value: number; axisValue: string }[]) => {
                    if (!Array.isArray(params) || params.length === 0) return '';
                    const date = params[0].axisValue;
                    let total = 0;
                    let html = `<div style="font-weight:600;margin-bottom:8px;">${new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>`;
                    params.forEach(p => {
                        if (p.value) {
                            total += p.value;
                            html += `<div style="display:flex;justify-content:space-between;gap:20px;"><span>${p.seriesName}</span><span style="font-weight:600;">$${p.value.toLocaleString()}</span></div>`;
                        }
                    });
                    html += `<div style="border-top:1px solid rgba(255,255,255,0.2);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;"><span>Total</span><span style="font-weight:700;">$${total.toLocaleString()}</span></div>`;
                    return html;
                }
            },
            legend: {
                data: categories,
                bottom: 35,
                textStyle: { color: isDark ? '#ccc' : '#666', fontSize: 11 },
                itemWidth: 16,
                itemHeight: 10
            },
            grid: {
                left: 50,
                right: 20,
                bottom: 80,
                top: 20,
                containLabel: false
            },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: sampledDates,
                axisLabel: {
                    color: isDark ? '#999' : '#666',
                    fontSize: 10,
                    interval: 'auto',
                    rotate: 0,
                    formatter: (value: string) => {
                        try {
                            const d = new Date(value);
                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        } catch {
                            return value;
                        }
                    }
                },
                axisLine: { show: false },
                axisTick: { show: false }
            }],
            yAxis: [{
                type: 'value',
                axisLabel: {
                    color: isDark ? '#999' : '#666',
                    fontSize: 10,
                    formatter: (value: number) => {
                        if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                        return `$${value}`;
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        type: 'dashed'
                    }
                }
            }],
            dataZoom: [
                { type: 'inside', start: 0, end: 100, throttle: 100 },
                {
                    type: 'slider',
                    start: 0,
                    end: 100,
                    height: 20,
                    bottom: 8,
                    borderColor: 'transparent',
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    fillerColor: isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)',
                    handleStyle: { color: '#6366f1' },
                    textStyle: { color: isDark ? '#999' : '#666', fontSize: 10 }
                }
            ],
            series
        };
    }, [data, isDark]);

    return (
        <Card className="h-full border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Category Performance Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <ReactECharts
                    option={options}
                    style={{ height: '350px', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                    notMerge={true}
                    lazyUpdate={true}
                />
            </CardContent>
        </Card>
    );
};
