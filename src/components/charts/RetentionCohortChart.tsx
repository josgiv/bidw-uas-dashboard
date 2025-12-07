import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface RetentionCohortChartProps {
    data: {
        cohort: string; // e.g., "2023-01"
        monthIndex: number; // 0, 1, 2...
        retentionRate: number; // 0-100
        originalSize: number;
    }[];
}

export function RetentionCohortChart({ data }: RetentionCohortChartProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const option = useMemo(() => {
        // ... (Heatmap Logic)
        const cohorts = Array.from(new Set(data.map(d => d.cohort))).sort();
        const months = Array.from(new Set(data.map(d => d.monthIndex))).sort((a, b) => a - b);

        const heatmapData = data.map(d => [
            months.indexOf(d.monthIndex),
            cohorts.indexOf(d.cohort),
            d.retentionRate // Value
        ]);

        return {
            tooltip: {
                position: 'top',
                formatter: (params: any) => {
                    const d = data.find(item =>
                        item.cohort === cohorts[params.data[1]] &&
                        item.monthIndex === months[params.data[0]]
                    );
                    return `${d?.cohort} (+${d?.monthIndex} mo)<br/>Retention: <b>${d?.retentionRate.toFixed(1)}%</b><br/>User Count: ${Math.round((d?.originalSize || 0) * (d?.retentionRate || 0) / 100)}`;
                }
            },
            grid: { height: '80%', top: '10%' },
            xAxis: {
                type: 'category',
                data: months.map(m => `+${m} Month`),
                splitArea: { show: true }
            },
            yAxis: {
                type: 'category',
                data: cohorts,
                splitArea: { show: true }
            },
            visualMap: {
                min: 0,
                max: 100,
                calculable: true,
                orient: 'horizontal',
                left: 'center',
                bottom: '0%',
                inRange: {
                    color: ['#fef2f2', '#f87171', '#dc2626'] // Light red to Dark red for churn? Or Blue for retention?
                    // Better: White/Light -> Blue for high retention
                }
            },
            series: [{
                name: 'Retention',
                type: 'heatmap',
                data: heatmapData,
                label: {
                    show: true,
                    formatter: (p: any) => p.data[2].toFixed(0) + '%'
                },
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 1
                }
            }]
        };
    }, [data, isDark]);

    return (
        <Card className="flex-1 min-h-0">
            <CardHeader>
                <CardTitle>Customer Retention Cohort</CardTitle>
                <CardDescription>Percentage of customers returning in subsequent months</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
                <ReactECharts
                    option={option}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'svg' }}
                    notMerge={true}
                />
            </CardContent>
        </Card>
    );
}
