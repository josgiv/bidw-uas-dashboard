import { MasterRecord, DimensionField, MetricField } from "./types";

interface GroupOptions {
    groupBy: DimensionField;
    metric: MetricField;
    orderBy?: 'name' | 'value';
    orderDirection?: 'asc' | 'desc';
    limit?: number;
}

export interface AggregationResult {
    name: string;
    value: number;
    count?: number;
}

export function aggregateData(
    data: MasterRecord[],
    options: GroupOptions
): AggregationResult[] {
    const { groupBy, metric, orderBy = 'value', orderDirection = 'desc', limit } = options;

    const groupMap = new Map<string, number>();
    const countMap = new Map<string, number>();

    data.forEach(record => {
        const key = String(record[groupBy] || "Unknown");
        const val = record[metric] || 0;

        groupMap.set(key, (groupMap.get(key) || 0) + val);
        countMap.set(key, (countMap.get(key) || 0) + 1);
    });

    let results: AggregationResult[] = Array.from(groupMap.entries()).map(([name, value]) => ({
        name,
        value,
        count: countMap.get(name)
    }));

    results.sort((a, b) => {
        const valA = orderBy === 'value' ? a.value : a.name;
        const valB = orderBy === 'value' ? b.value : b.name;

        if (valA < valB) return orderDirection === 'asc' ? -1 : 1;
        if (valA > valB) return orderDirection === 'asc' ? 1 : -1;
        return 0;
    });

    if (limit) {
        results = results.slice(0, limit);
    }

    return results;
}

export function calculateHistogram(
    data: MasterRecord[],
    metric: MetricField,
    bucketSize: number
): { name: string; value: number }[] {
    const buckets = new Map<string, number>();

    data.forEach(record => {
        const val = record[metric];
        const bucketFloor = Math.floor(val / bucketSize) * bucketSize;
        const bucketName = `${bucketFloor}-${bucketFloor + bucketSize}`;

        buckets.set(bucketName, (buckets.get(bucketName) || 0) + 1);
    });

    return Array.from(buckets.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => {
            const floorA = parseInt(a.name.split('-')[0]);
            const floorB = parseInt(b.name.split('-')[0]);
            return floorA - floorB;
        });
}

export interface MatrixResult {
    data: { name: string;[key: string]: string | number }[];
    columns: string[];
}

export function aggregateMatrix(
    data: MasterRecord[],
    rowDim: DimensionField,
    colDim: DimensionField,
    metric: MetricField
): MatrixResult {
    const rowKeys = new Set<string>();
    const colKeys = new Set<string>();
    const matrix = new Map<string, Map<string, number>>();

    data.forEach(record => {
        const rKey = String(record[rowDim] || "Unknown");
        const cKey = String(record[colDim] || "Unknown");
        const val = record[metric] || 0;

        rowKeys.add(rKey);
        colKeys.add(cKey);

        if (!matrix.has(rKey)) matrix.set(rKey, new Map());
        const rowMap = matrix.get(rKey)!;
        rowMap.set(cKey, (rowMap.get(cKey) || 0) + val);
    });

    const columns = Array.from(colKeys).sort();
    const resultData = Array.from(rowKeys).map(rKey => {
        const rowObj: { name: string;[key: string]: string | number } = { name: rKey };
        columns.forEach(cKey => {
            rowObj[cKey] = matrix.get(rKey)?.get(cKey) || 0;
        });
        return rowObj;
    });

    return { data: resultData, columns };
}
