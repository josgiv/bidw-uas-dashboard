
"use client";

import React, { useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, DollarSign, ShoppingCart, Users } from "lucide-react";
import { MasterRecord } from "@/lib/types";
import { useDashboard } from "./DashboardContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from "recharts";

interface KpiClientProps {
    data: MasterRecord[];
}

export const KpiClient: React.FC<KpiClientProps> = ({ data }) => {
    // --- KPI Calculations ---

    const { filters } = useDashboard();

    // Reusable filter function (matches SalesClient logic)
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

    const filteredData = useMemo(() => getFilteredSubSet(data, filters), [data, filters]);

    const kpiMetrics = useMemo(() => {
        if (!filteredData) return null;

        // Use filteredData for all calculations
        const currentData = filteredData;

        // 1. Total Revenue
        const totalRevenue = currentData.reduce((sum, r) => sum + r.revenue, 0);

        // 2. Total Orders
        const uniqueOrders = new Set(currentData.map(r => r.orderId));
        const totalOrders = uniqueOrders.size;

        // 3. Total Quantity Sold
        const totalQuantity = currentData.reduce((sum, r) => sum + r.quantity, 0);

        // 4. Average Order Value (AOV)
        const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // 5. Unique Customers
        const uniqueCustomers = new Set(currentData.map(r => r.customerId));
        const totalUniqueCustomers = uniqueCustomers.size;

        // 6. Repeat Purchase Rate
        const customerOrders = new Map<string, Set<string>>();
        currentData.forEach(r => {
            const custId = r.customerId;
            const ordNum = r.orderId;
            if (!customerOrders.has(custId)) {
                customerOrders.set(custId, new Set());
            }
            customerOrders.get(custId)?.add(ordNum);
        });

        let repeatCustomers = 0;
        customerOrders.forEach((orders) => {
            if (orders.size > 1) repeatCustomers++;
        });

        const repeatPurchaseRate = totalUniqueCustomers > 0 ? (repeatCustomers / totalUniqueCustomers) * 100 : 0;


        // 7. Top Products
        const productRevenue = new Map<string, number>();
        const productQuantity = new Map<string, number>();

        currentData.forEach(r => {
            const prodName = r.productName;
            productRevenue.set(prodName, (productRevenue.get(prodName) || 0) + r.revenue);
            productQuantity.set(prodName, (productQuantity.get(prodName) || 0) + r.quantity);
        });

        const topProductsByRevenue = Array.from(productRevenue.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        const topProductsByQuantity = Array.from(productQuantity.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);


        // 8. Revenue Growth (Monthly)
        // Note: For growth calculation, we might ideally need the "previous period" data 
        // relative to the current filter, but strictly following the prompt "revenue growth from time to time" 
        // using the available filtered data implies showing the trend within the selected subset.
        const monthlyRevenue = new Map<string, number>();
        currentData.forEach(r => {
            const monthKey = `${r.year}-${String(r.month).padStart(2, '0')}`;
            monthlyRevenue.set(monthKey, (monthlyRevenue.get(monthKey) || 0) + r.revenue);
        });

        const sortedMonths = Array.from(monthlyRevenue.keys()).sort();

        let revenueGrowth = 0;

        if (sortedMonths.length >= 2) {
            const lastMonth = sortedMonths[sortedMonths.length - 1];
            const prevMonth = sortedMonths[sortedMonths.length - 2];
            const lastMonthRevenue = monthlyRevenue.get(lastMonth) || 0;
            const previousMonthRevenue = monthlyRevenue.get(prevMonth) || 0;

            if (previousMonthRevenue > 0) {
                revenueGrowth = ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
            }
        }

        const growthChartData = sortedMonths.map(month => ({
            name: month,
            revenue: monthlyRevenue.get(month) || 0
        }));


        return {
            totalRevenue,
            totalOrders,
            totalQuantity,
            aov,
            totalUniqueCustomers,
            repeatPurchaseRate,
            topProductsByRevenue,
            topProductsByQuantity,
            revenueGrowth,
            growthChartData
        };

    }, [filteredData]);

    if (!kpiMetrics) {
        return <div className="p-10">Loading KPI Data...</div>;
    }

    const {
        totalRevenue,
        totalOrders,
        aov,
        totalUniqueCustomers,
        repeatPurchaseRate,
        revenueGrowth,
        growthChartData,
        topProductsByRevenue,
        topProductsByQuantity
    } = kpiMetrics;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    }

    const formatNumber = (val: number) => {
        return new Intl.NumberFormat('en-US').format(val);
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">

            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-indigo-900">KPI Calculation Dashboard</h1>
                <p className="text-muted-foreground">
                    Comprehensive breakdown of key performance indicators and their methodologies.
                </p>
            </div>

            {/* Top Cards Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    title="Total Revenue"
                    icon={DollarSign}
                    value={formatCurrency(totalRevenue)}
                    description="Total sales value from all transactions"
                    trend={revenueGrowth}
                    trendLabel="vs last month"
                />
                <KpiCard
                    title="Total Orders"
                    icon={ShoppingCart}
                    value={formatNumber(totalOrders)}
                    description="Total count of unique order IDs"
                />
                <KpiCard
                    title="Avg Order Value"
                    icon={ArrowUpRight}
                    value={formatCurrency(aov)}
                    description="Average revenue per order"
                />
                <KpiCard
                    title="Unique Customers"
                    icon={Users}
                    value={formatNumber(totalUniqueCustomers)}
                    description={`Repeat Rate: ${repeatPurchaseRate.toFixed(1)}%`}
                />
            </div>

            {/* Methodology Table */}
            <Card className="border-indigo-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-indigo-50/50">
                    <CardTitle className="text-indigo-900 text-lg">Metode Perhitungan KPI</CardTitle>
                    <CardDescription>Referensi rumus yang digunakan dalam perhitungan di atas</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[200px]">KPI</TableHead>
                                <TableHead className="w-[300px]">Deskripsi</TableHead>
                                <TableHead>Metode Perhitungan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <MethodologyRow
                                kpi="Total Revenue"
                                desc="Total nilai transaksi penjualan"
                                method="SUM(sls_sales)"
                            />
                            <MethodologyRow
                                kpi="Total Orders"
                                desc="Jumlah transaksi atau order"
                                method="COUNT(DISTINCT order_id)"
                            />
                            <MethodologyRow
                                kpi="Total Quantity Sold"
                                desc="Total kuantitas produk yang terjual"
                                method="SUM(sls_quantity)"
                            />
                            <MethodologyRow
                                kpi="Average Order Value (AOV)"
                                desc="Nilai rata-rata setiap transaksi"
                                method="SUM(sls_sales) / COUNT(order_id)"
                            />
                            <MethodologyRow
                                kpi="Revenue Growth"
                                desc="Persentase pertumbuhan penjualan dari waktu ke waktu"
                                method="Perbandingan periode saat ini dan sebelumnya"
                            />
                            <MethodologyRow
                                kpi="Unique Customers"
                                desc="Jumlah pelanggan unik yang melakukan transaksi"
                                method="COUNT(DISTINCT sls_cust_id)"
                            />
                            <MethodologyRow
                                kpi="Repeat Purchase Rate"
                                desc="Persentase pelanggan yang melakukan pembelian lebih dari satu kali"
                                method="(Repeat customers / total customers) × 100"
                            />
                            <MethodologyRow
                                kpi="Top Products by Revenue"
                                desc="Produk dengan kontribusi revenue terbesar"
                                method="SUM(sls_sales) GROUP BY product"
                            />
                            <MethodologyRow
                                kpi="Top Products by Quantity"
                                desc="Produk dengan penjualan unit tertinggi"
                                method="SUM(sls_quantity)"
                            />
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">

                {/* Revenue Growth Chart */}
                <Card className="col-span-4 border-indigo-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Revenue Growth Trend</CardTitle>
                        <CardDescription>Monthly revenue performance over time</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={growthChartData}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="#6366f1"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: "#6366f1" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products Table */}
                <Card className="col-span-3 border-indigo-100 shadow-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle>Top Products by Revenue</CardTitle>
                        <CardDescription>Highest earning products</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product Name</TableHead>
                                    <TableHead className="text-right">Revenue</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topProductsByRevenue.slice(0, 5).map((prod) => (
                                    <TableRow key={prod.name}>
                                        <TableCell className="font-medium text-xs text-wrap">{prod.name}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(prod.value)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                {/* Top Products Qty */}
                <Card className="col-span-1 border-indigo-100 shadow-sm">
                    <CardHeader>
                        <CardTitle>Top Products by Quantity</CardTitle>
                        <CardDescription>Most sold units</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topProductsByQuantity} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={150}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// --- Helper Components ---

const KpiCard = ({ title, icon: Icon, value, description, trend, trendLabel }: {
    title: string;
    icon: React.ElementType;
    value: string;
    description: string;
    trend?: number;
    trendLabel?: string;
}) => (
    <Card className="border-l-4 border-l-indigo-500 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                {title}
            </CardTitle>
            <Icon className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-indigo-950">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
            {trend !== undefined && (
                <div className={`flex items-center text-xs mt-2 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                    <span className="font-bold">{Math.abs(trend).toFixed(1)}%</span>
                    <span className="text-muted-foreground ml-1">{trendLabel}</span>
                </div>
            )}
        </CardContent>
    </Card>
);

const MethodologyRow = ({ kpi, desc, method }: { kpi: string, desc: string, method: string }) => (
    <TableRow>
        <TableCell className="font-semibold text-indigo-900">{kpi}</TableCell>
        <TableCell>{desc}</TableCell>
        <TableCell className="font-mono text-xs bg-slate-50 p-2 rounded border border-slate-100 block w-fit mt-1 mb-1">{method}</TableCell>
    </TableRow>
);
