"use client";

import { useEffect, useState } from "react";
import { AlignLeft, ArrowUp, Hash, Check } from "lucide-react";

interface HeadingItem {
  level: number;
  text: string;
  id: string;
}

interface TOCProps {
  headings: HeadingItem[];
}

export default function TableOfContents({ headings }: TOCProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -75% 0px" }
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  const copyHeadingLink = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block w-64 shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto pl-4 border-l border-border/50 text-xs">
      <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-border/40 font-bold uppercase tracking-wider text-[11px] text-muted-foreground">
        <AlignLeft className="w-3.5 h-3.5 text-accent" />
        <span>On This Page</span>
      </div>

      <div className="space-y-1">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          const isH3 = h.level === 3;

          return (
            <div
              key={h.id}
              className={`group flex items-center justify-between gap-1 py-1 rounded-md transition-all ${
                isH3 ? "pl-3 text-[11px]" : "pl-1 text-xs"
              } ${
                isActive
                  ? "text-accent font-semibold"
                  : "text-foreground-secondary hover:text-foreground"
              }`}
            >
              <a
                href={`#${h.id}`}
                className="truncate block flex-1"
                title={h.text}
              >
                {h.text}
              </a>

              <button
                type="button"
                onClick={(e) => copyHeadingLink(e, h.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-accent transition-opacity shrink-0"
                title="Copy link to heading"
                aria-label={`Copy link to ${h.text}`}
              >
                {copiedId === h.id ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Hash className="w-3 h-3 opacity-60" />
                )}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 pt-4 border-t border-border/40">
        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 text-[11px] font-medium text-foreground-secondary hover:text-accent transition-colors"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Back to Top</span>
        </button>
      </div>
    </nav>
  );
}
