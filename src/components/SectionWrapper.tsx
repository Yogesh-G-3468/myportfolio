"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ReactNode } from "react";

interface SectionWrapperProps {
    children: ReactNode;
    id: string;
    className?: string;
    title?: string;
    subtitle?: string;
}

export default function SectionWrapper({
    children,
    id,
    className = "",
    title,
    subtitle,
}: SectionWrapperProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section
            id={id}
            ref={ref}
            className={`py-20 sm:py-28 px-4 sm:px-6 lg:px-8 ${className}`}
        >
            <div className="max-w-6xl mx-auto">
                {title && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            <span className="bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
                                {title}
                            </span>
                        </h2>
                        {subtitle && (
                            <p className="text-foreground-secondary max-w-2xl mx-auto">
                                {subtitle}
                            </p>
                        )}
                    </motion.div>
                )}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {children}
                </motion.div>
            </div>
        </section>
    );
}
