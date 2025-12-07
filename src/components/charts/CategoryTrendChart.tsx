"use client";
import React, { useMemo } from 'react';
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
        // 1. Extract Unique Dates (X-Axis) and Categories (Series)
        const dates = Array.from(new Set(data.map(d => d.date))).sort();
        const categories = Array.from(new Set(data.map(d => d.category)));

        // 2. Prepare Series Data
        const seriesMap: Record<string, number[]> = {};

        categories.forEach(cat => {
            seriesMap[cat] = dates.map(date => {
                const entry = data.find(d => d.date === date && d.category === cat);
                return entry ? entry.value : 0;
            });
        });

        // 3. Define Gradients for known categories (with fallback)
        const gradientColors = [
            { start: 'rgb(128, 255, 165)', end: 'rgb(1, 191, 236)' },
            { start: 'rgb(0, 221, 255)', end: 'rgb(77, 119, 255)' },
            { start: 'rgb(55, 162, 255)', end: 'rgb(116, 21, 219)' },
            { start: 'rgb(255, 0, 135)', end: 'rgb(135, 0, 157)' },
            { start: 'rgb(255, 191, 0)', end: 'rgb(224, 62, 76)' }
        ];

        const series = categories.map((cat, index) => {
            const grad = gradientColors[index % gradientColors.length];
            return {
                name: cat,
                type: 'line',
                stack: 'Total',
                smooth: true,
                lineStyle: { width: 0 },
                showSymbol: false,
                areaStyle: {
                    opacity: 0.8,
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: grad.start },
                        { offset: 1, color: grad.end }
                    ])
                },
                emphasis: { focus: 'series' },
                data: seriesMap[cat]
            };
        });

        return {
            backgroundColor: 'transparent',
            color: gradientColors.map(g => g.start),
            title: {
                text: 'Category Sales Trend (Gradient Stacked)',
                left: 'center',
                textStyle: { color: isDark ? '#fff' : '#333' }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: { backgroundColor: '#6a7985' }
                },
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#333',
                textStyle: { color: '#fff' }
            },
            legend: {
                data: categories,
                bottom: 40,
                textStyle: { color: isDark ? '#ccc' : '#666' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '20%',
                top: '15%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data: dates,
                    axisLabel: {
                        color: isDark ? '#ccc' : '#666',
                        interval: 'auto',
                        rotate: dates.length > 15 ? 45 : 0,
                        formatter: (value: string) => {
                            try {
                                const d = new Date(value);
                                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                            } catch {
                                return value;
                            }
                        }
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    axisLabel: { color: isDark ? '#ccc' : '#666' },
                    splitLine: { lineStyle: { color: isDark ? '#333' : '#eee' } }
                }
            ],
            dataZoom: [
                { type: 'inside', start: 0, end: 100 },
                { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
            ],
            series: series
        };
    }, [data, isDark]);

    return (
        <Card className="h-full border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-white">Category Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
                <ReactECharts
                    option={options}
                    style={{ height: '400px', width: '100%', minHeight: '350px' }}
                    theme={isDark ? 'dark' : 'light'}
                    notMerge={true}
                    opts={{ renderer: 'svg' }}
                />
            </CardContent>
        </Card>
    );
};
