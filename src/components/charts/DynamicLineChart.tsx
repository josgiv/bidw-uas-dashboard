"use client";
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import * as echarts from 'echarts';

interface DynamicLineChartProps {
    data?: { name: string; value: number }[];
    dataset?: {
        xAxis: string[];
        series: { name: string; data: number[]; color?: string }[];
    };
    color?: string;
    yLabel?: string;
    title?: string;
}

export const DynamicLineChart = ({ data, dataset, color = "#6366f1", yLabel, title = "Trend Analysis" }: DynamicLineChartProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const options = useMemo(() => {
        let xAxisData: string[] = [];
        let seriesList: echarts.SeriesOption[] = [];

        if (dataset) {
            // Sample for performance
            const maxPoints = 80;
            const step = Math.max(1, Math.floor(dataset.xAxis.length / maxPoints));
            xAxisData = dataset.xAxis.filter((_, i) => i % step === 0);

            seriesList = dataset.series.map(s => ({
                name: s.name,
                type: 'line',
                smooth: 0.3,
                showSymbol: false,
                sampling: 'lttb',
                data: s.data.filter((_, i) => i % step === 0),
                itemStyle: { color: s.color || color },
                lineStyle: { width: 2 },
                emphasis: { focus: 'series' },
                animationDuration: 800,
                animationEasing: 'cubicOut'
            }));
        } else if (data) {
            xAxisData = data.map(d => d.name);
            seriesList = [{
                data: data.map(d => d.value),
                type: 'line',
                smooth: 0.3,
                showSymbol: false,
                sampling: 'lttb',
                lineStyle: { width: 2.5 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: `${color}40` },
                        { offset: 1, color: `${color}05` }
                    ])
                },
                itemStyle: { color },
                animationDuration: 800,
                animationEasing: 'cubicOut'
            }];
        }

        return {
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 800,
            animationEasing: 'cubicOut',
            tooltip: {
                trigger: 'axis',
                confine: true,
                appendToBody: true,
                backgroundColor: 'rgba(0,0,0,0.85)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                padding: [12, 16],
                textStyle: { color: '#fff', fontSize: 12 },
                axisPointer: {
                    type: 'cross',
                    animation: true
                }
            },
            legend: {
                show: !!dataset && dataset.series.length > 1,
                bottom: 35,
                textStyle: { color: isDark ? '#ccc' : '#666', fontSize: 11 },
                itemWidth: 16,
                itemHeight: 10
            },
            grid: {
                left: 50,
                right: 20,
                bottom: dataset ? 75 : 50,
                top: 20,
                containLabel: false
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxisData,
                axisLabel: {
                    color: isDark ? '#999' : '#666',
                    fontSize: 10,
                    interval: 'auto',
                    rotate: xAxisData.length > 30 ? 30 : 0
                },
                axisLine: { show: false },
                axisTick: { show: false }
            },
            yAxis: {
                type: 'value',
                name: yLabel,
                nameTextStyle: { color: isDark ? '#999' : '#666', fontSize: 10 },
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
            },
            series: seriesList,
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
            ]
        };
    }, [data, dataset, color, isDark, yLabel]);

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
