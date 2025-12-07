import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Advanced BI Dashboard",
  description: "BI Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: '#ffffff' }}>
      <body className={`${inter.className} antialiased bg-white text-foreground`} style={{ backgroundColor: '#ffffff' }}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
