import React from "react";
import { getMasterData } from "@/lib/master";
import { Providers } from "@/components/Providers";
import { DashboardLayout } from "@/components/layout";
import { FilterSidebarWrapper } from "@/components/FilterSidebarWrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw, Database } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const { data, meta } = await getMasterData();

    return (
        <Providers meta={meta}>
            <DashboardLayout filterSidebar={<FilterSidebarWrapper data={data} />}>
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold">Dashboard Settings</h1>
                    </div>

                    {/* Export Data */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Export Data</CardTitle>
                            <CardDescription>Download your dashboard data in various formats</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Export as CSV</p>
                                    <p className="text-sm text-muted-foreground">Download filtered data as CSV file</p>
                                </div>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download CSV
                                </Button>
                            </div>
                            <div className="flex items-center justify-between border-t pt-4">
                                <div>
                                    <p className="font-medium">Export as JSON</p>
                                    <p className="text-sm text-muted-foreground">Download filtered data as JSON file</p>
                                </div>
                                <Button variant="outline">
                                    <Download className="h-4 w-4 mr-2" />
                                    Download JSON
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Data Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Management</CardTitle>
                            <CardDescription>Manage your dashboard data and cache</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Refresh Data</p>
                                    <p className="text-sm text-muted-foreground">Reload data from source</p>
                                </div>
                                <Button variant="outline">
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Refresh
                                </Button>
                            </div>
                            <div className="flex items-center justify-between border-t pt-4">
                                <div>
                                    <p className="font-medium">Clear Cache</p>
                                    <p className="text-sm text-muted-foreground">Clear all cached dashboard data</p>
                                </div>
                                <Button variant="outline">
                                    <Database className="h-4 w-4 mr-2" />
                                    Clear Cache
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Theme Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Dashboard appearance settings</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Theme</p>
                                    <p className="text-sm text-muted-foreground">Light mode only (as configured)</p>
                                </div>
                                <div className="px-3 py-1 bg-muted rounded-md text-sm">
                                    Light
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* About */}
                    <Card>
                        <CardHeader>
                            <CardTitle>About</CardTitle>
                            <CardDescription>Dashboard information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Version:</span>
                                    <span>1.0.0</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Framework:</span>
                                    <span>Next.js 16</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">UI Library:</span>
                                    <span>Shadcn UI</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DashboardLayout>
        </Providers>
    );
}
