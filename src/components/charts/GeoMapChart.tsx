"use client";

import React, { useEffect, useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { toast } from 'sonner';

interface GeoMapChartProps {
    data: { name: string; value: number }[];
    title?: string;
    metricLabel?: string;
}

export const GeoMapChart = ({ data, title = "Geographic Distribution", metricLabel = "Revenue" }: GeoMapChartProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        // Fetch World Map GeoJSON
        // Using a reliable CDN for standard ECharts world map
        fetch('https://raw.githubusercontent.com/apache/echarts/master/test/data/map/json/world.json')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(geoJson => {
                echarts.registerMap('world', geoJson);
                setMapLoaded(true);
            })
            .catch(err => {
                console.error('Failed to load map data', err);
                toast.error("Failed to load map data. Check internet connection.");
            });
    }, []);

    const options = useMemo(() => {
        if (!mapLoaded) return {};

        const maxVal = Math.max(...data.map(d => d.value), 100);

        return {
            backgroundColor: 'transparent',
            title: {
                text: title,
                left: 'center',
                textStyle: { color: isDark ? '#fff' : '#333' }
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const val = params.value;
                    return `${params.name}<br/>${metricLabel}: $${Number(val || 0).toLocaleString()}`;
                },
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: '#333',
                textStyle: { color: '#fff' }
            },
            visualMap: {
                min: 0,
                max: maxVal,
                text: ['High', 'Low'],
                realtime: false,
                calculable: true,
                inRange: {
                    color: ['#dc2626', '#fbbf24', '#22c55e'] // Red to Yellow to Green? Or maybe simple sequential
                },
                textStyle: { color: isDark ? '#ccc' : '#333' },
                left: 'left',
                bottom: 'bottom'
            },
            series: [
                {
                    name: metricLabel,
                    type: 'map',
                    map: 'world',
                    roam: true,
                    emphasis: {
                        label: {
                            show: true
                        },
                        itemStyle: {
                            areaColor: '#f472b6' // Pink highlight
                        }
                    },
                    itemStyle: {
                        areaColor: isDark ? '#1f2937' : '#eee',
                        borderColor: isDark ? '#374151' : '#ccc'
                    },
                    data: data
                }
            ]
        };
    }, [mapLoaded, data, isDark, title, metricLabel]);

    return (
        <Card className="h-full border-white/10 bg-white/5 backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-white">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {mapLoaded ? (
                    <ReactECharts
                        option={options}
                        style={{ height: '400px', width: '100%', minHeight: '350px' }}
                        theme={isDark ? 'dark' : 'light'}
                        opts={{ renderer: 'svg' }}
                        notMerge={true}
                    />
                ) : (
                    <div className="flex h-[400px] items-center justify-center text-gray-400">
                        Loading Map...
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
