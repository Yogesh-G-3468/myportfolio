"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2 } from "lucide-react";

interface CompleteButtonProps {
  moduleSlug: string;
  topicSlug: string;
}

export default function CompleteButton({ moduleSlug, topicSlug }: CompleteButtonProps) {
  const [completed, setCompleted] = useState<boolean>(false);
  const key = `${moduleSlug}/${topicSlug}`;

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("system_design_completed") || "[]");
      if (Array.isArray(stored)) {
        setCompleted(stored.includes(key));
      }
    } catch (e) {
      console.warn("Error reading completion status:", e);
    }
  }, [key]);

  const toggleComplete = () => {
    try {
      const stored = JSON.parse(localStorage.getItem("system_design_completed") || "[]");
      let updated: string[];
      if (stored.includes(key)) {
        updated = stored.filter((item: string) => item !== key);
        setCompleted(false);
      } else {
        updated = [...stored, key];
        setCompleted(true);
      }
      localStorage.setItem("system_design_completed", JSON.stringify(updated));
      window.dispatchEvent(new Event("system-design-progress-updated"));
    } catch (e) {
      console.warn("Error saving completion status:", e);
    }
  };

  return (
    <button
      onClick={toggleComplete}
      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
        completed
          ? "bg-green-600/15 text-green-600 dark:text-green-400 border border-green-600/30 hover:bg-green-600/25"
          : "bg-background-elevated hover:bg-muted text-foreground border border-border shadow-sm hover:border-accent/40"
      }`}
    >
      {completed ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>Completed</span>
        </>
      ) : (
        <>
          <div className="w-4 h-4 rounded-full border border-border flex items-center justify-center">
            <Check className="w-2.5 h-2.5 opacity-0 hover:opacity-100" />
          </div>
          <span>Mark as Complete</span>
        </>
      )}
    </button>
  );
}
