"use client";

import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { skills } from "@/lib/data";

export default function Skills() {
    return (
        <SectionWrapper id="skills" title="Skills" subtitle="Technologies I work with regularly">
            <div className="flex flex-wrap gap-2.5">
                {skills.map((skill, i) => (
                    <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.03 }}
                        className="px-4 py-2 text-sm rounded-full border border-border bg-background-elevated text-foreground-secondary hover:text-accent hover:border-accent/40 hover:bg-accent-light transition-all duration-200 cursor-default"
                    >
                        {skill}
                    </motion.span>
                ))}
            </div>
        </SectionWrapper>
    );
}
