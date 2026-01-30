"use client";

import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { skills } from "@/lib/data";

const categoryColors: Record<string, string> = {
    Frontend: "from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400",
    Backend: "from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-400",
    Databases: "from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-400",
    "Cloud & DevOps": "from-orange-500/20 to-amber-500/20 border-orange-500/30 hover:border-orange-400",
    "AI/ML": "from-cyan-500/20 to-teal-500/20 border-cyan-500/30 hover:border-cyan-400",
    Tools: "from-rose-500/20 to-red-500/20 border-rose-500/30 hover:border-rose-400",
};

const categoryTextColors: Record<string, string> = {
    Frontend: "text-blue-400",
    Backend: "text-green-400",
    Databases: "text-purple-400",
    "Cloud & DevOps": "text-orange-400",
    "AI/ML": "text-cyan-400",
    Tools: "text-rose-400",
};

export default function Skills() {
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
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
    };

    return (
        <SectionWrapper
            id="skills"
            title="Technical Skills"
            subtitle="Technologies and tools I work with"
            className="bg-background-elevated/30"
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-8"
            >
                {Object.entries(skills).map(([category, skillList]) => (
                    <motion.div key={category} variants={itemVariants}>
                        <h3 className={`text-lg font-semibold mb-4 ${categoryTextColors[category]}`}>
                            {category}
                        </h3>
                        <div className="flex flex-wrap gap-3">
                            {skillList.map((skill, index) => (
                                <motion.span
                                    key={skill}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${categoryColors[category]} border transition-all duration-300 cursor-default`}
                                >
                                    {skill}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </SectionWrapper>
    );
}
