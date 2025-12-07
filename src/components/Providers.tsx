"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { DashboardProvider } from "./DashboardContext";
import { FilterMeta } from "@/lib/types";

export function Providers({ children, meta }: { children: React.ReactNode; meta: FilterMeta }) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
            <DashboardProvider meta={meta}>
                {children}
            </DashboardProvider>
        </NextThemesProvider>
    );
}
