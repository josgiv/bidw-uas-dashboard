export interface Sale {
    sls_ord_num: string;
    sls_prd_key: string;
    prd_key: string;
    sls_cust_id: string;
    sls_order_dt: string;
    sls_sales: number;
    sls_quantity: number;
    sls_price: number;
}

export interface Product {
    prd_key: string;
    prd_nm: string;
    cat_key: string;
    CAT: string;
    SUBCAT: string;
    prd_cost: number;
    prd_color: string;
    prd_status: string;
}

export interface Customer {
    customer_id: string;
    firstname: string;
    lastname: string;
    gender: string;
    country: string;
    marital_status: string;
    birth_date: string;
    email: string;
}

export interface DateRecord {
    date: string;
    year: number;
    month: number;
    day_of_week: number;
    is_weekend: boolean;
}

// Denormalized Flat Record for Analysis
export interface MasterRecord {
    orderId: string;
    date: Date;
    dateStr: string;
    year: number;
    month: number;
    dayOfWeek: number;

    // Metrics
    revenue: number;
    quantity: number;

    // Product Dimensions
    productName: string;
    category: string;
    subcategory: string;
    color: string;
    status: string;

    // Customer Dimensions
    customerId: string;
    customerName: string;
    gender: string;
    country: string;
    maritalStatus: string;
    ageGroup?: string;
}

export interface FilterMeta {
    categories: string[];
    subcategories: string[];
    genders: string[];
    countries: string[];
    maritalStatuses: string[];
    colors: string[];
    products: string[];
}

export type DimensionField = keyof Pick<MasterRecord, 'category' | 'subcategory' | 'gender' | 'country' | 'year' | 'month' | 'dayOfWeek' | 'dateStr' | 'maritalStatus' | 'color'>;
export type MetricField = keyof Pick<MasterRecord, 'revenue' | 'quantity'>;

// Restored Type definitions for backward compatibility and Key Metrics
export interface KPI {
    totalRevenue: number;
    totalOrders: number;
    aov: number;
    totalQuantity: number;
    revenueGrowth: number;
    uniqueCustomers: number;
    repeatPurchaseRate: number;
}

export interface SalesTrend {
    date: string;
    revenue: number;
    orders?: number;
    comparison?: number;
}

export interface ProductPerformance {
    name: string;
    revenue: number;
    quantity: number;
    contribution: number;
    profit: number;
}

export interface FilterState {
    dateRange: [Date | undefined, Date | undefined];
    category: string | string[]; // Support both single and multi-select
    subcategory: string | string[];
    product: string | string[];
    gender: string | string[];
    country: string | string[];
    maritalStatus: string | string[];
    compareMode?: boolean; // Flag to indicate comparison mode
}
