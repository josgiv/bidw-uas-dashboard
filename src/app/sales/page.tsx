import React from "react";
import { getMasterData } from "@/lib/master";
import { Providers } from "@/components/Providers";
import { DashboardLayout } from "@/components/layout";
import { FilterSidebarWrapper } from "@/components/FilterSidebarWrapper";
import { SalesClient } from "@/components/SalesClient";

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
    const { data, meta } = await getMasterData();

    return (
        <Providers meta={meta}>
            <DashboardLayout filterSidebar={<FilterSidebarWrapper data={data} />}>
                <SalesClient data={data} />
            </DashboardLayout>
        </Providers>
    );
}
