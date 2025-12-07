"use client";

import React, { useState } from "react";
import { useDashboard } from "@/components/DashboardContext";
import { DimensionField, MetricField } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import {
    ListFilter, BarChart2, ChevronLeft, ChevronRight, Users, Globe,
    ShoppingBag, Heart, Package, Layers, X
} from "lucide-react";
import { AllDimensionCounts } from "@/lib/filterUtils";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";

interface FilterSidebarProps {
    counts: AllDimensionCounts;
}

export const FilterSidebar = ({ counts }: FilterSidebarProps) => {
    const {
        analysisDimension, setAnalysisDimension,
        analysisMetric, setAnalysisMetric,
        filters, setFilters,
        compareMode, setCompareMode,
        comparisonFilters, setComparisonFilters,
        isSidebarCollapsed, setSidebarCollapsed,
        meta
    } = useDashboard();

    const [editTarget, setEditTarget] = useState<'main' | 'comparison'>('main');

    // Reset edit target when compare mode is disabled
    React.useEffect(() => {
        if (!compareMode) setEditTarget('main');
    }, [compareMode]);

    const currentFilters = editTarget === 'main' ? filters : comparisonFilters;
    const setTargetFilters = editTarget === 'main' ? setFilters : setComparisonFilters;

    const handleMultiSelect = (key: keyof typeof filters, value: string) => {
        const currentValue = currentFilters[key];

        // Ensure we handle "ALL" interactions correctly for both modes
        if (value === "ALL") {
            setTargetFilters({ ...currentFilters, [key]: "ALL" });
            return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentArray = Array.isArray(currentValue) ? currentValue : [currentValue];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filtered = (currentArray as any[]).filter(v => v !== "ALL");

        if (filtered.includes(value)) {
            // Remove from selection
            const newArray = filtered.filter(v => v !== value);
            setTargetFilters({ ...currentFilters, [key]: newArray.length > 0 ? newArray : "ALL" });
        } else {
            // Add to selection
            setTargetFilters({ ...currentFilters, [key]: [...filtered, value] });
        }
    };

    const isSelected = (key: keyof typeof filters, value: string) => {
        const currentValue = currentFilters[key];
        if (currentValue === "ALL" && value === "ALL") return true;
        if (Array.isArray(currentValue)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return (currentValue as any[]).includes(value);
        }
        return currentValue === value;
    };

    const getActiveCount = (key: keyof typeof filters) => {
        const value = currentFilters[key];
        if (value === "ALL") return 0;
        return Array.isArray(value) ? value.length : 1;
    };

    const clearFilter = (key: keyof typeof filters) => {
        setTargetFilters({ ...currentFilters, [key]: "ALL" });
    };

    const renderMultiSelectFilter = (
        key: keyof typeof filters,
        label: string,
        icon: React.ReactNode,
        options: string[],
        countMap: Record<string, number>,
        formatter?: (val: string) => string
    ) => {
        const activeCount = getActiveCount(key);

        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                        {icon}
                        {label}
                        {activeCount > 0 && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                {activeCount}
                            </Badge>
                        )}
                    </Label>
                    {activeCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                            onClick={() => clearFilter(key)}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[200px] rounded-md border p-2">
                    <div className="space-y-2">
                        {/* Always show 'Select All' option */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id={`${key}-all`}
                                checked={isSelected(key, "ALL")}
                                onCheckedChange={() => handleMultiSelect(key, "ALL")}
                            />
                            <label
                                htmlFor={`${key}-all`}
                                className="text-sm font-medium cursor-pointer flex-1"
                            >
                                All {label}
                            </label>
                        </div>
                        {options.slice(0, 100).map((option) => {
                            const count = countMap[option] || 0;
                            if (count === 0) return null;

                            return (
                                <div key={option} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`${key}-${option}`}
                                        checked={isSelected(key, option)}
                                        onCheckedChange={() => handleMultiSelect(key, option)}
                                    />
                                    <label
                                        htmlFor={`${key}-${option}`}
                                        className="text-sm cursor-pointer flex-1 flex items-center justify-between"
                                    >
                                        <span>{formatter ? formatter(option) : option}</span>
                                        <span className="text-xs text-muted-foreground">({count})</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        );
    };

    return (
        <div
            className={`fixed left-0 top-[64px] h-[calc(100vh-64px)] bg-white border-r border-border shadow-lg transition-all duration-300 z-30 ${isSidebarCollapsed ? "w-12" : "w-80"
                }`}
            style={{ backgroundColor: "#ffffff" }}
        >
            {/* Collapse Toggle */}
            <Button
                variant="ghost"
                size="sm"
                className="absolute -right-3 top-4 h-6 w-6 rounded-full border bg-white shadow-md p-0"
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
            >
                {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>

            {/* Collapsed State */}
            {isSidebarCollapsed ? (
                <div className="flex flex-col items-center py-4 gap-4">
                    <ListFilter className="h-5 w-5 text-primary" />
                    <BarChart2 className="h-5 w-5 text-emerald-500" />
                </div>
            ) : (
                /* Expanded State */
                <ScrollArea className="h-full">
                    <div className="p-4 space-y-6">
                        {/* Header */}
                        <div>
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <ListFilter className="h-5 w-5 text-primary" />
                                Filters
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1">
                                Configure your analysis parameters
                            </p>
                        </div>

                        {/* Compare Mode Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="compare-mode" className="text-sm font-medium">
                                    Compare Mode
                                </Label>
                                <Badge variant={compareMode ? "default" : "outline"} className="text-xs">
                                    {compareMode ? "ON" : "OFF"}
                                </Badge>
                            </div>
                            <Switch
                                id="compare-mode"
                                checked={compareMode}
                                onCheckedChange={setCompareMode}
                            />
                        </div>

                        {/* Filter Set Toggle (Visible only in Compare Mode) */}
                        {compareMode && (
                            <div className="flex p-1 bg-muted rounded-md relative z-10 border border-border">
                                <button
                                    className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${editTarget === 'main' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    onClick={() => setEditTarget('main')}
                                >
                                    Primary Set
                                </button>
                                <button
                                    className={`flex-1 text-xs font-medium py-1.5 rounded-sm transition-all ${editTarget === 'comparison' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                    onClick={() => setEditTarget('comparison')}
                                >
                                    Comparison Set
                                </button>
                            </div>
                        )}

                        {/* Analysis Dimension */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <BarChart2 className="h-4 w-4 text-primary" />
                                View By
                            </Label>
                            <Select value={analysisDimension} onValueChange={(v) => setAnalysisDimension(v as DimensionField)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="category">Category</SelectItem>
                                    <SelectItem value="subcategory">Subcategory</SelectItem>
                                    <SelectItem value="year">Year</SelectItem>
                                    <SelectItem value="country">Country</SelectItem>
                                    <SelectItem value="gender">Gender</SelectItem>
                                    <SelectItem value="maritalStatus">Marital Status</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Analysis Metric */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <BarChart2 className="h-4 w-4 text-emerald-500" />
                                Metric
                            </Label>
                            <Select value={analysisMetric} onValueChange={(v) => setAnalysisMetric(v as MetricField)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="revenue">Revenue</SelectItem>
                                    <SelectItem value="quantity">Quantity</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="h-px bg-border" />

                        {/* Multi-Select Filters */}
                        {renderMultiSelectFilter(
                            "category",
                            "Category",
                            <ShoppingBag className="h-4 w-4" />,
                            meta.categories,
                            counts.categories
                        )}

                        {renderMultiSelectFilter(
                            "subcategory",
                            "Subcategory",
                            <Layers className="h-4 w-4" />,
                            meta.subcategories,
                            counts.subcategories
                        )}

                        {renderMultiSelectFilter(
                            "product",
                            "Product",
                            <Package className="h-4 w-4" />,
                            meta.products,
                            counts.products,
                            (p) => p.substring(0, 30) + (p.length > 30 ? "..." : "")
                        )}

                        <div className="h-px bg-border" />

                        {renderMultiSelectFilter(
                            "country",
                            "Country",
                            <Globe className="h-4 w-4" />,
                            meta.countries,
                            counts.countries
                        )}

                        {renderMultiSelectFilter(
                            "gender",
                            "Gender",
                            <Users className="h-4 w-4" />,
                            meta.genders,
                            counts.genders,
                            (g) => (g === "M" ? "Male" : g === "F" ? "Female" : g)
                        )}

                        {renderMultiSelectFilter(
                            "maritalStatus",
                            "Marital Status",
                            <Heart className="h-4 w-4" />,
                            meta.maritalStatuses,
                            counts.maritalStatuses,
                            (s) => (s === "M" ? "Married" : s === "S" ? "Single" : s)
                        )}
                    </div>
                </ScrollArea>
            )}
        </div>
    );
};
