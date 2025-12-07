"use client";
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";

interface TreemapProps {
    data: { name: string; value: number; children?: { name: string; value: number }[] }[];
}

export const TreemapVis = ({ data }: TreemapProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const processedData = useMemo(() => {
        // Sort by value descending and limit to top items
        return [...data]
            .sort((a, b) => b.value - a.value)
            .slice(0, 20)
            .map(item => ({
                ...item,
                itemStyle: {
                    borderRadius: 4,
                    borderWidth: 2,
                    borderColor: isDark ? '#1e293b' : '#fff'
                }
            }));
    }, [data, isDark]);

    const options = useMemo(() => ({
        backgroundColor: 'transparent',
        animation: true,
        animationDuration: 800,
        animationEasing: 'cubicOut',
        tooltip: {
            confine: true,
            appendToBody: true,
            backgroundColor: 'rgba(0,0,0,0.85)',
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: [12, 16],
            textStyle: { color: '#fff', fontSize: 12 },
            formatter: (params: { name: string; value: number; treePathInfo: { name: string }[] }) => {
                const path = params.treePathInfo.map(p => p.name).filter(Boolean).join(' → ');
                return `
                    <div style="font-weight:600;margin-bottom:6px;">${params.name}</div>
                    <div style="display:flex;justify-content:space-between;gap:16px;">
                        <span>Revenue</span>
                        <span style="font-weight:600;">$${params.value.toLocaleString()}</span>
                    </div>
                    ${path ? `<div style="margin-top:6px;font-size:10px;color:#999;">${path}</div>` : ''}
                `;
            }
        },
        series: [{
            type: 'treemap',
            width: '100%',
            height: '100%',
            roam: false,
            nodeClick: false,
            breadcrumb: {
                show: false
            },
            label: {
                show: true,
                formatter: '{b}',
                fontSize: 12,
                fontWeight: 500,
                color: '#fff',
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowBlur: 2
            },
            upperLabel: {
                show: false
            },
            itemStyle: {
                borderRadius: 4,
                borderWidth: 2,
                borderColor: isDark ? '#1e293b' : '#fff',
                gapWidth: 2
            },
            emphasis: {
                label: { fontSize: 14 },
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0,0,0,0.3)'
                }
            },
            levels: [
                {
                    itemStyle: {
                        borderWidth: 0,
                        gapWidth: 3
                    }
                },
                {
                    colorSaturation: [0.35, 0.6],
                    itemStyle: {
                        borderWidth: 2,
                        gapWidth: 2,
                        borderRadius: 4
                    }
                }
            ],
            data: processedData,
            color: ['#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#14b8a6', '#22c55e']
        }]
    }), [processedData, isDark]);

    if (!data || data.length === 0) {
        return (
            <Card className="h-[350px] w-full border-border/40 bg-card/50 backdrop-blur-sm flex items-center justify-center">
                <p className="text-muted-foreground">No data available</p>
            </Card>
        );
    }

    return (
        <Card className="h-full border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Product Contribution</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <ReactECharts
                    option={options}
                    style={{ height: '280px', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                    notMerge={true}
                    lazyUpdate={true}
                />
            </CardContent>
        </Card>
    );
};
