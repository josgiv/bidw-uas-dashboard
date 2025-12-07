"use client";

import React, { useState, useMemo } from "react";
import { MasterRecord, DimensionField, MetricField, FilterMeta } from "@/lib/types";
import ReactECharts from 'echarts-for-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { aggregateData } from "@/lib/aggregator_v2"; // Point to v2
import { Settings, BarChart2, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "next-themes";
import * as echarts from 'echarts';

interface PlaygroundProps {
    data: MasterRecord[];
    meta: FilterMeta;
}

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

    const getOption = () => {
        return {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: chartType === 'bar' ? 'shadow' : 'line'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: chartData.map(d => d.name),
                axisLabel: {
                    color: isDark ? '#ccc' : '#666',
                    rotate: chartData.length > 8 ? 45 : 0,
                    interval: 'auto',
                    formatter: (value: string) => value.length > 15 ? value.substring(0, 15) + '...' : value
                },
                axisLine: { lineStyle: { color: isDark ? '#555' : '#ccc' } }
            },
            yAxis: {
                type: 'value',
                axisLabel: { color: isDark ? '#ccc' : '#666' },
                splitLine: { lineStyle: { color: isDark ? '#333' : '#eee' } }
            },
            series: [{
                name: yAxis === 'revenue' ? 'Revenue' : 'Quantity',
                data: chartData.map(d => d.value),
                type: chartType === 'area' ? 'line' : chartType,
                smooth: true,
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
                lineStyle: {
                    width: 3
                }
            }]
        };
    };

    return (
        <Card className="w-full border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>Custom Analysis</CardTitle>
                        <CardDescription>Build your own visualization</CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Select value={xAxis} onValueChange={(v) => setXAxis(v as DimensionField)}>
                            <SelectTrigger className="w-[140px]">
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
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Target Metric" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="revenue">Revenue</SelectItem>
                                <SelectItem value="quantity">Quantity</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex bg-secondary rounded-lg border border-border p-1">
                            <button
                                onClick={() => setChartType('bar')}
                                className={`p-2 rounded transition-colors ${chartType === 'bar' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Bar Chart"
                            >
                                <BarChart2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setChartType('line')}
                                className={`p-2 rounded transition-colors ${chartType === 'line' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Line Chart"
                            >
                                <TrendingUp className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setChartType('area')}
                                className={`p-2 rounded transition-colors ${chartType === 'area' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Area Chart"
                            >
                                <Activity className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ReactECharts
                        option={getOption()}
                        style={{ height: '100%', width: '100%' }}
                        theme={isDark ? 'dark' : 'light'}
                        notMerge={true} // Important for dynamic updates
                    />
                </div>
            </CardContent>
        </Card>
    );
}
