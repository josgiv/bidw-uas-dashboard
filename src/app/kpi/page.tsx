
import React from "react";
import { getMasterData } from "@/lib/master";
import { Providers } from "@/components/Providers";
import { DashboardLayout } from "@/components/layout";
import { FilterSidebarWrapper } from "@/components/FilterSidebarWrapper";
import { KpiClient } from "@/components/KpiClient";

export const dynamic = 'force-dynamic';

export default async function KpiPage() {
    const { data, meta } = await getMasterData();

    return (
        <Providers meta={meta}>
            <DashboardLayout filterSidebar={<FilterSidebarWrapper data={data} />}>
                <KpiClient data={data} />
            </DashboardLayout>
        </Providers>
    );
}
