"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Search,
  Code2,
  FileText,
  FlaskConical,
  GraduationCap,
  Bookmark,
  X,
  Menu,
} from "lucide-react";
import { ModuleItem } from "@/lib/system-design/schema";

interface SidebarProps {
  modules: ModuleItem[];
}

export default function Sidebar({ modules }: SidebarProps) {
  const pathname = usePathname();
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Sync completion list from localStorage
  const syncProgress = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("system_design_completed") || "[]");
      if (Array.isArray(stored)) {
        setCompletedTopics(stored);
      }
    } catch (e) {
      console.warn("Could not read progress from localStorage", e);
    }
  };

  useEffect(() => {
    syncProgress();
    window.addEventListener("system-design-progress-updated", syncProgress);
    window.addEventListener("storage", syncProgress);
    return () => {
      window.removeEventListener("system-design-progress-updated", syncProgress);
      window.removeEventListener("storage", syncProgress);
    };
  }, []);

  // Determine current active module and automatically expand it
  useEffect(() => {
    if (!pathname) return;
    const parts = pathname.split("/").filter(Boolean);
    // path: /system-design/[module]/[topic]
    if (parts.length >= 2 && parts[0] === "system-design") {
      const currentModSlug = parts[1];
      setOpenModules((prev) => ({ ...prev, [currentModSlug]: true }));
    }
  }, [pathname]);

  const toggleModule = (slug: string) => {
    setOpenModules((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // Overall stats
  const totalTopics = useMemo(() => {
    return modules.reduce((acc, m) => acc + (m.curriculumItems?.length || m.topics.length), 0);
  }, [modules]);

  const completedCount = completedTopics.length;
  const progressPercent = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  const content = (
    <div className="flex flex-col h-full">
      {/* Course Overall Progress */}
      <div className="p-4 border-b border-border bg-background-elevated/40 rounded-2xl mb-4">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <span className="text-foreground flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            Course Progress
          </span>
          <span className="text-accent font-mono">{progressPercent}%</span>
        </div>
        <div className="w-full bg-border/60 h-2 rounded-full overflow-hidden">
          <div
            className="bg-accent h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-foreground-secondary mt-2">
          <span>{completedCount} completed</span>
          <span>{totalTopics} total topics</span>
        </div>
      </div>

      {/* Hub Navigation Shortcuts */}
      <div className="grid grid-cols-2 gap-1.5 mb-4 text-xs font-medium">
        <Link
          href="/system-design"
          className={`flex items-center gap-1.5 p-2 rounded-xl border transition-all ${
            pathname === "/system-design"
              ? "bg-accent/10 border-accent text-accent font-semibold"
              : "bg-background-elevated/50 border-border/70 hover:bg-muted text-foreground-secondary hover:text-foreground"
          }`}
          onClick={() => setIsMobileOpen(false)}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Curriculum</span>
        </Link>
        <Link
          href="/system-design/labs"
          className={`flex items-center gap-1.5 p-2 rounded-xl border transition-all ${
            pathname === "/system-design/labs"
              ? "bg-accent/10 border-accent text-accent font-semibold"
              : "bg-background-elevated/50 border-border/70 hover:bg-muted text-foreground-secondary hover:text-foreground"
          }`}
          onClick={() => setIsMobileOpen(false)}
        >
          <FlaskConical className="w-3.5 h-3.5 text-blue-500" />
          <span>8 Labs</span>
        </Link>
        <Link
          href="/system-design/practice"
          className={`flex items-center gap-1.5 p-2 rounded-xl border transition-all ${
            pathname === "/system-design/practice"
              ? "bg-accent/10 border-accent text-accent font-semibold"
              : "bg-background-elevated/50 border-border/70 hover:bg-muted text-foreground-secondary hover:text-foreground"
          }`}
          onClick={() => setIsMobileOpen(false)}
        >
          <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
          <span>Practice & Mock</span>
        </Link>
        <Link
          href="/system-design/cheatsheets"
          className={`flex items-center gap-1.5 p-2 rounded-xl border transition-all ${
            pathname === "/system-design/cheatsheets"
              ? "bg-accent/10 border-accent text-accent font-semibold"
              : "bg-background-elevated/50 border-border/70 hover:bg-muted text-foreground-secondary hover:text-foreground"
          }`}
          onClick={() => setIsMobileOpen(false)}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-500" />
          <span>Cheat Sheets</span>
        </Link>
        <Link
          href="/system-design/glossary"
          className={`col-span-2 flex items-center justify-between p-2 rounded-xl border transition-all ${
            pathname === "/system-design/glossary"
              ? "bg-accent/10 border-accent text-accent font-semibold"
              : "bg-background-elevated/50 border-border/70 hover:bg-muted text-foreground-secondary hover:text-foreground"
          }`}
          onClick={() => setIsMobileOpen(false)}
        >
          <div className="flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <span>A-Z System Glossary (500+ terms)</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
            Search
          </span>
        </Link>
      </div>

      <div className="flex items-center justify-between px-2 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <span>Curriculum Modules ({modules.length})</span>
      </div>

      {/* Modules Tree */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 -mr-1">
        {modules.map((m, idx) => {
          const isOpen = !!openModules[m.slug];
          const isModActive = pathname.startsWith(`/system-design/${m.slug}`);
          const totalItems = m.curriculumItems?.length || m.topics.length;
          const modCompleted = m.topics.filter((t) =>
            completedTopics.includes(`${m.slug}/${t.slug}`)
          ).length;

          // Clean title: "Module 01: ..."
          const cleanTitle = m.title.replace(/^Module \d+:\s*/, "");
          const formattedModNum = `Module ${String(idx + 1).padStart(2, "0")}`;

          return (
            <div
              key={m.slug}
              className={`rounded-2xl border transition-colors overflow-hidden ${
                isModActive
                  ? "border-accent/40 bg-accent/5"
                  : "border-border/60 bg-background-elevated/30 hover:border-border"
              }`}
            >
              <div
                className={`w-full flex items-center justify-between p-2.5 text-left transition-colors ${
                  isModActive ? "text-foreground font-semibold" : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2 flex-1">
                  {m.topics.length > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleModule(m.slug);
                      }}
                      className="p-1 -ml-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                      title={isOpen ? "Collapse topics" : "Expand topics"}
                    >
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}
                  <Link
                    href={`/system-design/${m.slug}`}
                    onClick={() => setIsMobileOpen(false)}
                    className="text-xs font-semibold truncate leading-tight hover:text-accent transition-colors flex-1"
                    title={`${formattedModNum}: ${cleanTitle}`}
                  >
                    <span className="text-muted-foreground font-mono text-[11px] mr-1">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>
                    {cleanTitle}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-muted text-foreground-secondary">
                    {modCompleted}/{totalItems}
                  </span>
                </div>
              </div>

              {isOpen && m.topics.length > 0 && (
                <div className="py-1 px-2 border-t border-border/40 bg-background/50 space-y-0.5">
                  {m.topics.map((t) => {
                    const isTopicActive = pathname === `/system-design/${m.slug}/${t.slug}`;
                    const isDone = completedTopics.includes(`${m.slug}/${t.slug}`);

                    return (
                      <Link
                        key={t.slug}
                        href={`/system-design/${m.slug}/${t.slug}`}
                        onClick={() => setIsMobileOpen(false)}
                        className={`group flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs transition-all ${
                          isTopicActive
                            ? "bg-accent text-white font-semibold shadow-sm"
                            : "hover:bg-muted text-foreground-secondary hover:text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isDone ? (
                            <CheckCircle2
                              className={`w-3.5 h-3.5 shrink-0 ${
                                isTopicActive ? "text-white" : "text-green-500"
                              }`}
                            />
                          ) : (
                            <div
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                isTopicActive ? "bg-white" : "bg-border group-hover:bg-accent"
                              }`}
                            />
                          )}
                          <span className="truncate">{t.title}</span>
                        </div>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono shrink-0 ${
                            isTopicActive
                              ? "bg-white/20 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {t.type}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile drawer toggle floating button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-accent text-white font-semibold shadow-lg hover:opacity-95 transition-all text-sm"
          aria-label="Toggle Course Navigation"
        >
          {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
          <span>{isMobileOpen ? "Close Menu" : "Course Index"}</span>
        </button>
      </div>

      {/* Mobile Slide-Over Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <div
        className={`lg:hidden fixed top-0 bottom-0 left-0 z-50 w-80 max-w-[85vw] bg-background border-r border-border p-4 shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
          <span className="font-bold text-foreground text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-accent" />
            System Design Hub
          </span>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="p-1 rounded-lg hover:bg-muted text-foreground-secondary"
            aria-label="Close Menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="h-[calc(100%-3rem)]">{content}</div>
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-hidden">
        {content}
      </aside>
    </>
  );
}
