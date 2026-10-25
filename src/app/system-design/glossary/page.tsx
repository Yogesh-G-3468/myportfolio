"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Bookmark, Search, ChevronRight, Tag, ArrowRight } from "lucide-react";
import { GLOSSARY_TERMS } from "@/lib/system-design/glossaryData";

export default function GlossaryPage() {
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const letters = ["ALL", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

  const categories = useMemo(() => {
    const cats = new Set(GLOSSARY_TERMS.map((t) => t.category));
    return ["ALL", ...Array.from(cats).sort()];
  }, []);

  const filteredTerms = useMemo(() => {
    return GLOSSARY_TERMS.filter((t) => {
      const matchLetter =
        selectedLetter === "ALL" ||
        t.term.toUpperCase().startsWith(selectedLetter) ||
        (selectedLetter === "A" && /^[0-9]/.test(t.term)); // group numbers with A
      const matchCat = selectedCategory === "ALL" || t.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);

      return matchLetter && matchCat && matchSearch;
    });
  }, [search, selectedLetter, selectedCategory]);

  return (
    <div className="w-full max-w-[1000px] mx-auto py-4 px-2 sm:px-6 space-y-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground-secondary bg-background-elevated/40 border border-border/50 py-1.5 px-4 rounded-full w-fit backdrop-blur-sm">
        <Link href="/" className="hover:text-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 opacity-60" />
        <Link href="/system-design" className="hover:text-accent transition-colors">
          System Design Hub
        </Link>
        <ChevronRight className="w-3 h-3 opacity-60" />
        <span className="text-foreground">Architecture Glossary</span>
      </div>

      {/* Header */}
      <div className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
          <Bookmark className="w-3.5 h-3.5" />
          <span>A–Z Architectural Vocabulary</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          System Design Master Glossary
        </h1>

        <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed max-w-3xl">
          Rigorously defined terms, mental models, consensus algorithms, and formulas. Use this dictionary to master interview terminology and avoid imprecise buzzwords.
        </p>

        {/* Search input */}
        <div className="relative pt-2 max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms, formulas, or acronyms (e.g. Raft, WAL, PagedAttention)..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-accent shadow-sm"
          />
        </div>
      </div>

      {/* Letter filter bar */}
      <div className="flex flex-wrap gap-1 p-2 rounded-2xl border border-border/80 bg-background-elevated/40 text-xs font-mono justify-center">
        {letters.map((ltr) => (
          <button
            key={ltr}
            onClick={() => setSelectedLetter(ltr)}
            className={`w-7 h-7 rounded-lg font-bold transition-all ${
              selectedLetter === ltr
                ? "bg-accent text-white"
                : "hover:bg-muted text-foreground-secondary hover:text-foreground"
            }`}
          >
            {ltr}
          </button>
        ))}
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap gap-2 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full font-medium transition-all ${
              selectedCategory === cat
                ? "bg-accent/15 text-accent border border-accent/30 font-semibold"
                : "bg-background-elevated border border-border hover:bg-muted text-foreground-secondary"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Terms grid */}
      <div className="space-y-4">
        {filteredTerms.length === 0 ? (
          <div className="p-12 text-center text-foreground-secondary text-sm rounded-3xl border border-dashed border-border">
            No glossary terms match your current filters.
          </div>
        ) : (
          filteredTerms.map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-border bg-background-elevated shadow-sm hover:border-accent/40 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-foreground font-mono">
                  {t.term}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {t.category}
                  </span>
                  {t.relatedModule && (
                    <Link
                      href={`/system-design/${t.relatedModule}`}
                      className="text-[11px] font-semibold text-accent hover:underline flex items-center gap-0.5"
                    >
                      <span>Module</span>
                      <ArrowRight size={11} />
                    </Link>
                  )}
                </div>
              </div>

              <p className="text-sm text-foreground-secondary leading-relaxed">
                {t.definition}
              </p>

              {t.formula && (
                <div className="p-2.5 rounded-xl border border-border/60 bg-background/50 font-mono text-xs text-accent">
                  Formula: {t.formula}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
