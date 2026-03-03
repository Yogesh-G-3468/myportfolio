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

                <div className="space-y-8 pl-8">
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

                            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                                <div>
                                    <h3 className="text-foreground font-medium text-base">
                                        {exp.title}
                                    </h3>
                                    <p className="text-accent text-sm">
                                        {exp.company}
                                    </p>
                                </div>
                                <span className="text-muted-foreground text-xs tracking-wide shrink-0">
                                    {exp.period}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
