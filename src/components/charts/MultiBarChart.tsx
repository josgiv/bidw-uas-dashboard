"use client";
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";

interface MultiBarChartProps {
    data: Record<string, unknown>[];
    keys: string[];
    colors?: string[];
    title?: string;
    stacked?: boolean;
}

export const MultiBarChart = ({ data, keys, colors = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6'], title = "Bar Analysis", stacked = false }: MultiBarChartProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const options = useMemo(() => {
        const xAxisLabels = data.map(d => String(d.name || d.category || 'Item'));

        const series = keys.map((key, index) => ({
            name: key,
            type: 'bar',
            stack: stacked ? 'total' : undefined,
            data: data.map(d => d[key]),
            itemStyle: {
                color: colors[index % colors.length],
                borderRadius: stacked ? (index === keys.length - 1 ? [4, 4, 0, 0] : 0) : [4, 4, 0, 0]
            },
            barMaxWidth: 40,
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0,0,0,0.2)'
                }
            },
            animationDuration: 600,
            animationEasing: 'cubicOut',
            animationDelay: (idx: number) => idx * 30
        }));

        return {
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 600,
            animationEasing: 'cubicOut',
            tooltip: {
                trigger: 'axis',
                confine: true,
                appendToBody: true,
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(0,0,0,0.85)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: [12, 16],
                textStyle: { color: '#fff', fontSize: 12 },
                formatter: (params: { seriesName: string; value: number; axisValue: string; color: string }[]) => {
                    if (!Array.isArray(params) || params.length === 0) return '';
                    let html = `<div style="font-weight:600;margin-bottom:8px;">${params[0].axisValue}</div>`;
                    let total = 0;
                    params.forEach(p => {
                        const val = Number(p.value) || 0;
                        total += val;
                        html += `<div style="display:flex;align-items:center;justify-content:space-between;gap:16px;">
                            <span style="display:flex;align-items:center;gap:6px;">
                                <span style="width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
                                ${p.seriesName}
                            </span>
                            <span style="font-weight:600;">${val.toLocaleString()}</span>
                        </div>`;
                    });
                    if (params.length > 1) {
                        html += `<div style="border-top:1px solid rgba(255,255,255,0.2);margin-top:8px;padding-top:8px;display:flex;justify-content:space-between;"><span>Total</span><span style="font-weight:700;">${total.toLocaleString()}</span></div>`;
                    }
                    return html;
                }
            },
            legend: {
                data: keys,
                bottom: 0,
                textStyle: { color: isDark ? '#ccc' : '#666', fontSize: 11 },
                itemWidth: 12,
                itemHeight: 12
            },
            grid: {
                left: 50,
                right: 20,
                bottom: 50,
                top: 20,
                containLabel: false
            },
            xAxis: {
                type: 'category',
                data: xAxisLabels,
                axisLabel: {
                    color: isDark ? '#999' : '#666',
                    fontSize: 10,
                    rotate: xAxisLabels.length > 5 ? 30 : 0,
                    interval: 0,
                    formatter: (value: string) => value.length > 10 ? value.substring(0, 10) + '...' : value
                },
                axisLine: { show: false },
                axisTick: { show: false }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: isDark ? '#999' : '#666',
                    fontSize: 10,
                    formatter: (value: number) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                        return value.toString();
                    }
                },
                splitLine: {
                    lineStyle: {
                        color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        type: 'dashed'
                    }
                }
            },
            series
        };
    }, [data, keys, colors, stacked, isDark]);

    return (
        <Card className="h-full border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">{title}</CardTitle>
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
