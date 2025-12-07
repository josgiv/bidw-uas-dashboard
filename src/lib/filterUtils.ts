import { MasterRecord, FilterState } from "./types";

// Helper type for counts
export type DimensionCounts = Record<string, number>;

export interface AllDimensionCounts {
    categories: DimensionCounts;
    subcategories: DimensionCounts;
    products: DimensionCounts;
    countries: DimensionCounts;
    genders: DimensionCounts;
    maritalStatuses: DimensionCounts;
}

export function calculateCascadingCounts(
    allData: MasterRecord[],
    filters: FilterState
): AllDimensionCounts {

    // Helper to filter data excluding ONE key
    const filterExcluding = (excludeKey: keyof FilterState) => {
        return allData.filter(r => {
            // Helper to check if record matches filter
            const matches = (key: keyof FilterState, recordVal: string) => {
                // Cast key to exclude dateRange for type safety
                if (key === 'dateRange' || key === 'compareMode') return true;

                const filterVal = filters[key];
                if (filterVal === 'ALL') return true;
                if (Array.isArray(filterVal)) return (filterVal as string[]).includes(recordVal);
                return filterVal === recordVal;
            };

            if (excludeKey !== 'category' && !matches('category', r.category)) return false;
            if (excludeKey !== 'subcategory' && !matches('subcategory', r.subcategory)) return false;
            if (excludeKey !== 'country' && !matches('country', r.country)) return false;
            if (excludeKey !== 'gender' && !matches('gender', r.gender)) return false;
            if (excludeKey !== 'maritalStatus' && !matches('maritalStatus', r.maritalStatus)) return false;
            if (excludeKey !== 'product' && !matches('product', r.productName)) return false;

            return true;
        });
    };

    const countBy = (data: MasterRecord[], key: keyof MasterRecord): DimensionCounts => {
        const counts: DimensionCounts = {};
        for (const r of data) {
            const val = String(r[key]);
            counts[val] = (counts[val] || 0) + 1;
        }
        return counts;
    };

    // 1. Categories (Filter by everything else)
    const catData = filterExcluding('category');
    const categories = countBy(catData, 'category');

    // 2. Subcategories
    const subData = filterExcluding('subcategory');
    const subcategories = countBy(subData, 'subcategory');

    // 3. Countries
    const ctryData = filterExcluding('country');
    const countries = countBy(ctryData, 'country');

    // 4. Genders
    const genData = filterExcluding('gender');
    const genders = countBy(genData, 'gender');

    // 5. Marital Status
    const marData = filterExcluding('maritalStatus');
    const maritalStatuses = countBy(marData, 'maritalStatus');

    // 6. Products
    const prodData = filterExcluding('product');
    const products = countBy(prodData, 'productName');

    return { categories, subcategories, countries, genders, maritalStatuses, products };
}
