"use client";
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "next-themes";

interface HeatmapProps {
    data: { name: string;[key: string]: number | string }[];
    columns: string[];
    metricLabel: string;
}

export function CorrelationHeatmap({ data, columns, metricLabel }: HeatmapProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const options = useMemo(() => {
        // Transform data for ECharts heatmap: [[xIndex, yIndex, value], ...]
        const heatmapData: [number, number, number][] = [];
        const yData = data.map(d => d.name);
        const xData = columns;

        data.forEach((row, yIndex) => {
            columns.forEach((col, xIndex) => {
                const val = row[col] as number;
                heatmapData.push([xIndex, yIndex, val || 0]);
            });
        });

        const maxVal = Math.max(...heatmapData.map(d => d[2]), 1);
        const totalValue = heatmapData.reduce((sum, d) => sum + d[2], 0);
        const isRevenue = metricLabel.toLowerCase().includes('revenue');

        return {
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 600,
            tooltip: {
                confine: true,
                appendToBody: true,
                backgroundColor: 'rgba(0,0,0,0.9)',
                borderColor: 'rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: [14, 18],
                textStyle: { color: '#fff', fontSize: 12 },
                formatter: (params: { data: [number, number, number] }) => {
                    const xName = xData[params.data[0]];
                    const yName = yData[params.data[1]];
                    const val = params.data[2];
                    const percentage = totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : 0;
                    const formattedVal = isRevenue ? `$${val.toLocaleString()}` : val.toLocaleString();

                    return `
                        <div style="margin-bottom:10px;">
                            <div style="font-size:14px;font-weight:700;margin-bottom:2px;">${yName}</div>
                            <div style="font-size:11px;color:#94a3b8;">× ${xName}</div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;">
                            <div style="color:#94a3b8;">${metricLabel}</div>
                            <div style="font-weight:600;text-align:right;color:${isRevenue ? '#22c55e' : '#6366f1'};">${formattedVal}</div>
                            <div style="color:#94a3b8;">% of Total</div>
                            <div style="font-weight:600;text-align:right;">${percentage}%</div>
                        </div>
                    `;
                }
            },
            grid: {
                height: '65%',
                top: 20,
                left: 80,
                right: 20,
                bottom: 80
            },
            xAxis: {
                type: 'category',
                data: xData,
                position: 'bottom',
                splitArea: { show: false },
                axisLabel: {
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: 10,
                    rotate: 35,
                    formatter: (value: string) => value.length > 8 ? value.substring(0, 8) + '...' : value
                },
                axisLine: { show: false },
                axisTick: { show: false }
            },
            yAxis: {
                type: 'category',
                data: yData,
                splitArea: { show: false },
                axisLabel: {
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: 10,
                    formatter: (value: string) => value.length > 10 ? value.substring(0, 10) + '...' : value
                },
                axisLine: { show: false },
                axisTick: { show: false }
            },
            visualMap: {
                min: 0,
                max: maxVal,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: 10,
                itemWidth: 12,
                itemHeight: 80,
                text: [isRevenue ? `$${(maxVal / 1000).toFixed(0)}K` : maxVal.toLocaleString(), '0'],
                textStyle: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 },
                inRange: {
                    color: ['#e0e7ff', '#818cf8', '#4f46e5', '#3730a3']
                }
            },
            series: [{
                name: metricLabel,
                type: 'heatmap',
                data: heatmapData,
                label: {
                    show: heatmapData.length <= 20,
                    fontSize: 9,
                    formatter: (params: { data: [number, number, number] }) => {
                        const val = params.data[2];
                        if (isRevenue) {
                            if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
                            if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
                            return `$${val}`;
                        }
                        return val >= 1000 ? `${(val / 1000).toFixed(0)}K` : val.toString();
                    }
                },
                itemStyle: {
                    borderRadius: 3,
                    borderColor: isDark ? '#1e293b' : '#fff',
                    borderWidth: 2
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(99, 102, 241, 0.5)'
                    }
                }
            }]
        };
    }, [data, columns, metricLabel, isDark]);

    return (
        <Card className="h-full border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Correlation Matrix</CardTitle>
                <CardDescription className="text-xs">{metricLabel} by Dimension Pairs</CardDescription>
            </CardHeader>
            <CardContent className="h-[380px] w-full p-4 pt-0">
                <ReactECharts
                    option={options}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                    notMerge={true}
                    lazyUpdate={true}
                />
            </CardContent>
        </Card>
    );
}
