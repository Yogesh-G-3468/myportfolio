"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Star, Code2, Server, Bot, Layers, Sparkles } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { featuredProjects } from "@/lib/data";

interface Repo {
    name: string;
    description: string | null;
    url: string;
    language: string | null;
    stars: number;
    updatedAt: string;
    topics: string[];
}

const languageColors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f1e05a",
    Python: "#3572A5",
    Java: "#b07219",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Shell: "#89e051",
    Rust: "#dea584",
    Go: "#00ADD8",
    "Jupyter Notebook": "#DA5B0B",
    C: "#555555",
    "C++": "#f34b7d",
};

export default function Projects() {
    const [repos, setRepos] = useState<Repo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTab, setActiveTab] = useState<"featured" | "github">("featured");

    useEffect(() => {
        fetch("/api/github")
            .then((res) => {
                if (!res.ok) throw new Error("Failed");
                return res.json();
            })
            .then((data) => {
                setRepos(data);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
            });
    }, []);

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "Full-Stack":
                return <Server size={14} className="text-accent" />;
            case "Data Engineering":
                return <Layers size={14} className="text-emerald-500" />;
            case "AI & GenAI":
                return <Bot size={14} className="text-amber-500" />;
            default:
                return <Code2 size={14} className="text-accent-secondary" />;
        }
    };

    return (
        <SectionWrapper
            id="projects"
            title="Projects"
            subtitle="Data engineering pipelines, full-stack applications & open source software"
        >
            {/* Filter Tabs */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex p-1 bg-muted rounded-xl border border-border">
                    <button
                        onClick={() => setActiveTab("featured")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === "featured"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-foreground-secondary hover:text-foreground"
                        }`}
                    >
                        <Sparkles size={13} className="text-accent" />
                        Featured Projects ({featuredProjects.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("github")}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                            activeTab === "github"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-foreground-secondary hover:text-foreground"
                        }`}
                    >
                        <Code2 size={13} />
                        GitHub Repositories
                    </button>
                </div>
            </div>

            {/* Featured Projects View */}
            {activeTab === "featured" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredProjects.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className="group flex flex-col p-6 rounded-2xl border border-border bg-background-elevated hover:border-accent/40 transition-all duration-200 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-2 mb-3">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold bg-muted text-foreground-secondary uppercase tracking-wider border border-border/60">
                                    {getCategoryIcon(project.category)}
                                    {project.category}
                                </span>
                                {project.stats && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                        {project.stats}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-foreground font-bold text-base sm:text-lg group-hover:text-accent transition-colors mb-2">
                                {project.title}
                            </h3>

                            <ul className="space-y-2 mb-4 flex-1">
                                {project.bullets.map((bullet, idx) => (
                                    <li key={idx} className="text-foreground-secondary text-xs sm:text-sm leading-relaxed flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-accent/60 shrink-0 mt-2" />
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border/60 mt-auto">
                                {project.tech.map((t) => (
                                    <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted/80 text-foreground-secondary">
                                        {t}
                                    </span>
                                ))}
                            </div>

                            {project.github && (
                                <div className="mt-3 pt-2">
                                    <a
                                        href={project.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                                    >
                                        View Code on GitHub
                                        <ExternalLink size={12} />
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* GitHub Repos View */}
            {activeTab === "github" && (
                <>
                    {loading && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="p-5 rounded-xl border border-border bg-background-elevated"
                                >
                                    <div className="h-4 bg-muted rounded w-2/5 mb-3 animate-pulse" />
                                    <div className="h-3 bg-muted rounded w-4/5 mb-2 animate-pulse" />
                                    <div className="h-3 bg-muted rounded w-1/3 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="text-center py-12">
                            <p className="text-foreground-secondary mb-3">
                                Couldn&apos;t load repositories right now.
                            </p>
                            <a
                                href="https://github.com/Yogesh-G-3468"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-accent hover:underline underline-offset-2 text-sm font-medium"
                            >
                                View on GitHub
                                <ExternalLink size={14} />
                            </a>
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {repos.map((repo, i) => (
                                <motion.a
                                    key={repo.name}
                                    href={repo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    initial={{ opacity: 0, y: 12 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05 }}
                                    className="group block p-5 rounded-xl border border-border bg-background-elevated hover:border-accent/40 hover:shadow-sm transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-foreground font-medium text-sm group-hover:text-accent transition-colors truncate">
                                            {repo.name}
                                        </h3>
                                        <ExternalLink
                                            size={13}
                                            className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5"
                                        />
                                    </div>
                                    {repo.description && (
                                        <p className="text-foreground-secondary text-xs leading-relaxed mb-3 line-clamp-2">
                                            {repo.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-4 mt-auto">
                                        {repo.language && (
                                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <span
                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    style={{
                                                        backgroundColor:
                                                            languageColors[repo.language] || "#888",
                                                    }}
                                                />
                                                {repo.language}
                                            </span>
                                        )}
                                        {repo.stars > 0 && (
                                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Star size={11} />
                                                {repo.stars}
                                            </span>
                                        )}
                                    </div>
                                </motion.a>
                            ))}
                        </div>
                    )}
                </>
            )}
        </SectionWrapper>
    );
}
