"use client";

import React, { useMemo } from "react";
import { useDashboard } from "./DashboardContext";
import { MasterRecord } from "@/lib/types";
import { calculateCascadingCounts } from "@/lib/filterUtils";
import { FilterSidebar } from "./FilterSidebar";

interface FilterSidebarWrapperProps {
    data: MasterRecord[];
}

export function FilterSidebarWrapper({ data }: FilterSidebarWrapperProps) {
    const { filters } = useDashboard();

    const counts = useMemo(() => calculateCascadingCounts(data, filters), [data, filters]);

    return <FilterSidebar counts={counts} />;
}
