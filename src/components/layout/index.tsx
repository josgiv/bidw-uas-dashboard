"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BarChart3, Settings, PieChart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/components/DashboardContext";

export const Navbar = () => {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname?.startsWith(href);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur-md shadow-sm">
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md">
                        <LayoutDashboard className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-foreground">UAS BIDW</span>
                        <span className="text-[10px] text-muted-foreground -mt-1">Business Intelligence Dashboard</span>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-1">
                    <NavLink href="/dashboard" icon={<BarChart3 className="h-4 w-4" />} label="Overview" active={isActive("/dashboard")} />
                    <NavLink href="/sales" icon={<PieChart className="h-4 w-4" />} label="Sales" active={isActive("/sales")} />
                    <NavLink href="/customers" icon={<User className="h-4 w-4" />} label="Customers" active={isActive("/customers")} />
                    <NavLink href="/kpi" icon={<BarChart3 className="h-4 w-4" />} label="KPI Analysis" active={isActive("/kpi")} />
                    <NavLink href="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" active={isActive("/settings")} />
                </div>

                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ring-2 ring-white shadow-md cursor-pointer hover:scale-105 transition-transform" />
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ href, icon, label, active = false }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) => (
    <Link href={href}>
        <Button
            variant={active ? "default" : "ghost"}
            size="sm"
            className={cn(
                "gap-2 transition-all duration-200",
                active && "bg-primary text-primary-foreground shadow-md"
            )}
        >
            {icon}
            {label}
        </Button>
    </Link>
);

export const Footer = () => {
    return (
        <footer className="border-t border-border bg-white py-6 text-center text-sm text-muted-foreground">
            <div className="px-6">
                <p className="font-medium">© {new Date().getFullYear()} UAS BIDW - Business Intelligence & Data Warehousing</p>
                <p className="mt-1 text-xs">Universitas Bunda Mulia | Final Project Dashboard</p>
            </div>
        </footer>
    );
};

export const DashboardLayout = ({ children, filterSidebar }: { children: React.ReactNode; filterSidebar?: React.ReactNode }) => {
    const { isSidebarCollapsed } = useDashboard();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 text-foreground">
            <Navbar />
            {filterSidebar}
            <main
                className={cn(
                    "min-h-[calc(100vh-140px)] px-4 md:px-6 pt-4 pb-8 transition-all duration-300 ease-out",
                    isSidebarCollapsed ? "ml-0 lg:ml-14" : "ml-0 lg:ml-[320px]"
                )}
            >
                <div className="w-full max-w-[1800px] mx-auto">
                    {children}
                </div>
            </main>
            <Footer />
        </div>
    );
};
