import { getSalesData, getProductData, getCustomerData, getDateData } from "./loader";
import { MasterRecord, Product, Customer, DateRecord, FilterMeta } from "./types";

let masterCache: MasterRecord[] | null = null;
let metaCache: FilterMeta | null = null;

function parseUSDate(dateStr: string): Date {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
    }
    return new Date(dateStr);
}

export async function getMasterData(): Promise<{ data: MasterRecord[]; meta: FilterMeta }> {
    if (masterCache && metaCache) return { data: masterCache, meta: metaCache };

    const [sales, products, customers, dates] = await Promise.all([
        getSalesData(),
        getProductData(),
        getCustomerData(),
        getDateData()
    ]);

    const productMap = new Map<string, Product>();
    // Sets for Meta extraction
    const categories = new Set<string>();
    const subcategories = new Set<string>();
    const colors = new Set<string>();
    const productNames = new Set<string>();

    products.forEach(p => {
        productMap.set(p.prd_key, p);
        if (p.CAT) categories.add(p.CAT);
        if (p.SUBCAT) subcategories.add(p.SUBCAT);
        if (p.prd_color) colors.add(p.prd_color);
        if (p.prd_nm) productNames.add(p.prd_nm);
    });

    const customerMap = new Map<string, Customer>();
    const countries = new Set<string>();
    const genders = new Set<string>();
    const maritalStatuses = new Set<string>();

    customers.forEach(c => {
        customerMap.set(c.customer_id.toString(), c);
        if (c.country) countries.add(c.country);
        if (c.gender) genders.add(c.gender);
        if (c.marital_status) maritalStatuses.add(c.marital_status);
    });

    const masterData: MasterRecord[] = [];

    sales.forEach(sale => {
        const product = productMap.get(sale.prd_key);
        const customer = customerMap.get(sale.sls_cust_id.toString());

        const dateObj = parseUSDate(sale.sls_order_dt);
        if (isNaN(dateObj.getTime())) return;
        const isoDateStr = dateObj.toISOString().split('T')[0];

        if (product && customer) {
            masterData.push({
                orderId: sale.sls_ord_num,
                date: dateObj,
                dateStr: isoDateStr,
                year: dateObj.getFullYear(),
                month: dateObj.getMonth() + 1,
                dayOfWeek: dateObj.getDay(),
                revenue: sale.sls_sales,
                quantity: sale.sls_quantity,

                productName: product.prd_nm,
                category: product.CAT,
                subcategory: product.SUBCAT,
                color: product.prd_color,
                status: product.prd_status,

                customerId: customer.customer_id,
                customerName: `${customer.firstname} ${customer.lastname}`,
                gender: customer.gender,
                country: customer.country || "Unknown",
                maritalStatus: customer.marital_status
            });
        }
    });

    masterCache = masterData;
    metaCache = {
        categories: Array.from(categories).sort(),
        subcategories: Array.from(subcategories).sort(),
        genders: Array.from(genders).sort(),
        countries: Array.from(countries).sort(),
        maritalStatuses: Array.from(maritalStatuses).sort(),
        colors: Array.from(colors).sort(),
        products: Array.from(productNames).sort()
    };

    return { data: masterData, meta: metaCache };
}
