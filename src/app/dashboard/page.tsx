import React from "react";
import { getMasterData } from "@/lib/master";
import { DashboardClient } from "@/components/DashboardClient";
import { Providers } from "@/components/Providers";
import { DashboardLayout } from "@/components/layout";
import { FilterSidebarWrapper } from "@/components/FilterSidebarWrapper";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const { data, meta } = await getMasterData();

    return (
        <Providers meta={meta}>
            <DashboardLayout filterSidebar={<FilterSidebarWrapper data={data} />}>
                <DashboardClient data={data} meta={meta} />
            </DashboardLayout>
        </Providers>
    );
}
