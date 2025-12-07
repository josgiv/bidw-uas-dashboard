"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, BarChart2, Database, Users, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Navbar */}
            <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="font-bold text-xl flex items-center gap-2">
                        <BarChart2 className="h-6 w-6 text-primary" />
                        <span>RetailAnalytics</span>
                    </div>
                    <nav className="hidden md:flex gap-6 text-sm font-medium">
                        <a href="#about" className="hover:text-primary transition-colors">About</a>
                        <a href="#dataset" className="hover:text-primary transition-colors">Dataset</a>
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                    </nav>
                    <Link href="/dashboard">
                        <Button>
                            Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 lg:py-32 relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="max-w-3xl space-y-6"
                >
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                        Advanced Business Intelligence <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">
                            Dashboard Solution
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground">
                        Explore comprehensive sales insights, customer demographics, and performance metrics through an interactive, enterprise-grade interface.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Link href="/dashboard">
                            <Button size="lg" className="h-12 px-8 text-lg hover:scale-105 transition-transform">
                                Explore Dashboard
                            </Button>
                        </Link>
                        <Link href="/profile">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                                View Profile
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Dataset Context */}
            <section id="dataset" className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">The Dataset</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Built on a robust retail dataset referencing global sales transactions, focusing on product performance, customer behavior, and regional trends.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Card>
                            <CardHeader>
                                <Database className="h-10 w-10 text-primary mb-2" />
                                <CardTitle>Sales Transactions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Detailed logs of every purchase, including order dates, revenue, quantity, and product details.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <Users className="h-10 w-10 text-emerald-500 mb-2" />
                                <CardTitle>Customer Demographics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Rich customer profiles featuring gender, marital status, income brackets, and educational background.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <Globe className="h-10 w-10 text-blue-500 mb-2" />
                                <CardTitle>Geographic Reach</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    Global coverage spanning major markets like USA, UK, Germany, France, Australia, and Canada.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Developer Info */}
            <section className="py-20 border-t bg-muted/10">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-10">Development Team</h2>
                    <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
                        Proudly presented by students of <span className="font-semibold text-foreground">Universitas Bunda Mulia</span> for the Business Intelligence & Data Warehousing Final Project.
                    </p>

                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
                        {[
                            { nim: "36230035", name: "JOSIA GIVEN SANTOSO", role: "" },
                            { nim: "36230031", name: "LEON HIUNATA", role: "" },
                            { nim: "36230037", name: "VINSENSIUS ERIK KIE", role: "" }
                        ].map((dev) => (
                            <Card key={dev.nim} className="hover:shadow-lg transition-shadow border-primary/20">
                                <CardHeader>
                                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 text-primary font-bold text-xl">
                                        {dev.name.charAt(0)}
                                    </div>
                                    <CardTitle className="text-lg">{dev.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-mono text-sm text-primary mb-2">{dev.nim}</p>
                                    <p className="text-sm text-muted-foreground">{dev.role}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="inline-block p-6 bg-card rounded-xl border shadow-sm">
                        <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Lecturer</p>
                        <p className="text-xl font-bold text-foreground">Eko Wahyu Prasetyo. S.T., M.Eng</p>
                    </div>
                </div>
            </section>

            <footer className="py-8 bg-muted text-center text-sm text-muted-foreground">
                © 2024 RetailAnalytics. All rights reserved.
            </footer>
        </div>
    );
}
