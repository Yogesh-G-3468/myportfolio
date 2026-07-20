"use client";

import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { experience } from "@/lib/data";

export default function Experience() {
    return (
        <SectionWrapper id="experience" title="Experience" subtitle="Where I've worked">
            <div className="relative">
                {/* Vertical timeline line */}
                <div className="absolute left-0 top-2 bottom-2 w-px bg-border" />

                <div className="space-y-10 pl-8">
                    {experience.map((exp, index) => (
                        <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="relative"
                        >
                            {/* Timeline dot */}
                            <div className="absolute -left-8 top-1.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-background" />

                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
                                <div>
                                    <h3 className="text-foreground font-semibold text-base sm:text-lg">
                                        {exp.title}
                                    </h3>
                                    <p className="text-accent text-sm font-medium">
                                        {exp.company}
                                    </p>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted border border-border text-foreground-secondary tracking-wide shrink-0">
                                    {exp.period}
                                </span>
                            </div>

                            {exp.bullets && exp.bullets.length > 0 && (
                                <ul className="space-y-2 mt-2">
                                    {exp.bullets.map((bullet, i) => (
                                        <li key={i} className="text-foreground-secondary text-xs sm:text-sm leading-relaxed flex items-start gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-accent/70 shrink-0 mt-2" />
                                            <span>{bullet}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
