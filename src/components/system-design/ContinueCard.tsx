"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Play } from "lucide-react";

interface LastVisitedInfo {
  title: string;
  moduleTitle: string;
  href: string;
  timestamp: string;
}

export default function ContinueCard() {
  const [lastVisited, setLastVisited] = useState<LastVisitedInfo | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("system_design_last_visited");
      if (stored) {
        setLastVisited(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Could not retrieve last visited topic", e);
    }
  }, []);

  if (!lastVisited) {
    return (
      <div className="rounded-3xl border border-border bg-gradient-to-r from-accent/10 via-background-elevated to-background-elevated p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            Recommended First Step
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Start with Module 01: Foundations & Estimation
          </h3>
          <p className="text-sm text-foreground-secondary max-w-xl">
            Master the 45-minute interview blueprint, core non-functional checklists, and back-of-the-envelope capacity calculations.
          </p>
        </div>
        <Link
          href="/system-design/foundations"
          className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-white font-semibold text-sm hover:opacity-90 shadow-md transition-all"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Begin Course</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-accent/30 bg-accent/5 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-semibold text-accent uppercase tracking-wider">
          <BookOpen className="w-3.5 h-3.5" />
          Continue Where You Left Off
        </div>
        <h3 className="text-xl font-bold text-foreground">
          {lastVisited.title}
        </h3>
        <p className="text-xs text-foreground-secondary">
          Module: <span className="font-semibold text-foreground">{lastVisited.moduleTitle}</span>
        </p>
      </div>
      <Link
        href={lastVisited.href}
        className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-white font-semibold text-sm hover:opacity-90 shadow-md transition-all"
      >
        <span>Resume Learning</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
