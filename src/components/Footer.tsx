"use client";

import { Github, Linkedin, Mail, Heart } from "lucide-react";
import { personalInfo } from "@/lib/data";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-8 px-4 border-t border-border">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Copyright */}
                <p className="text-foreground-secondary text-sm flex items-center gap-1">
                    © {currentYear} {personalInfo.name}. Made with{" "}
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in Chennai
                </p>

                {/* Social Links */}
                <div className="flex items-center gap-4">
                    <a
                        href={personalInfo.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground-secondary hover:text-accent transition-colors"
                        aria-label="LinkedIn"
                    >
                        <Linkedin size={20} />
                    </a>
                    <a
                        href={personalInfo.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground-secondary hover:text-accent transition-colors"
                        aria-label="GitHub"
                    >
                        <Github size={20} />
                    </a>
                    <a
                        href={`mailto:${personalInfo.email}`}
                        className="text-foreground-secondary hover:text-accent transition-colors"
                        aria-label="Email"
                    >
                        <Mail size={20} />
                    </a>
                </div>
            </div>
        </footer>
    );
}
