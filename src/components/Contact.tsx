"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Linkedin, Github } from "lucide-react";
import SectionWrapper from "./SectionWrapper";
import { personalInfo } from "@/lib/data";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Create mailto link with form data
        const subject = encodeURIComponent(`Contact from ${formData.name}`);
        const body = encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        );
        window.location.href = `mailto:${personalInfo.email}?subject=${subject}&body=${body}`;
    };

    return (
        <SectionWrapper
            id="contact"
            title="Get In Touch"
            subtitle="Let's build something amazing together"
            className="bg-background-elevated/30"
        >
            <div className="grid md:grid-cols-2 gap-12">
                {/* Contact Info */}
                <div className="space-y-6">
                    <p className="text-foreground-secondary text-lg">
                        I&apos;m always open to discussing new projects, creative ideas, or
                        opportunities to be part of your vision.
                    </p>

                    <div className="space-y-4">
                        <motion.a
                            href={`mailto:${personalInfo.email}`}
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-accent/50 transition-all group"
                        >
                            <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                                <Mail className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm text-foreground-secondary">Email</p>
                                <p className="text-foreground">{personalInfo.email}</p>
                            </div>
                        </motion.a>

                        <motion.a
                            href={`tel:${personalInfo.phone}`}
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border hover:border-accent/50 transition-all group"
                        >
                            <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                                <Phone className="w-5 h-5 text-accent" />
                            </div>
                            <div>
                                <p className="text-sm text-foreground-secondary">Phone</p>
                                <p className="text-foreground">{personalInfo.phone}</p>
                            </div>
                        </motion.a>

                        <motion.div
                            whileHover={{ x: 5 }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-background border border-border"
                        >
                            <div className="p-3 rounded-lg bg-accent-secondary/10">
                                <MapPin className="w-5 h-5 text-accent-secondary" />
                            </div>
                            <div>
                                <p className="text-sm text-foreground-secondary">Location</p>
                                <p className="text-foreground">{personalInfo.location}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-4 pt-4">
                        <a
                            href={personalInfo.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-background border border-border text-foreground-secondary hover:text-accent hover:border-accent transition-all"
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={24} />
                        </a>
                        <a
                            href={personalInfo.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-xl bg-background border border-border text-foreground-secondary hover:text-accent hover:border-accent transition-all"
                            aria-label="GitHub"
                        >
                            <Github size={24} />
                        </a>
                    </div>
                </div>

                {/* Contact Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm text-foreground-secondary mb-2"
                        >
                            Your Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            required
                            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-secondary/50 focus:outline-none focus:border-accent transition-colors"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm text-foreground-secondary mb-2"
                        >
                            Your Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            required
                            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-secondary/50 focus:outline-none focus:border-accent transition-colors"
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="message"
                            className="block text-sm text-foreground-secondary mb-2"
                        >
                            Message
                        </label>
                        <textarea
                            id="message"
                            rows={5}
                            value={formData.message}
                            onChange={(e) =>
                                setFormData({ ...formData, message: e.target.value })
                            }
                            required
                            className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-foreground-secondary/50 focus:outline-none focus:border-accent transition-colors resize-none"
                            placeholder="Tell me about your project..."
                        />
                    </div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-secondary text-background font-medium hover:shadow-lg hover:shadow-accent/25 transition-all"
                    >
                        <Send size={18} />
                        Send Message
                    </motion.button>
                </form>
            </div>
        </SectionWrapper>
    );
}
