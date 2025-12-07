"use client";
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";

interface ScatterData {
    x: number;
    y: number;
    z: number;
    name: string;
    country: string;
}

interface CustomerScatterProps {
    data: ScatterData[];
    xLabel?: string;
    yLabel?: string;
}

export const CustomerScatter = ({ data, xLabel = "Items", yLabel = "Revenue" }: CustomerScatterProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const options = {
        backgroundColor: 'transparent',
        title: {
            text: 'Customer Analysis',
            left: 'center',
            textStyle: { color: isDark ? '#fff' : '#333' }
        },
        tooltip: {
            trigger: 'item',
            formatter: (params: { data: [number, number, number, string, string] }) => {
                const d = params.data;
                // ECharts data is array [x, y, z, ...], so we check original data if mapped or check values
                // Mapped data format below is [x, y, z, name, country]
                return `
                    <div style="font-weight:bold">${d[3]}</div>
                    <div>${yLabel}: $${d[1].toLocaleString()}</div>
                    <div>${xLabel}: ${d[0]}</div>
                    <div>Orders: ${d[2]}</div>
                    <div>Country: ${d[4]}</div>
                `;
            }
        },
        grid: {
            left: '3%',
            right: 120, // Space for visualMap
            bottom: '3%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: xLabel,
            nameLocation: 'middle',
            nameGap: 30,
            splitLine: { lineStyle: { type: 'dashed', color: isDark ? '#333' : '#eee' } },
            axisLabel: { color: isDark ? '#ccc' : '#666' }
        },
        yAxis: {
            type: 'value',
            name: yLabel,
            splitLine: { lineStyle: { type: 'dashed', color: isDark ? '#333' : '#eee' } },
            axisLabel: { color: isDark ? '#ccc' : '#666' }
        },
        visualMap: {
            left: 'right',
            top: '10%',
            dimension: 1, // Color by Y (Revenue)
            min: 0,
            max: Math.max(...data.map(d => d.y), 100), // Ensure max is at least 100 to avoid invalid range
            itemWidth: 20,
            itemHeight: 120,
            calculable: true,
            precision: 0.1,
            text: ['High Revenue', 'Low Revenue'],
            textGap: 30,
            textStyle: { color: isDark ? '#ccc' : '#666' },
            inRange: {
                color: ['#818cf8', '#6366f1', '#4f46e5', '#3730a3'] // Indigo scale
            }
        },
        series: [
            {
                name: 'Customers',
                type: 'scatter',
                symbolSize: (data: number[]) => {
                    // Normalize size based on Orders (index 2)
                    // Min size 5, Max size 30?
                    // Simple scaling: Math.sqrt(orderCount) * 5
                    return Math.max(5, Math.min(50, Math.sqrt(data[2]) * 8));
                },
                data: data.map(d => [d.x, d.y, d.z, d.name, d.country]),
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(99, 102, 241, 0.5)',
                    shadowOffsetY: 5
                }
            }
        ]
    };

    return (
        <Card className="h-[350px] w-full border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="p-4">
                <CardTitle className="text-lg font-medium">Customer Value Matrix</CardTitle>
            </CardHeader>
            <CardContent className="h-[280px] w-full p-4 pt-0">
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
};
