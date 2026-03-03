"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Star } from "lucide-react";
import SectionWrapper from "./SectionWrapper";

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

    return (
        <SectionWrapper
            id="projects"
            title="Projects"
            subtitle="Public repositories from GitHub"
        >
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
        </SectionWrapper>
    );
}
