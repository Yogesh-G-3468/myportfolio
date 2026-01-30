"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Download } from "lucide-react";
import Image from "next/image";
import { navLinks, personalInfo } from "@/lib/data";

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
        const element = document.querySelector(href);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "glass shadow-lg"
                    : "bg-transparent"
                    }`}
            >
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        {/* Logo */}
                        <a
                            href="#"
                            className="flex items-center gap-2 text-xl font-bold"
                        >
                            <div className="relative w-8 h-8 overflow-hidden rounded-full border border-accent/20">
                                <Image
                                    src="/icon.png"
                                    alt="Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                                YG
                            </span>
                        </a>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => handleNavClick(link.href)}
                                    className="text-foreground-secondary hover:text-accent transition-colors duration-200 text-sm"
                                >
                                    {link.name}
                                </button>
                            ))}
                            <a
                                href={personalInfo.resumeUrl}
                                download
                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all duration-200 text-sm"
                            >
                                <Download size={16} />
                                Resume
                            </a>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-foreground-secondary hover:text-accent transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 pt-16 glass md:hidden"
                    >
                        <div className="flex flex-col items-center gap-6 py-8">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => handleNavClick(link.href)}
                                    className="text-foreground-secondary hover:text-accent transition-colors duration-200 text-lg"
                                >
                                    {link.name}
                                </button>
                            ))}
                            <a
                                href={personalInfo.resumeUrl}
                                download
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all duration-200"
                            >
                                <Download size={18} />
                                Download Resume
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
