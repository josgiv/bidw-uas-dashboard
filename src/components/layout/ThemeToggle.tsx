"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
        >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-orange-500" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
            <span className="sr-only">Toggle theme</span>
        </motion.button>
    );
}
