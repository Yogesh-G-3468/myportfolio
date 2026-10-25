"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Sparkles, Filter, FileText, ArrowRight } from "lucide-react";
import { TopicItem } from "@/lib/system-design/schema";

interface SearchModalProps {
  topics: Pick<
    TopicItem,
    "slug" | "moduleSlug" | "moduleTitle" | "title" | "summary" | "type" | "level" | "priority" | "tags"
  >[];
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ topics, isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filteredResults = useMemo(() => {
    if (!query.trim() && selectedType === "all" && selectedLevel === "all") {
      return topics.slice(0, 10);
    }

    const q = query.toLowerCase().trim();

    return topics.filter((t) => {
      const matchType = selectedType === "all" || t.type === selectedType;
      const matchLevel = selectedLevel === "all" || t.level === selectedLevel;

      if (!matchType || !matchLevel) return false;

      if (!q) return true;

      const titleMatch = t.title.toLowerCase().includes(q);
      const summaryMatch = t.summary.toLowerCase().includes(q);
      const tagMatch = t.tags.some((tag) => tag.toLowerCase().includes(q));
      const moduleMatch = t.moduleTitle.toLowerCase().includes(q);

      return titleMatch || summaryMatch || tagMatch || moduleMatch;
    });
  }, [topics, query, selectedType, selectedLevel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-background-elevated border border-border rounded-3xl shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[80vh]">
        {/* Header & Search Input */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="w-5 h-5 text-accent shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, algorithms, case studies, technologies..."
            className="flex-1 bg-transparent border-none outline-none text-foreground text-sm sm:text-base placeholder:text-muted-foreground"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted text-foreground-secondary hover:text-foreground"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-border/50 bg-background/50 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground flex items-center gap-1 font-semibold uppercase text-[10px]">
            <Filter size={11} /> Filters:
          </span>

          {/* Type filters */}
          {["all", "concept", "case-study", "deep-dive", "lld", "technology", "comparison"].map((tp) => (
            <button
              key={tp}
              onClick={() => setSelectedType(tp)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                selectedType === tp
                  ? "bg-accent text-white"
                  : "bg-muted hover:bg-muted/80 text-foreground-secondary"
              }`}
            >
              {tp === "all" ? "All Types" : tp}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredResults.length === 0 ? (
            <div className="py-12 text-center text-foreground-secondary text-sm">
              <p className="font-semibold text-foreground">No matching topics found</p>
              <p className="text-xs text-muted-foreground mt-1">
                Try searching for rate limiting, consistent hashing, raft, or url shortener.
              </p>
            </div>
          ) : (
            filteredResults.map((t) => (
              <Link
                key={`${t.moduleSlug}-${t.slug}`}
                href={`/system-design/${t.moduleSlug}/${t.slug}`}
                onClick={onClose}
                className="group block p-3.5 rounded-2xl border border-border/60 hover:border-accent/40 bg-background/40 hover:bg-muted/40 transition-all text-left"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">
                    {t.moduleTitle}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-muted text-foreground-secondary">
                      {t.type}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {t.level}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-foreground group-hover:text-accent transition-colors">
                  {t.title}
                </h4>

                <p className="text-xs text-foreground-secondary line-clamp-2 mt-1">
                  {t.summary}
                </p>

                {t.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-border bg-background/50 text-[11px] text-foreground-secondary flex items-center justify-between">
          <span>
            Showing <strong className="text-foreground">{filteredResults.length}</strong> results
          </span>
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">
                Esc
              </kbd>{" "}
              to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
