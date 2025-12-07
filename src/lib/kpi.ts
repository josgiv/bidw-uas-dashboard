import { MasterRecord, KPI, SalesTrend, ProductPerformance } from "./types";

export function calculateKPIs(data: MasterRecord[]): { kpi: KPI; trends: SalesTrend[]; topProducts: ProductPerformance[] } {
    let totalRevenue = 0;
    let totalQuantity = 0;
    const uniqueOrders = new Set<string>();
    const uniqueCustomers = new Set<string>();
    const customerOrderCounts: Record<string, number> = {};
    const productPerformance: Record<string, { revenue: number; quantity: number }> = {};
    const dailyStats: Record<string, { revenue: number, orders: Set<string> }> = {};

    // One pass aggregation
    for (const record of data) {
        totalRevenue += record.revenue;
        totalQuantity += record.quantity;
        uniqueOrders.add(record.orderId);
        uniqueCustomers.add(record.customerId);

        // Customer Frequency
        customerOrderCounts[record.customerId] = (customerOrderCounts[record.customerId] || 0) + 1;

        // Product Performance
        const pName = record.productName;
        if (!productPerformance[pName]) productPerformance[pName] = { revenue: 0, quantity: 0 };
        productPerformance[pName].revenue += record.revenue;
        productPerformance[pName].quantity += record.quantity;

        // Daily Trend
        const dateKey = record.dateStr;
        if (!dailyStats[dateKey]) dailyStats[dateKey] = { revenue: 0, orders: new Set() };
        dailyStats[dateKey].revenue += record.revenue;
        dailyStats[dateKey].orders.add(record.orderId);
    }

    const totalOrders = uniqueOrders.size;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Repeat Purchase Rate
    let repeatCustomers = 0;
    for (const id in customerOrderCounts) {
        if (customerOrderCounts[id] > 1) repeatCustomers++;
    }
    const repeatPurchaseRate = uniqueCustomers.size > 0 ? (repeatCustomers / uniqueCustomers.size) * 100 : 0;

    // Trends
    const trends: SalesTrend[] = Object.keys(dailyStats).map(date => ({
        date,
        revenue: dailyStats[date].revenue,
        orders: dailyStats[date].orders.size
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Growth (Last Day vs Prev Day for simple metric)
    let revenueGrowth = 0;
    if (trends.length > 1) {
        const last = trends[trends.length - 1];
        const prev = trends[trends.length - 2];
        if (prev.revenue > 0) {
            revenueGrowth = ((last.revenue - prev.revenue) / prev.revenue) * 100;
        }
    }

    // Top Products
    const topProducts: ProductPerformance[] = Object.keys(productPerformance).map(name => ({
        name,
        revenue: productPerformance[name].revenue,
        quantity: productPerformance[name].quantity,
        contribution: totalRevenue > 0 ? (productPerformance[name].revenue / totalRevenue) * 100 : 0,
        profit: productPerformance[name].revenue * 0.2 // Estimated profit
    })).sort((a, b) => b.revenue - a.revenue);

    return {
        kpi: {
            totalRevenue,
            totalOrders,
            aov,
            totalQuantity,
            revenueGrowth,
            uniqueCustomers: uniqueCustomers.size,
            repeatPurchaseRate
        },
        trends,
        topProducts
    };
}
