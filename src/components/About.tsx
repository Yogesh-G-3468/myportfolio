"use client";

import { motion } from "framer-motion";
import { MapPin, Briefcase, Sparkles } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { aboutText, personalInfo } from "@/lib/data";

export default function About() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 },
    };

    return (
        <SectionWrapper
            id="about"
            title="About Me"
            subtitle="Passionate about building impactful software solutions"
        >
            <div className="grid md:grid-cols-2 gap-12 items-center">
                {/* Bio */}
                <div className="space-y-6">
                    <p className="text-lg text-foreground-secondary leading-relaxed">
                        {aboutText.bio}
                    </p>

                    <motion.ul
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="space-y-4"
                    >
                        {aboutText.highlights.map((highlight, index) => (
                            <motion.li
                                key={index}
                                variants={itemVariants}
                                className="flex items-start gap-3"
                            >
                                <Sparkles className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                                <span className="text-foreground-secondary">{highlight}</span>
                            </motion.li>
                        ))}
                    </motion.ul>
                </div>

                {/* Info Cards */}
                <div className="space-y-4">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-6 rounded-2xl bg-background-elevated border border-border"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-accent/10">
                                <Briefcase className="w-6 h-6 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm text-foreground-secondary">Experience</p>
                                <p className="text-lg font-semibold">2+ Years at JMAN Group</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-6 rounded-2xl bg-background-elevated border border-border"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-accent-secondary/10">
                                <MapPin className="w-6 h-6 text-accent-secondary" />
                            </div>
                            <div>
                                <p className="text-sm text-foreground-secondary">Location</p>
                                <p className="text-lg font-semibold">{personalInfo.location}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-accent-secondary/5 border border-accent/20"
                    >
                        <p className="text-sm text-foreground-secondary mb-2">Current Focus</p>
                        <p className="text-foreground">
                            Building scalable AI-powered applications and data pipelines that
                            drive real business impact.
                        </p>
                    </motion.div>
                </div>
            </div>
        </SectionWrapper>
    );
}
