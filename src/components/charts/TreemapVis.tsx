"use client";
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";

interface TreemapProps {
    data: { name: string; value: number }[];
}

export function TreemapVis({ data }: TreemapProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const formattedData = [
        {
            name: 'All',
            children: data.map(d => ({
                name: d.name,
                value: d.value
            }))
        }
    ];

    const options = {
        backgroundColor: 'transparent',
        title: {
            text: 'Product Contribution',
            left: 'center',
            textStyle: { color: isDark ? '#fff' : '#333' }
        },
        tooltip: {
            formatter: (info: { value: number; name: string }) => {
                const value = info.value;
                const name = info.name;
                return `
                    <div class="tooltip-title">${name}</div>
                    Value: ${new Intl.NumberFormat('en-US', { notation: 'compact' }).format(value)}
                `;
            }
        },
        series: [
            {
                type: 'treemap',
                data: formattedData,
                breadcrumb: { show: false },
                label: {
                    show: true,
                    formatter: '{b}'
                },
                itemStyle: {
                    borderColor: isDark ? '#1e293b' : '#fff',
                    gapWidth: 1
                },
                upperLabel: {
                    show: true,
                    height: 30
                },
                levels: [
                    {
                        itemStyle: {
                            borderColor: '#777',
                            borderWidth: 0,
                            gapWidth: 1
                        },
                        upperLabel: { show: false }
                    },
                    {
                        itemStyle: {
                            borderColor: '#555',
                            borderWidth: 5,
                            gapWidth: 1
                        },
                        emphasis: {
                            itemStyle: {
                                borderColor: '#ddd'
                            }
                        }
                    },
                    {
                        colorSaturation: [0.35, 0.5],
                        itemStyle: {
                            borderWidth: 5,
                            gapWidth: 1,
                            borderColorSaturation: 0.6
                        }
                    }
                ]
            }
        ]
    };

    if (data.length === 0) {
        return (
            <Card className="h-[400px] flex items-center justify-center">
                <CardContent className="text-muted-foreground">No data available</CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-[400px] w-full border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
                <CardTitle className="text-lg font-medium">Product Contribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[320px] w-full">
                <ReactECharts option={options} style={{ height: '100%', width: '100%' }} theme={isDark ? 'dark' : 'light'} notMerge={true} opts={{ renderer: 'svg' }} />
            </CardContent>
        </Card>
    );
}
