"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Settings, PieChart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Navbar = () => {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname?.startsWith(href);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm" style={{ backgroundColor: '#ffffff' }}>
            <div className="container mx-auto flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                        <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-foreground">LuxeAnalytics</span>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <NavLink href="/dashboard" icon={<BarChart3 className="h-4 w-4" />} label="Overview" active={isActive("/dashboard")} />
                    <NavLink href="/sales" icon={<PieChart className="h-4 w-4" />} label="Sales" active={isActive("/sales")} />
                    <NavLink href="/customers" icon={<User className="h-4 w-4" />} label="Customers" active={isActive("/customers")} />
                    <NavLink href="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" active={isActive("/settings")} />
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <div className="h-5 w-5 rounded-full border-2 border-muted" />
                    </Button>
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ring-2 ring-background shadow-sm cursor-pointer hover:ring-primary/20 transition-all" />
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => (
    <Link href={href}>
        <Button
            variant={active ? "secondary" : "ghost"}
            className={cn("gap-2", active && "bg-secondary text-secondary-foreground")}
        >
            {icon}
            {label}
        </Button>
    </Link>
);

export const Footer = () => {
    return (
        <footer className="border-t border-border bg-white py-8 text-center text-sm text-muted-foreground" style={{ backgroundColor: '#ffffff' }}>
            <div className="container mx-auto px-4">
                <p>© {new Date().getFullYear()} LuxeAnalytics. All rights reserved.</p>
                <p className="mt-2 text-xs">Built for BI Dashboard Assignment.</p>
            </div>
        </footer>
    );
};

import { useDashboard } from "@/components/DashboardContext";

export const DashboardLayout = ({ children, filterSidebar }: { children: React.ReactNode; filterSidebar?: React.ReactNode }) => {
    // We try to access context, but if this component is used outside of DashboardProvider (like in root layout if refactored wrong), 
    // it might fail. However, in our current architecture page.tsx wraps it.
    // To be safe, we can make the hook usage optional or handle the error gracefully, 
    // but standard pattern is to assume context exists if structure is correct.

    // NOTE: We need to wrap usage of useDashboard in a component that is definitely inside the provider.
    // Since DashboardLayout is inside Providers in page.tsx, this is safe.

    const { isSidebarCollapsed } = useDashboard();

    return (
        <div className="min-h-screen bg-white text-foreground" style={{ backgroundColor: '#ffffff' }}>
            <Navbar />
            {filterSidebar}
            <main
                className={cn(
                    "container mx-auto px-4 pt-4 pb-12 bg-white transition-all duration-300",
                    isSidebarCollapsed ? "ml-0 lg:ml-12" : "ml-0 lg:ml-80"
                )}
                style={{ backgroundColor: '#ffffff' }}
            >
                {children}
            </main>
            <Footer />
        </div>
    );
};
