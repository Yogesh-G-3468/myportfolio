"use client";

import { Github, Linkedin, Mail } from "lucide-react";
import { personalInfo } from "@/lib/data";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-8 px-4 border-t border-border">
            <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-foreground-secondary text-xs">
                    © {currentYear} {personalInfo.name}
                </p>
                <div className="flex items-center gap-4">
                    <a
                        href={personalInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground-secondary hover:text-foreground transition-colors"
                        aria-label="LinkedIn"
                    >
                        <Linkedin size={16} />
                    </a>
                    <a
                        href={personalInfo.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground-secondary hover:text-foreground transition-colors"
                        aria-label="GitHub"
                    >
                        <Github size={16} />
                    </a>
                    <a
                        href={`mailto:${personalInfo.email}`}
                        className="text-foreground-secondary hover:text-foreground transition-colors"
                        aria-label="Email"
                    >
                        <Mail size={16} />
                    </a>
                </div>
            </div>
        </footer>
    );
}
