"use client";

import { personalInfo } from "@/lib/data";
import { Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";

export default function Contact() {
    return (
        <section id="contact" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h2 className="font-[family-name:var(--font-instrument-serif)] text-3xl sm:text-4xl text-foreground mb-2">
                    Get in touch
                </h2>
                <div className="w-12 h-0.5 bg-accent rounded-full mb-6" />
                <p className="text-foreground-secondary text-lg mb-8 max-w-lg leading-relaxed">
                    Always happy to chat about new projects, ideas, or opportunities.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                    <a
                        href={`mailto:${personalInfo.email}`}
                        className="group inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-background-elevated hover:border-accent/40 transition-all"
                    >
                        <Mail size={18} className="text-accent" />
                        <span className="text-foreground text-sm">{personalInfo.email}</span>
                        <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-accent transition-colors ml-auto" />
                    </a>
                    <a
                        href={personalInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-background-elevated hover:border-accent/40 transition-all"
                    >
                        <Linkedin size={18} className="text-accent" />
                        <span className="text-foreground text-sm">LinkedIn</span>
                        <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-accent transition-colors ml-auto" />
                    </a>
                    <a
                        href={personalInfo.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center gap-3 px-5 py-3 rounded-xl border border-border bg-background-elevated hover:border-accent/40 transition-all"
                    >
                        <Github size={18} className="text-accent" />
                        <span className="text-foreground text-sm">GitHub</span>
                        <ArrowUpRight size={14} className="text-muted-foreground group-hover:text-accent transition-colors ml-auto" />
                    </a>
                </div>
            </div>
        </section>
    );
}
