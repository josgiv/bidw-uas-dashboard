"use client";
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";

interface HeatmapProps {
    data: { name: string;[key: string]: number | string }[]; // rowName, col1, col2...
    columns: string[];
    metricLabel: string;
}

export function CorrelationHeatmap({ data, columns, metricLabel }: HeatmapProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Transform data for ECharts heatmap: [[yIndex, xIndex, value], ...]
    const heatmapData: [number, number, number][] = [];
    const yData = data.map(d => d.name);
    const xData = columns;

    data.forEach((row, yIndex) => {
        columns.forEach((col, xIndex) => {
            const val = row[col] as number;
            heatmapData.push([xIndex, yIndex, val || 0]); // x, y, value
        });
    });

    const options = {
        backgroundColor: 'transparent',
        title: {
            text: `Correlation Matrix: ${metricLabel}`,
            left: 'center',
            textStyle: { color: isDark ? '#fff' : '#333' }
        },
        tooltip: {
            position: 'top',
            formatter: (params: { data: [number, number, number] }) => {
                const xName = xData[params.data[0]];
                const yName = yData[params.data[1]];
                const val = params.data[2];
                return `${yName} - ${xName}<br/>${metricLabel}: ${val}`;
            }
        },
        grid: {
            height: '70%',
            top: '15%',
            left: '15%'
        },
        xAxis: {
            type: 'category',
            data: xData,
            splitArea: { show: true },
            axisLabel: {
                color: isDark ? '#ccc' : '#666',
                rotate: 45,
                formatter: (value: string) => value.length > 10 ? value.substring(0, 10) + '...' : value
            }
        },
        yAxis: {
            type: 'category',
            data: yData,
            splitArea: { show: true },
            axisLabel: { color: isDark ? '#ccc' : '#666' }
        },
        visualMap: {
            min: 0,
            max: Math.max(...heatmapData.map(d => d[2]), 1),
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            bottom: '0%',
            inRange: {
                color: ['#f8fafc', '#6366f1'] // light to primary
            },
            textStyle: { color: isDark ? '#ccc' : '#666' }
        },
        series: [{
            name: metricLabel,
            type: 'heatmap',
            data: heatmapData,
            label: {
                show: true
            },
            itemStyle: {
                borderColor: isDark ? '#1e293b' : '#fff',
                borderWidth: 1
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };

    return (
        <Card className="h-[450px] w-full border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-4">
                <CardTitle className="text-lg font-medium">Correlation Matrix</CardTitle>
            </CardHeader>
            <CardContent className="h-[380px] w-full p-4 pt-0">
                <ReactECharts
                    option={options}
                    style={{ height: '100%', width: '100%' }}
                    theme={isDark ? 'dark' : 'light'}
                    notMerge={true}
                    opts={{ renderer: 'svg' }}
                />
            </CardContent>
        </Card>
    );
}
