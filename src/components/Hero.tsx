"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ArrowDown, Download } from "lucide-react";
import { personalInfo } from "@/lib/data";

export default function Hero() {
    const scrollToProjects = () => {
        const element = document.querySelector("#projects");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-mesh"
        >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/10 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Name */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-foreground via-accent to-accent-secondary bg-clip-text text-transparent">
                            {personalInfo.name}
                        </span>
                    </h1>
                </motion.div>

                {/* Tagline */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-lg sm:text-xl text-accent mb-6"
                >
                    {personalInfo.tagline}
                </motion.p>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-base sm:text-lg text-foreground-secondary max-w-2xl mx-auto mb-8"
                >
                    {personalInfo.description}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
                >
                    <button
                        onClick={scrollToProjects}
                        className="group px-8 py-3 rounded-full bg-gradient-to-r from-accent to-accent-secondary text-background font-medium transition-all duration-300 hover:shadow-lg hover:shadow-accent/25 hover:scale-105"
                    >
                        View Projects
                    </button>
                    <a
                        href={personalInfo.resumeUrl}
                        download
                        className="flex items-center gap-2 px-8 py-3 rounded-full border border-border text-foreground hover:border-accent hover:text-accent transition-all duration-300"
                    >
                        <Download size={18} />
                        Download Resume
                    </a>
                </motion.div>

                {/* Social Links */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="flex items-center justify-center gap-6"
                >
                    <a
                        href={personalInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-background-elevated border border-border text-foreground-secondary hover:text-accent hover:border-accent transition-all duration-300 hover:scale-110"
                        aria-label="LinkedIn"
                    >
                        <Linkedin size={20} />
                    </a>
                    <a
                        href={personalInfo.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-full bg-background-elevated border border-border text-foreground-secondary hover:text-accent hover:border-accent transition-all duration-300 hover:scale-110"
                        aria-label="GitHub"
                    >
                        <Github size={20} />
                    </a>
                    <a
                        href={`mailto:${personalInfo.email}`}
                        className="p-3 rounded-full bg-background-elevated border border-border text-foreground-secondary hover:text-accent hover:border-accent transition-all duration-300 hover:scale-110"
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
                transition={{ duration: 1, delay: 1 }}
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-foreground-secondary cursor-pointer"
                    onClick={() => {
                        const element = document.querySelector("#about");
                        if (element) element.scrollIntoView({ behavior: "smooth" });
                    }}
                >
                    <ArrowDown size={24} />
                </motion.div>
            </motion.div>
        </section>
    );
}
