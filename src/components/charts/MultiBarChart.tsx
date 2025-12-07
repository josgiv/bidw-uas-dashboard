"use client";
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { toast } from "sonner";

interface MultiBarChartProps {
    data: Record<string, unknown>[];
    keys: string[];
    colors?: string[];
    title?: string;
    stacked?: boolean;
}

export const MultiBarChart = ({ data, keys, colors = ['#3b82f6'], title = "Bar Analysis", stacked = false }: MultiBarChartProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const series = keys.map((key, index) => ({
        name: key,
        type: 'bar',
        stack: stacked ? 'total' : undefined,
        data: data.map(d => d[key]),
        itemStyle: {
            color: colors[index % colors.length],
            borderRadius: stacked ? 0 : [4, 4, 0, 0]
        },
        barMaxWidth: 50
    }));

    const onChartClick = (params: { seriesName: string; name: string; value: number }) => {
        toast.info(`${params.seriesName}: ${params.name}`, {
            description: `Value: ${params.value}`
        });
    };

    const xAxisLabels = data.map(d => String(d.name || d.category || 'Item'));

    const options = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderColor: '#333',
            textStyle: { color: '#fff' }
        },
        legend: {
            data: keys,
            bottom: 0,
            textStyle: { color: isDark ? '#ccc' : '#666' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '10%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: xAxisLabels,
            axisLabel: {
                color: isDark ? '#ccc' : '#666',
                rotate: xAxisLabels.length > 6 ? 45 : 0,
                interval: 'auto',
                formatter: (value: string) => value.length > 12 ? value.substring(0, 12) + '...' : value
            },
            axisLine: { lineStyle: { color: isDark ? '#555' : '#ccc' } }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: isDark ? '#ccc' : '#666' },
            splitLine: { lineStyle: { color: isDark ? '#333' : '#eee' } }
        },
        series: series
    };

    return (
        <Card className="h-full border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ReactECharts
                    option={options}
                    style={{ height: '400px', width: '100%', minHeight: '300px' }}
                    theme={isDark ? 'dark' : 'light'}
                    opts={{ renderer: 'svg' }}
                    onEvents={{
                        'click': onChartClick
                    }}
                    notMerge={true}
                />
            </CardContent>
        </Card>
    );
}
