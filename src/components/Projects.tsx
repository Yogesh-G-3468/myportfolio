"use client";

import { motion } from "framer-motion";
import { ExternalLink, TrendingUp } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { projects } from "@/lib/data";

const categoryColors: Record<string, string> = {
    "AI/ML": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    "Full-Stack": "bg-blue-500/10 text-blue-400 border-blue-500/30",
    Backend: "bg-green-500/10 text-green-400 border-green-500/30",
    "Data Engineering": "bg-purple-500/10 text-purple-400 border-purple-500/30",
    Automation: "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

export default function Projects() {
    return (
        <SectionWrapper
            id="projects"
            title="Featured Projects"
            subtitle="Impactful solutions I've built"
        >
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                        className="group relative p-6 rounded-2xl bg-background-elevated border border-border hover:border-accent/50 transition-all duration-300"
                    >
                        {/* Category Badge */}
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-4 ${categoryColors[project.category] || "bg-accent/10 text-accent border-accent/30"
                                }`}
                        >
                            {project.category}
                        </span>

                        {/* Title */}
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-accent transition-colors">
                            {project.title}
                        </h3>

                        {/* Description */}
                        <p className="text-foreground-secondary text-sm mb-4 line-clamp-3">
                            {project.description}
                        </p>

                        {/* Tech Stack */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {project.tech.map((tech) => (
                                <span
                                    key={tech}
                                    className="px-2 py-1 rounded-md text-xs bg-background border border-border text-foreground-secondary"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>

                        {/* Impact */}
                        <div className="flex items-center gap-2 text-accent-secondary">
                            <TrendingUp size={16} />
                            <span className="text-sm font-medium">{project.impact}</span>
                        </div>

                        {/* Hover overlay with View Details */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-background text-sm font-medium hover:bg-accent/90 transition-colors">
                                View Details
                                <ExternalLink size={14} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </SectionWrapper>
    );
}
