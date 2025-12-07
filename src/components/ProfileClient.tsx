"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Shield, Save } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ProfileClient() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            toast.success("Profile updated successfully!");
        }, 1000);
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src="/avatar-placeholder.png" alt="User" />
                    <AvatarFallback className="text-xl">JS</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-2xl font-bold">Josia Given S</h1>
                    <p className="text-muted-foreground">Admin • josia@example.com</p>
                </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>
                            Manage your basic profile details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullname">Full Name</Label>
                            <Input id="fullname" defaultValue="Josia Given S" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" defaultValue="josia@example.com" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Input id="bio" placeholder="Enter a short bio..." />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Security
                        </CardTitle>
                        <CardDescription>
                            Update your password and security settings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current-pass">Current Password</Label>
                            <Input id="current-pass" type="password" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="new-pass">New Password</Label>
                            <Input id="new-pass" type="password" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="destructive" className="w-full">
                            Sign out of all devices
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={isLoading} className="gap-2">
                    {isLoading ? "Saving..." : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Changes
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
