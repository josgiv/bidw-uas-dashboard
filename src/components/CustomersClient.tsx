
"use client";
import React, { useMemo } from "react";
import { MasterRecord } from "@/lib/types";
import { useDashboard } from "./DashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/MetricCard";
import { CustomerScatter } from "@/components/charts/CustomerScatter";
import { DynamicPieChart } from "@/components/charts/DynamicPie";
import { Users, TrendingUp, ShoppingBag, DollarSign } from "lucide-react";
import { ComparisonInsight } from "@/components/ui/ComparisonInsight";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface CustomersClientProps {
    data: MasterRecord[];
}

export function CustomersClient({ data: allData }: CustomersClientProps) {
    const { filters, compareMode, comparisonFilters } = useDashboard();

    // Reusable filter function
    const getFilteredSubSet = (sourceData: MasterRecord[], currentFilters: typeof filters) => {
        return sourceData.filter(r => {
            const matches = (key: keyof typeof filters, val: string) => {
                if (key === 'dateRange' || key === 'compareMode') return true;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const filterVal = (currentFilters as any)[key];
                if (filterVal === 'ALL') return true;
                if (Array.isArray(filterVal)) return (filterVal as string[]).includes(val);
                return filterVal === val;
            };

            if (!matches('category', r.category)) return false;
            if (!matches('subcategory', r.subcategory)) return false;
            if (!matches('country', r.country)) return false;
            if (!matches('gender', r.gender)) return false;
            if (!matches('maritalStatus', r.maritalStatus)) return false;
            if (!matches('product', r.productName)) return false;
            return true;
        });
    };

    const filteredData = useMemo(() => getFilteredSubSet(allData, filters), [allData, filters]);
    const compFilteredData = useMemo(() =>
        compareMode ? getFilteredSubSet(allData, comparisonFilters) : [],
        [allData, comparisonFilters, compareMode]
    );

    // Customer Aggregation Helper
    const aggregateCustomers = (d: MasterRecord[]) => {
        const map = new Map<string, {
            x: number;
            y: number;
            z: number;
            name: string;
            orders: number;
            country: string;
            gender: string;
        }>();

        const custOrdersMap = new Map<string, Set<string>>();
        d.forEach(r => {
            if (!custOrdersMap.has(r.customerId)) custOrdersMap.set(r.customerId, new Set());
            custOrdersMap.get(r.customerId)!.add(r.orderId);
        });

        d.forEach(r => {
            if (!map.has(r.customerId)) {
                map.set(r.customerId, {
                    x: 0,
                    y: 0,
                    z: 0,
                    name: r.customerName,
                    orders: custOrdersMap.get(r.customerId)!.size,
                    country: r.country,
                    gender: r.gender
                });
            }
            const rec = map.get(r.customerId)!;
            rec.x += r.quantity;
            rec.y += r.revenue;
            rec.z += 1;
        });
        return Array.from(map.values());
    };

    const mainCustMap = useMemo(() => aggregateCustomers(filteredData), [filteredData]);
    const compCustMap = useMemo(() => aggregateCustomers(compFilteredData), [compFilteredData]);

    const calculateKPIs = (custMap: ReturnType<typeof aggregateCustomers>) => {
        const totalCustomers = custMap.length;
        const totalRevenue = custMap.reduce((sum, c) => sum + c.y, 0);
        const avgCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
        const avgOrdersPerCustomer = totalCustomers > 0 ? custMap.reduce((sum, c) => sum + c.orders, 0) / totalCustomers : 0;
        return { totalCustomers, totalRevenue, avgCustomerValue, avgOrdersPerCustomer };
    };

    const mainKPI = calculateKPIs(mainCustMap);
    const compKPI = calculateKPIs(compCustMap);

    const getChange = (current: number, previous: number) => {
        if (!previous) return undefined;
        return ((current - previous) / previous) * 100;
    };

    const scatterData = mainCustMap.sort((a, b) => b.y - a.y).slice(0, 200);

    // Deep Dive Charts Data (Main Only for now to avoid clutter, Insights handle comp)
    const countryRevenue = mainCustMap.reduce((acc, c) => {
        acc[c.country] = (acc[c.country] || 0) + c.y;
        return acc;
    }, {} as Record<string, number>);

    const countryData = Object.entries(countryRevenue)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const genderRevenue = mainCustMap.reduce((acc, c) => {
        // Handle different gender formats: 'MALE', 'FEMALE', 'M', 'F'
        const g = c.gender?.toUpperCase() || '';
        const gender = (g === 'MALE' || g === 'M') ? 'Male'
            : (g === 'FEMALE' || g === 'F') ? 'Female'
                : 'Unknown';
        acc[gender] = (acc[gender] || 0) + c.y;
        return acc;
    }, {} as Record<string, number>);

    const genderData = Object.entries(genderRevenue)
        .map(([name, value]) => ({ name, value }))
        .filter(d => d.name !== 'Unknown' || d.value > 0)
        .sort((a, b) => b.value - a.value);

    // Marital Status breakdown
    const maritalRevenue = mainCustMap.reduce((acc, c) => {
        const status = c.gender; // Using placeholder, we need actual marital status
        acc[status] = (acc[status] || 0) + c.y;
        return acc;
    }, {} as Record<string, number>);

    // Customer Segments by spending tier
    const avgValue = mainKPI.avgCustomerValue;
    const segments = {
        'VIP (2x+avg)': mainCustMap.filter(c => c.y >= avgValue * 2),
        'High Value': mainCustMap.filter(c => c.y >= avgValue && c.y < avgValue * 2),
        'Regular': mainCustMap.filter(c => c.y >= avgValue * 0.5 && c.y < avgValue),
        'Low Value': mainCustMap.filter(c => c.y < avgValue * 0.5)
    };

    const segmentData = Object.entries(segments).map(([name, customers]) => ({
        name,
        value: customers.reduce((sum, c) => sum + c.y, 0),
        count: customers.length
    }));

    // Order frequency distribution
    const orderFrequency = mainCustMap.reduce((acc, c) => {
        const freq = c.orders === 1 ? '1 Order'
            : c.orders <= 3 ? '2-3 Orders'
                : c.orders <= 5 ? '4-5 Orders'
                    : '6+ Orders';
        acc[freq] = (acc[freq] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const orderFreqData = Object.entries(orderFrequency)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
            const order = ['1 Order', '2-3 Orders', '4-5 Orders', '6+ Orders'];
            return order.indexOf(a.name) - order.indexOf(b.name);
        });

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="h-8 w-8 text-primary" />
                        Customer Analytics
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Detailed customer segmentation and behavior analysis
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <MetricCard
                    title="Total Customers"
                    value={mainKPI.totalCustomers.toLocaleString()}
                    icon={<Users className="h-4 w-4" />}
                    trend={compareMode ? getChange(mainKPI.totalCustomers, compKPI.totalCustomers) : undefined}
                />
                <MetricCard
                    title="Total Revenue"
                    value={`$${mainKPI.totalRevenue.toLocaleString()}`}
                    icon={<DollarSign className="h-4 w-4" />}
                    trend={compareMode ? getChange(mainKPI.totalRevenue, compKPI.totalRevenue) : undefined}
                />
                <MetricCard
                    title="Avg Customer Value"
                    value={`$${mainKPI.avgCustomerValue.toFixed(0)}`}
                    icon={<TrendingUp className="h-4 w-4" />}
                    trend={compareMode ? getChange(mainKPI.avgCustomerValue, compKPI.avgCustomerValue) : undefined}
                />
                <MetricCard
                    title="Avg Orders/Customer"
                    value={mainKPI.avgOrdersPerCustomer.toFixed(1)}
                    icon={<ShoppingBag className="h-4 w-4" />}
                    trend={compareMode ? getChange(mainKPI.avgOrdersPerCustomer, compKPI.avgOrdersPerCustomer) : undefined}
                />
            </div>

            {/* Comparison Insights (Only in Compare Mode) */}
            {compareMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ComparisonInsight
                        current={mainKPI.totalCustomers}
                        baseline={compKPI.totalCustomers}
                        metric="Total Customers"
                    />
                    <ComparisonInsight
                        current={mainKPI.avgCustomerValue}
                        baseline={compKPI.avgCustomerValue}
                        metric="Avg Customer Value"
                        formatValue={(v) => `$${v.toFixed(0)}`}
                    />
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <CustomerScatter data={scatterData} xLabel="Total Items Purchased" yLabel="Lifetime Revenue ($)" />
                <div className="grid grid-cols-1 gap-6">
                    <DynamicPieChart data={countryData} title="Revenue by Country" />
                    <DynamicPieChart data={genderData} title="Revenue by Gender" />
                </div>
            </div>

            {/* Additional Customer Analysis Charts */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <DynamicPieChart
                    data={segmentData.map(s => ({ name: s.name, value: s.value }))}
                    title="Revenue by Customer Segment"
                />
                <DynamicPieChart
                    data={orderFreqData}
                    title="Customer Order Frequency"
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top 20 Customers by Revenue</CardTitle>
                    <CardDescription>Highest value customers ranked by lifetime revenue</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">Rank</TableHead>
                                <TableHead>Customer Name</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead className="text-right">Revenue</TableHead>
                                <TableHead className="text-right">Orders</TableHead>
                                <TableHead className="text-right">Items</TableHead>
                                <TableHead className="text-right">AOV</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {scatterData.slice(0, 20).map((c, i) => (
                                <TableRow key={i}>
                                    <TableCell className="font-medium">#{i + 1}</TableCell>
                                    <TableCell className="font-medium">{c.name}</TableCell>
                                    <TableCell>{c.country}</TableCell>
                                    <TableCell className="text-right text-primary font-semibold">${c.y.toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{c.orders}</TableCell>
                                    <TableCell className="text-right">{c.x}</TableCell>
                                    <TableCell className="text-right">${(c.y / (c.orders || 1)).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader><CardTitle className="text-base">VIP Customers</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{mainCustMap.filter(c => c.y > mainKPI.avgCustomerValue * 2).length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Customers spending 2x above average</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Top Country</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{countryData[0]?.name || 'N/A'}</div>
                        <p className="text-xs text-muted-foreground mt-1">${(countryData[0]?.value || 0).toLocaleString()} in revenue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="text-base">Repeat Rate</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-primary">{((mainCustMap.filter(c => c.orders > 1).length / Math.max(mainKPI.totalCustomers, 1)) * 100).toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">Customers with multiple orders</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
