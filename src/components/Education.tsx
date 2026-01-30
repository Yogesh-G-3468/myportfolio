"use client";

import { motion } from "framer-motion";
import { GraduationCap, Award } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { education } from "@/lib/data";

export default function Education() {
    return (
        <SectionWrapper
            id="education"
            title="Education"
            subtitle="My academic background"
        >
            <div className="max-w-2xl mx-auto">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-8 rounded-2xl bg-background-elevated border border-border hover:border-accent/30 transition-all duration-300"
                >
                    <div className="flex items-start gap-6">
                        {/* Icon/Logo placeholder */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-secondary/20 flex items-center justify-center border border-accent/30">
                            <GraduationCap className="w-8 h-8 text-accent" />
                        </div>

                        <div className="flex-1">
                            {/* Degree */}
                            <h3 className="text-xl font-semibold text-foreground mb-1">
                                {education.degree}
                            </h3>

                            {/* Institution */}
                            <p className="text-accent mb-2">{education.institution}</p>

                            {/* Period */}
                            <p className="text-sm text-foreground-secondary mb-4">
                                {education.period}
                            </p>

                            {/* CGPA */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-secondary/10 border border-accent-secondary/30">
                                <Award className="w-4 h-4 text-accent-secondary" />
                                <span className="text-sm font-medium text-accent-secondary">
                                    CGPA: {education.cgpa}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </SectionWrapper>
    );
}
