"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Check, Square, CheckSquare, Menu, X, BookOpen, Trophy } from "lucide-react";
import metadata from "@/content/dsa/metadata.json";

interface PatternMeta {
    slug: string;
    title: string;
    patternNum: number | null;
    filePath: string;
}

export default function DsaSidebar() {
    const pathname = usePathname();
    const [searchTerm, setSearchTerm] = useState("");
    const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Get active slug from pathname (e.g., "/dsa/pattern-01-sliding-window" -> "pattern-01-sliding-window")
    const activeSlug = pathname.split("/").pop() || "overview";

    useEffect(() => {
        setIsMounted(true);
        const loadProgress = () => {
            try {
                const saved = localStorage.getItem("dsa-completed-patterns");
                if (saved) {
                    setCompletedSlugs(JSON.parse(saved));
                }
            } catch (e) {
                console.error("Failed to load completed DSA patterns from localStorage:", e);
            }
        };

        loadProgress();
        window.addEventListener("dsa-progress-update", loadProgress);
        return () => window.removeEventListener("dsa-progress-update", loadProgress);
    }, []);

    const toggleCompleted = (slug: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Avoid triggering the Link click
        e.preventDefault();

        const updated = completedSlugs.includes(slug)
            ? completedSlugs.filter((s) => s !== slug)
            : [...completedSlugs, slug];

        setCompletedSlugs(updated);
        try {
            localStorage.setItem("dsa-completed-patterns", JSON.stringify(updated));
            window.dispatchEvent(new Event("dsa-progress-update"));
        } catch (err) {
            console.error("Failed to save progress:", err);
        }
    };

    // Filter patterns
    const filteredPatterns = metadata.filter((pattern) => {
        if (pattern.slug === "overview") return false; // Handled separately
        return pattern.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               (pattern.patternNum && `pattern ${pattern.patternNum}`.includes(searchTerm.toLowerCase()));
    });

    const overviewItem = metadata.find((p) => p.slug === "overview") as PatternMeta | undefined;
    const allPatterns = metadata.filter((p) => p.slug !== "overview") as PatternMeta[];

    const completedCount = allPatterns.filter((p) => completedSlugs.includes(p.slug)).length;
    const totalCount = allPatterns.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const sidebarContent = (
        <div className="flex flex-col h-full bg-background-elevated/70 backdrop-blur-md border-r border-border p-5">
            {/* Header / Intro */}
            <div className="mb-6">
                <Link
                    href="/dsa/overview"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex items-center gap-2 font-[family-name:var(--font-instrument-serif)] text-2xl text-foreground hover:text-accent transition-colors"
                >
                    <BookOpen className="w-5 h-5 text-accent" />
                    dsa patterns
                </Link>
                <p className="text-xs text-foreground-secondary mt-1">
                    Study guide for coding interviews
                </p>
            </div>

            {/* Progress Panel */}
            {isMounted && totalCount > 0 && (
                <div className="mb-6 p-4 rounded-2xl bg-background border border-border/80 shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-foreground-secondary flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-accent" />
                            Your Progress
                        </span>
                        <span className="text-xs font-bold text-accent">
                            {completedCount}/{totalCount} ({progressPercent}%)
                        </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-500 ease-out"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Search Input */}
            <div className="relative mb-5">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search pattern..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm bg-background/50 hover:bg-background border border-border focus:border-accent rounded-xl outline-none transition-all"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[calc(100vh-280px)] scrollbar-thin">
                {/* Overview Link */}
                {overviewItem && !searchTerm && (
                    <Link
                        href={`/dsa/${overviewItem.slug}`}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeSlug === overviewItem.slug
                                ? "bg-accent/10 text-accent border border-accent/20"
                                : "text-foreground-secondary hover:text-foreground hover:bg-muted/50 border border-transparent"
                        }`}
                    >
                        <BookOpen className="w-4 h-4 shrink-0" />
                        <span>{overviewItem.title}</span>
                    </Link>
                )}

                {/* Divider */}
                {overviewItem && !searchTerm && <hr className="border-border/60 my-2" />}

                {/* Patterns Link List */}
                <div className="space-y-1">
                    {filteredPatterns.map((pattern) => {
                        const isCompleted = completedSlugs.includes(pattern.slug);
                        const isActive = activeSlug === pattern.slug;

                        return (
                            <Link
                                key={pattern.slug}
                                href={`/dsa/${pattern.slug}`}
                                onClick={() => setIsMobileOpen(false)}
                                className={`group flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                    isActive
                                        ? "bg-accent/10 text-accent border-accent/20"
                                        : "text-foreground-secondary hover:text-foreground hover:bg-muted/50 border-transparent"
                                }`}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Completion Checkbox */}
                                    <button
                                        onClick={(e) => toggleCompleted(pattern.slug, e)}
                                        className="text-muted-foreground hover:text-accent shrink-0 transition-colors"
                                        aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                                    >
                                        {isCompleted ? (
                                            <CheckSquare className="w-4.5 h-4.5 text-accent shrink-0" />
                                        ) : (
                                            <Square className="w-4.5 h-4.5 shrink-0 opacity-70 group-hover:opacity-100" />
                                        )}
                                    </button>
                                    <span className="truncate">
                                        {pattern.patternNum !== null && (
                                            <span className="opacity-60 text-xs mr-1 font-mono font-bold">
                                                {String(pattern.patternNum).padStart(2, "0")}.
                                            </span>
                                        )}
                                        {pattern.title}
                                    </span>
                                </div>
                                {isCompleted && !isActive && (
                                    <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                                )}
                            </Link>
                        );
                    })}

                    {filteredPatterns.length === 0 && (
                        <div className="text-center py-8 text-xs text-muted-foreground">
                            No patterns found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar (Left side, sticky) */}
            <aside className="hidden lg:block w-72 shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-20">
                {sidebarContent}
            </aside>

            {/* Mobile Nav Bar */}
            <div className="lg:hidden fixed bottom-4 right-4 z-40">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white shadow-xl hover:bg-accent/90 transition-all border border-white/10"
                    aria-label="Toggle DSA Menu"
                >
                    {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Slide-over Drawer */}
            {isMobileOpen && (
                <div className="lg:hidden fixed inset-0 z-30 flex">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <div className="relative w-80 max-w-full bg-background h-full flex flex-col shadow-2xl animate-slide-in">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
}
