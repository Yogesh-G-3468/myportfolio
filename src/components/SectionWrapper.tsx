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
    const isInView = useInView(ref, { once: true, margin: "-80px" });

    return (
        <section
            id={id}
            ref={ref}
            className={`py-20 sm:py-28 px-4 sm:px-6 lg:px-8 ${className}`}
        >
            <div className="max-w-3xl mx-auto">
                {title && (
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                        transition={{ duration: 0.5 }}
                        className="mb-10"
                    >
                        <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl sm:text-4xl text-foreground mb-2">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-foreground-secondary text-sm">
                                {subtitle}
                            </p>
                        )}
                        <div className="mt-3 w-12 h-0.5 bg-accent rounded-full" />
                    </motion.div>
                )}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    {children}
                </motion.div>
            </div>
        </section>
    );
}
