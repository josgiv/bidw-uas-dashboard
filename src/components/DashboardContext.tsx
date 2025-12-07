"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { DimensionField, MetricField, FilterMeta, FilterState } from "@/lib/types";

// Removed local FilterState interface as it is now in types.ts

const DEFAULT_FILTERS: FilterState = {
    dateRange: [undefined, undefined],
    category: "ALL",
    subcategory: "ALL",
    product: "ALL",
    gender: "ALL",
    country: "ALL",
    maritalStatus: "ALL"
};

interface DashboardContextType {
    analysisDimension: DimensionField;
    setAnalysisDimension: (dim: DimensionField) => void;

    analysisMetric: MetricField;
    setAnalysisMetric: (met: MetricField) => void;

    filters: FilterState;
    setFilters: (filters: FilterState) => void;

    compareMode: boolean;
    setCompareMode: (mode: boolean) => void;

    comparisonFilters: FilterState;
    setComparisonFilters: (filters: FilterState) => void;

    isSidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;

    meta: FilterMeta;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children, meta }: { children: ReactNode; meta: FilterMeta }) {
    const [analysisDimension, setAnalysisDimension] = useState<DimensionField>('category');
    const [analysisMetric, setAnalysisMetric] = useState<MetricField>('revenue');
    const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [compareMode, setCompareMode] = useState(false);
    const [comparisonFilters, setComparisonFilters] = useState<FilterState>(DEFAULT_FILTERS);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <DashboardContext.Provider value={{
            analysisDimension,
            setAnalysisDimension,
            analysisMetric,
            setAnalysisMetric,
            filters,
            setFilters,
            compareMode,
            setCompareMode,
            comparisonFilters,
            setComparisonFilters,
            isSidebarCollapsed,
            setSidebarCollapsed,
            meta
        }}>
            {children}
        </DashboardContext.Provider >
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}
