"use client";

import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { aboutText } from "@/lib/data";

export default function About() {
    return (
        <SectionWrapper id="about" title="About">
            <div className="space-y-6">
                <p className="text-foreground-secondary text-lg leading-relaxed">
                    {aboutText.bio}
                </p>

                <div className="grid sm:grid-cols-3 gap-4 pt-2">
                    {aboutText.highlights.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 rounded-xl bg-background-elevated border border-border"
                        >
                            <p className="text-foreground-secondary text-sm leading-relaxed">
                                {item}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
