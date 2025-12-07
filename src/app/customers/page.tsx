import React from "react";
import { getMasterData } from "@/lib/master";
import { Providers } from "@/components/Providers";
import { DashboardLayout } from "@/components/layout";
import { FilterSidebarWrapper } from "@/components/FilterSidebarWrapper";
import { CustomersClient } from "@/components/CustomersClient";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
    const { data, meta } = await getMasterData();

    return (
        <Providers meta={meta}>
            <DashboardLayout filterSidebar={<FilterSidebarWrapper data={data} />}>
                <CustomersClient data={data} />
            </DashboardLayout>
        </Providers>
    );
}
