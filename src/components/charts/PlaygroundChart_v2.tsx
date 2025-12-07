"use client";

import React, { useState, useMemo } from "react";
import { MasterRecord, DimensionField, MetricField, FilterMeta } from "@/lib/types";
import ReactECharts from 'echarts-for-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { aggregateData } from "@/lib/aggregator_v2";
import { BarChart2, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "next-themes";
import * as echarts from 'echarts';

interface PlaygroundProps {
    data: MasterRecord[];
    meta: FilterMeta;
}

const METRIC_LABELS: Record<MetricField, { label: string; prefix: string; suffix: string }> = {
    revenue: { label: 'Revenue', prefix: '$', suffix: '' },
    quantity: { label: 'Units Sold', prefix: '', suffix: ' units' }
};

const DIMENSION_LABELS: Record<string, string> = {
    category: 'Category',
    subcategory: 'Subcategory',
    country: 'Country',
    gender: 'Gender',
    maritalStatus: 'Marital Status',
    color: 'Color',
    dateStr: 'Date',
    year: 'Year',
    month: 'Month'
};

export function PlaygroundChart({ data }: PlaygroundProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [xAxis, setXAxis] = useState<DimensionField>('category');
    const [yAxis, setYAxis] = useState<MetricField>('revenue');
    const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');

    const chartData = useMemo(() => {
        return aggregateData(data, {
            groupBy: xAxis,
            metric: yAxis,
            orderBy: 'value',
            orderDirection: 'desc',
            limit: 15
        });
    }, [data, xAxis, yAxis]);

    const metricConfig = METRIC_LABELS[yAxis];
    const dimLabel = DIMENSION_LABELS[xAxis] || xAxis;
    const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);

    const getOption = () => {
        return {
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 600,
            animationEasing: 'cubicOut',
            tooltip: {
                trigger: 'axis',
                confine: true,
                appendToBody: true,
                axisPointer: {
                    type: chartType === 'bar' ? 'shadow' : 'line'
                },
                backgroundColor: 'rgba(0,0,0,0.9)',
                borderColor: 'rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: [14, 18],
                textStyle: { color: '#fff', fontSize: 12 },
                formatter: (params: { name: string; value: number; seriesName: string }[]) => {
                    if (!Array.isArray(params) || params.length === 0) return '';
                    const item = params[0];
                    const percentage = totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : 0;
                    const formattedValue = yAxis === 'revenue'
                        ? `$${item.value.toLocaleString()}`
                        : `${item.value.toLocaleString()} units`;

                    return `
                        <div style="margin-bottom:10px;">
                            <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${item.name}</div>
                            <div style="font-size:11px;color:#94a3b8;">${dimLabel} Analysis</div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;">
                            <div style="color:#94a3b8;">${metricConfig.label}</div>
                            <div style="font-weight:600;text-align:right;color:${yAxis === 'revenue' ? '#22c55e' : '#6366f1'};">${formattedValue}</div>
                            
                            <div style="color:#94a3b8;">Share of Total</div>
                            <div style="font-weight:600;text-align:right;">${percentage}%</div>
                            
                            <div style="color:#94a3b8;">Rank</div>
                            <div style="font-weight:600;text-align:right;">#${chartData.findIndex(d => d.name === item.name) + 1} of ${chartData.length}</div>
                        </div>
                    `;
                }
            },
            grid: {
                left: 60,
                right: 20,
                bottom: chartData.length > 5 ? 90 : 60,
                top: 30,
                containLabel: false
            },
            xAxis: {
                type: 'category',
                data: chartData.map(d => d.name),
                axisLabel: {
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: 10,
                    rotate: chartData.length > 5 ? 35 : 0,
                    interval: 0,
                    formatter: (value: string) => value.length > 12 ? value.substring(0, 12) + '...' : value
                },
                axisLine: { show: false },
                axisTick: { show: false }
            },
            yAxis: {
                type: 'value',
                axisLabel: {
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: 10,
                    formatter: (value: number) => {
                        if (yAxis === 'revenue') {
                            if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                            if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                            return `$${value}`;
                        }
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
            series: [{
                name: metricConfig.label,
                data: chartData.map(d => d.value),
                type: chartType === 'area' ? 'line' : chartType,
                smooth: 0.4,
                symbol: 'circle',
                symbolSize: 6,
                areaStyle: chartType === 'area' ? {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: 'rgba(99, 102, 241, 0.5)' },
                        { offset: 1, color: 'rgba(99, 102, 241, 0.0)' }
                    ])
                } : undefined,
                itemStyle: {
                    color: '#6366f1',
                    borderRadius: chartType === 'bar' ? [4, 4, 0, 0] : 0
                },
                lineStyle: { width: 2.5 },
                barMaxWidth: 50,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(99, 102, 241, 0.4)'
                    }
                },
                animationDelay: (idx: number) => idx * 30
            }]
        };
    };

    return (
        <Card className="w-full border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle className="text-base font-semibold">Custom Analysis</CardTitle>
                        <CardDescription className="text-xs">Build your own visualization • {chartData.length} items</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Select value={xAxis} onValueChange={(v) => setXAxis(v as DimensionField)}>
                            <SelectTrigger className="w-[130px] h-8 text-xs">
                                <SelectValue placeholder="X-Axis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="category">Category</SelectItem>
                                <SelectItem value="subcategory">Subcategory</SelectItem>
                                <SelectItem value="country">Country</SelectItem>
                                <SelectItem value="gender">Gender</SelectItem>
                                <SelectItem value="maritalStatus">Marital Status</SelectItem>
                            </SelectContent>
                        </Select>

                        <Select value={yAxis} onValueChange={(v) => setYAxis(v as MetricField)}>
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                                <SelectValue placeholder="Metric" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="revenue">💰 Revenue</SelectItem>
                                <SelectItem value="quantity">📦 Quantity</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex bg-muted rounded-md border border-border p-0.5">
                            <button
                                onClick={() => setChartType('bar')}
                                className={`p-1.5 rounded-sm transition-colors ${chartType === 'bar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Bar Chart"
                            >
                                <BarChart2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setChartType('line')}
                                className={`p-1.5 rounded-sm transition-colors ${chartType === 'line' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Line Chart"
                            >
                                <TrendingUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                                onClick={() => setChartType('area')}
                                className={`p-1.5 rounded-sm transition-colors ${chartType === 'area' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Area Chart"
                            >
                                <Activity className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="h-[350px] w-full">
                    <ReactECharts
                        option={getOption()}
                        style={{ height: '100%', width: '100%' }}
                        opts={{ renderer: 'canvas' }}
                        notMerge={true}
                        lazyUpdate={true}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
