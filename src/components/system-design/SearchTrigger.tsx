"use client";

import { useState } from "react";
import { Search, Download, Upload, Bookmark, Type } from "lucide-react";
import SearchModal from "./SearchModal";
import { TopicItem } from "@/lib/system-design/schema";

interface SearchTriggerProps {
  topics: Pick<
    TopicItem,
    "slug" | "moduleSlug" | "moduleTitle" | "title" | "summary" | "type" | "level" | "priority" | "tags"
  >[];
}

export default function SearchTrigger({ topics }: SearchTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportProgress = () => {
    try {
      const completed = localStorage.getItem("system_design_completed") || "[]";
      const scores = localStorage.getItem("system_design_quiz_scores") || "{}";
      const bookmarks = localStorage.getItem("system_design_bookmarks") || "[]";

      const data = {
        exportedAt: new Date().toISOString(),
        completed: JSON.parse(completed),
        scores: JSON.parse(scores),
        bookmarks: JSON.parse(bookmarks),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `system-design-hub-progress-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to export progress.");
    }
  };

  const handleImportProgress = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed && Array.isArray(parsed.completed)) {
            localStorage.setItem("system_design_completed", JSON.stringify(parsed.completed));
          }
          if (parsed && parsed.scores) {
            localStorage.setItem("system_design_quiz_scores", JSON.stringify(parsed.scores));
          }
          if (parsed && Array.isArray(parsed.bookmarks)) {
            localStorage.setItem("system_design_bookmarks", JSON.stringify(parsed.bookmarks));
          }
          window.dispatchEvent(new Event("system-design-progress-updated"));
          alert("Progress imported successfully!");
        } catch (err) {
          alert("Invalid progress file format.");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background-elevated border border-border/80 hover:border-accent/40 text-foreground-secondary hover:text-foreground text-xs font-medium transition-all shadow-sm"
          title="Search Curriculum (Ctrl+K or /)"
        >
          <Search size={14} className="text-accent" />
          <span className="hidden sm:inline">Search Hub...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-muted border border-border/60 text-[10px] font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={handleExportProgress}
          className="p-2 rounded-xl bg-background-elevated border border-border/80 hover:bg-muted text-foreground-secondary hover:text-foreground transition-colors shadow-sm"
          title="Export Course Progress (JSON)"
          aria-label="Export Progress"
        >
          <Download size={15} />
        </button>

        <button
          onClick={handleImportProgress}
          className="p-2 rounded-xl bg-background-elevated border border-border/80 hover:bg-muted text-foreground-secondary hover:text-foreground transition-colors shadow-sm"
          title="Import Course Progress (JSON)"
          aria-label="Import Progress"
        >
          <Upload size={15} />
        </button>
      </div>

      <SearchModal topics={topics} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
