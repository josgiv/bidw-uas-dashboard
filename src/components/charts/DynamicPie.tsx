"use client";
import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { toast } from 'sonner';

interface DynamicPieChartProps {
    data: { name: string; value: number }[];
    title?: string;
    colors?: string[];
}

export const DynamicPieChart = ({ data, title = "Distribution", colors }: DynamicPieChartProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const onChartClick = (params: { name: string; value: number; percent: number }) => {
        toast.info(`${params.name}`, {
            description: `Value: ${params.value} (${params.percent}%)`
        });
    };

    const options = {
        backgroundColor: 'transparent',
        title: {
            text: title,
            left: 'center',
            textStyle: { color: isDark ? '#fff' : '#333' }
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
            backgroundColor: 'rgba(0,0,0,0.8)',
            borderColor: '#333',
            textStyle: { color: '#fff' }
        },
        legend: {
            bottom: '5%',
            left: 'center',
            textStyle: { color: isDark ? '#ccc' : '#666' }
        },
        series: [
            {
                name: title,
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: isDark ? '#1e293b' : '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: isDark ? '#fff' : '#333'
                    }
                },
                labelLine: {
                    show: false
                },
                data: data
            }
        ]
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
