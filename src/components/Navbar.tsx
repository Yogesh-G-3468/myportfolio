"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { navLinks } from "@/lib/data";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleNavClick = (href: string) => {
        setIsMobileMenuOpen(false);
        if (href.startsWith("#")) {
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: "smooth" });
            }
        } else {
            window.location.href = href;
        }
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                        ? "bg-background/80 backdrop-blur-md border-b border-border shadow-sm"
                        : "bg-transparent"
                    }`}
            >
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <a
                            href="#"
                            className="font-[family-name:var(--font-instrument-serif)] text-xl text-foreground hover:text-accent transition-colors"
                        >
                            yogesh
                        </a>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => handleNavClick(link.href)}
                                    className="text-foreground-secondary hover:text-foreground transition-colors text-sm"
                                >
                                    {link.name}
                                </button>
                            ))}
                            <ThemeToggle />
                        </div>

                        {/* Mobile */}
                        <div className="flex items-center gap-3 md:hidden">
                            <ThemeToggle />
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-foreground-secondary hover:text-foreground transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 pt-16 bg-background/95 backdrop-blur-md md:hidden"
                    >
                        <div className="flex flex-col items-center gap-8 py-12">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => handleNavClick(link.href)}
                                    className="text-foreground-secondary hover:text-foreground transition-colors text-lg"
                                >
                                    {link.name}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
