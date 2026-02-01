"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 rounded-full bg-background-elevated border border-border text-foreground-secondary hover:text-accent hover:border-accent transition-colors"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
        >
            <motion.div
                initial={false}
                animate={{ rotate: resolvedTheme === "dark" ? 0 : 180 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                {resolvedTheme === "dark" ? (
                    <Moon size={18} />
                ) : (
                    <Sun size={18} />
                )}
            </motion.div>
        </motion.button>
    );
}
