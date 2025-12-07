"use client";
import React, { useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import * as echarts from 'echarts';
import { toast } from 'sonner';

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

    const options = React.useMemo(() => {
        let xAxisData: string[] = [];
        let seriesList: unknown[] = [];

        if (dataset) {
            xAxisData = dataset.xAxis;
            seriesList = dataset.series.map(s => ({
                name: s.name,
                type: 'line',
                smooth: true,
                showSymbol: false,
                data: s.data,
                itemStyle: { color: s.color || color },
                lineStyle: { width: 3 },
                emphasis: { focus: 'series' }
            }));
        } else if (data) {
            xAxisData = data.map(d => d.name);
            seriesList = [{
                data: data.map(d => d.value),
                type: 'line',
                smooth: true,
                symbol: 'circle',
                symbolSize: 8,
                showSymbol: false,
                lineStyle: { width: 3 },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: color },
                        { offset: 1, color: isDark ? 'rgba(99, 102, 241, 0)' : 'rgba(99, 102, 241, 0)' }
                    ])
                },
                itemStyle: { color: color }
            }];
        }

        return {
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#333',
                textStyle: { color: '#fff' }
            },
            legend: {
                show: !!dataset,
                bottom: 40,
                textStyle: { color: isDark ? '#ccc' : '#666' }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '20%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: xAxisData,
                axisLabel: {
                    color: isDark ? '#ccc' : '#666',
                    interval: 'auto',
                    rotate: xAxisData.length > 20 ? 30 : 0
                },
                axisLine: { lineStyle: { color: isDark ? '#555' : '#ccc' } }
            },
            yAxis: {
                type: 'value',
                name: yLabel,
                axisLabel: { color: isDark ? '#ccc' : '#666' },
                axisLine: { show: false },
                splitLine: { lineStyle: { color: isDark ? '#333' : '#eee' } }
            },
            series: seriesList,
            dataZoom: [
                { type: 'inside', start: 0, end: 100 },
                { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
            ]
        };
    }, [data, dataset, color, isDark, title, yLabel]);

    const onChartClick = (params: { seriesName?: string; name: string; value: number }) => {
        toast.info(`${params.seriesName || title}: ${params.name}`, {
            description: `Value: ${params.value}`
        });
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
