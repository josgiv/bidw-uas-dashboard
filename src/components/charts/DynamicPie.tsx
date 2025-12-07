"use client";
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";

interface DynamicPieChartProps {
    data: { name: string; value: number }[];
    title?: string;
    colors?: string[];
}

export const DynamicPieChart = ({ data, title = "Distribution" }: DynamicPieChartProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Sort data by value descending and limit to top 10
    const processedData = useMemo(() => {
        return [...data]
            .sort((a, b) => b.value - a.value)
            .slice(0, 10)
            .map(item => ({
                ...item,
                value: Math.round(item.value)
            }));
    }, [data]);

    const options = useMemo(() => ({
        backgroundColor: 'transparent',
        animation: true,
        animationDuration: 800,
        animationEasing: 'cubicOut',
        tooltip: {
            trigger: 'item',
            confine: true,
            appendToBody: true,
            backgroundColor: 'rgba(0,0,0,0.85)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: [12, 16],
            textStyle: { color: '#fff', fontSize: 12 },
            formatter: (params: { name: string; value: number; percent: number }) => {
                return `
                    <div style="font-weight:600;margin-bottom:6px;">${params.name}</div>
                    <div style="display:flex;justify-content:space-between;gap:16px;">
                        <span>Value</span>
                        <span style="font-weight:600;">$${params.value.toLocaleString()}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;gap:16px;">
                        <span>Share</span>
                        <span style="font-weight:600;">${params.percent.toFixed(1)}%</span>
                    </div>
                `;
            }
        },
        legend: {
            type: 'scroll',
            orient: 'horizontal',
            bottom: 0,
            left: 'center',
            textStyle: { color: isDark ? '#ccc' : '#666', fontSize: 11 },
            itemWidth: 12,
            itemHeight: 12,
            itemGap: 8
        },
        color: ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'],
        series: [{
            name: title,
            type: 'pie',
            radius: ['45%', '75%'],
            center: ['50%', '45%'],
            avoidLabelOverlap: true,
            itemStyle: {
                borderRadius: 6,
                borderColor: isDark ? '#1e293b' : '#fff',
                borderWidth: 2
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                scale: true,
                scaleSize: 8,
                label: {
                    show: true,
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: isDark ? '#fff' : '#333',
                    formatter: '{b}\n{d}%'
                },
                itemStyle: {
                    shadowBlur: 20,
                    shadowColor: 'rgba(0,0,0,0.3)'
                }
            },
            labelLine: { show: false },
            data: processedData,
            animationType: 'scale',
            animationEasing: 'elasticOut',
            animationDelay: (idx: number) => idx * 50
        }]
    }), [processedData, isDark, title]);

    return (
        <Card className="h-full border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <ReactECharts
                    option={options}
                    style={{ height: '300px', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                    notMerge={true}
                    lazyUpdate={true}
                />
            </CardContent>
        </Card>
    );
};
