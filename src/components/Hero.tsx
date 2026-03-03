"use client";

import { motion } from "framer-motion";
import { ArrowDown, Download, Github, Linkedin, Mail } from "lucide-react";
import { personalInfo } from "@/lib/data";

export default function Hero() {
    return (
        <section
            id="hero"
            className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative"
        >
            {/* Subtle warm accent glow */}
            <div className="absolute top-1/3 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent-secondary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl mx-auto w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <p className="text-accent text-sm font-medium tracking-wide uppercase mb-4">
                        Software Engineer
                    </p>
                    <h1 className="font-[family-name:var(--font-instrument-serif)] text-5xl sm:text-6xl md:text-8xl text-foreground mb-6 leading-[1.05]">
                        Yogeshwaran <span className="italic text-accent">G</span>
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="text-foreground-secondary text-lg sm:text-xl mb-10 max-w-xl mx-auto leading-relaxed"
                >
                    {personalInfo.description}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center gap-3 mb-12"
                >
                    <a
                        href="#projects"
                        onClick={(e) => {
                            e.preventDefault();
                            document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-sm font-medium hover:bg-accent transition-colors"
                    >
                        View Projects
                    </a>
                    <a
                        href={personalInfo.resumeUrl}
                        download
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-border text-foreground text-sm font-medium hover:border-accent hover:text-accent transition-colors"
                    >
                        <Download size={14} />
                        Resume
                    </a>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.45 }}
                    className="flex items-center justify-center gap-5"
                >
                    <a
                        href={personalInfo.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground-secondary hover:text-accent transition-colors"
                        aria-label="GitHub"
                    >
                        <Github size={20} />
                    </a>
                    <a
                        href={personalInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground-secondary hover:text-accent transition-colors"
                        aria-label="LinkedIn"
                    >
                        <Linkedin size={20} />
                    </a>
                    <a
                        href={`mailto:${personalInfo.email}`}
                        className="text-foreground-secondary hover:text-accent transition-colors"
                        aria-label="Email"
                    >
                        <Mail size={20} />
                    </a>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <motion.button
                    animate={{ y: [0, 6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    onClick={() => document.querySelector("#about")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Scroll down"
                >
                    <ArrowDown size={18} />
                </motion.button>
            </motion.div>
        </section>
    );
}
