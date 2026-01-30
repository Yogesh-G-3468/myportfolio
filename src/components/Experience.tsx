"use client";

import { motion } from "framer-motion";
import { Briefcase, CheckCircle2 } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { experience } from "@/lib/data";

export default function Experience() {
    return (
        <SectionWrapper
            id="experience"
            title="Experience"
            subtitle="My professional journey"
            className="bg-background-elevated/30"
        >
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 md:left-1/2 md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent via-accent-secondary to-transparent" />

                <div className="space-y-12">
                    {experience.map((exp, index) => (
                        <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className={`relative flex flex-col md:flex-row gap-8 ${index % 2 === 0 ? "md:flex-row-reverse" : ""
                                }`}
                        >
                            {/* Timeline dot */}
                            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent border-4 border-background z-10" />

                            {/* Content */}
                            <div className={`flex-1 ml-12 md:ml-0 ${index % 2 === 0 ? "md:pr-16" : "md:pl-16"}`}>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="p-6 rounded-2xl bg-background-elevated border border-border hover:border-accent/30 transition-all duration-300"
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-semibold text-foreground">
                                                {exp.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-accent mt-1">
                                                <Briefcase size={16} />
                                                <span className="text-sm">{exp.company}</span>
                                            </div>
                                        </div>
                                        <span className="text-sm text-foreground-secondary whitespace-nowrap">
                                            {exp.period}
                                        </span>
                                    </div>

                                    {/* Achievements */}
                                    <ul className="space-y-3">
                                        {exp.achievements.map((achievement, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-accent-secondary flex-shrink-0 mt-0.5" />
                                                <span className="text-foreground-secondary text-sm">
                                                    {achievement}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            </div>

                            {/* Spacer for alternating layout */}
                            <div className="hidden md:block flex-1" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
