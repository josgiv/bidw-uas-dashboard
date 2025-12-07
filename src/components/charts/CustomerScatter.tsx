"use client";
import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useTheme } from "next-themes";

interface ScatterData {
    x: number;
    y: number;
    z: number;
    name: string;
    country: string;
    gender: string;
}

interface CustomerScatterProps {
    data: ScatterData[];
    xLabel?: string;
    yLabel?: string;
}

export const CustomerScatter = ({ data, xLabel = "Total Transactions", yLabel = "Lifetime Revenue ($)" }: CustomerScatterProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const options = useMemo(() => {
        const maxRevenue = Math.max(...data.map(d => d.y), 100);
        const maxTransactions = Math.max(...data.map(d => d.x), 10);

        return {
            backgroundColor: 'transparent',
            animation: true,
            animationDuration: 600,
            animationEasing: 'cubicOut',
            tooltip: {
                trigger: 'item',
                confine: true,
                appendToBody: true,
                backgroundColor: 'rgba(0,0,0,0.9)',
                borderColor: 'rgba(255,255,255,0.15)',
                borderRadius: 10,
                padding: [14, 18],
                textStyle: { color: '#fff', fontSize: 12 },
                formatter: (params: { data: [number, number, number, string, string, string] }) => {
                    const d = params.data;
                    const avgOrderValue = d[0] > 0 ? d[1] / d[0] : 0;
                    return `
                        <div style="margin-bottom:10px;">
                            <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${d[3]}</div>
                            <div style="font-size:11px;color:#94a3b8;">Customer Profile</div>
                        </div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 16px;">
                            <div style="color:#94a3b8;">Lifetime Revenue</div>
                            <div style="font-weight:600;text-align:right;color:#22c55e;">$${d[1].toLocaleString()}</div>
                            
                            <div style="color:#94a3b8;">Total Transactions</div>
                            <div style="font-weight:600;text-align:right;">${d[0].toLocaleString()}</div>
                            
                            <div style="color:#94a3b8;">Avg Order Value</div>
                            <div style="font-weight:600;text-align:right;">$${avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                            
                            <div style="color:#94a3b8;">Country</div>
                            <div style="font-weight:600;text-align:right;">${d[4]}</div>
                            
                            <div style="color:#94a3b8;">Gender</div>
                            <div style="font-weight:600;text-align:right;">${d[5] === 'MALE' ? '👨 Male' : d[5] === 'FEMALE' ? '👩 Female' : d[5]}</div>
                        </div>
                        <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.1);font-size:10px;color:#64748b;">
                            Bubble size = Transaction count
                        </div>
                    `;
                }
            },
            grid: {
                left: 60,
                right: 100,
                bottom: 50,
                top: 20,
                containLabel: false
            },
            xAxis: {
                type: 'value',
                name: xLabel,
                nameLocation: 'middle',
                nameGap: 35,
                nameTextStyle: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 },
                min: 0,
                max: maxTransactions + 2,
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                    }
                },
                axisLabel: {
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: 10
                },
                axisLine: { show: false },
                axisTick: { show: false }
            },
            yAxis: {
                type: 'value',
                name: yLabel,
                nameTextStyle: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 },
                splitLine: {
                    lineStyle: {
                        type: 'dashed',
                        color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                    }
                },
                axisLabel: {
                    color: isDark ? '#94a3b8' : '#64748b',
                    fontSize: 10,
                    formatter: (value: number) => {
                        if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                        return `$${value}`;
                    }
                },
                axisLine: { show: false },
                axisTick: { show: false }
            },
            visualMap: {
                show: true,
                right: 10,
                top: 'center',
                dimension: 1,
                min: 0,
                max: maxRevenue,
                itemWidth: 14,
                itemHeight: 100,
                calculable: false,
                precision: 0,
                text: ['High $', 'Low $'],
                textGap: 10,
                textStyle: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 10 },
                inRange: {
                    color: ['#94a3b8', '#6366f1', '#4f46e5', '#3730a3']
                }
            },
            series: [{
                name: 'Customers',
                type: 'scatter',
                symbolSize: (data: number[]) => Math.max(8, Math.min(40, Math.sqrt(data[0]) * 6)),
                data: data.map(d => [d.x, d.y, d.z, d.name, d.country, d.gender]),
                itemStyle: {
                    shadowBlur: 8,
                    shadowColor: 'rgba(99, 102, 241, 0.4)',
                    shadowOffsetY: 3,
                    opacity: 0.85
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 15,
                        shadowColor: 'rgba(99, 102, 241, 0.6)',
                        opacity: 1
                    }
                },
                animationDelay: (idx: number) => idx * 10
            }]
        };
    }, [data, xLabel, yLabel, isDark]);

    return (
        <Card className="h-full border-border/40 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Customer Value Matrix</CardTitle>
                <CardDescription className="text-xs">Revenue vs Transaction Analysis</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px] w-full p-4 pt-0">
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
};
