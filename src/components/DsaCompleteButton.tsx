"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface DsaCompleteButtonProps {
    slug: string;
}

export default function DsaCompleteButton({ slug }: DsaCompleteButtonProps) {
    const [completed, setCompleted] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const checkStatus = () => {
            try {
                const saved = localStorage.getItem("dsa-completed-patterns");
                if (saved) {
                    const list = JSON.parse(saved);
                    setCompleted(list.includes(slug));
                }
            } catch (e) {
                console.error(e);
            }
        };

        checkStatus();
        window.addEventListener("dsa-progress-update", checkStatus);
        return () => window.removeEventListener("dsa-progress-update", checkStatus);
    }, [slug]);

    const handleToggle = () => {
        let completedList: string[] = [];
        try {
            const saved = localStorage.getItem("dsa-completed-patterns");
            if (saved) {
                completedList = JSON.parse(saved);
            }
        } catch (e) {
            console.error(e);
        }

        const updated = completedList.includes(slug)
            ? completedList.filter((s) => s !== slug)
            : [...completedList, slug];

        try {
            localStorage.setItem("dsa-completed-patterns", JSON.stringify(updated));
            setCompleted(updated.includes(slug));
            // Trigger state update on the sidebar
            window.dispatchEvent(new Event("dsa-progress-update"));
        } catch (e) {
            console.error(e);
        }
    };

    if (!isMounted) {
        return (
            <div className="h-12 w-48 bg-muted rounded-full animate-pulse border border-border" />
        );
    }

    return (
        <button
            onClick={handleToggle}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border text-sm font-semibold transition-all duration-300 ${
                completed
                    ? "bg-accent/10 border-accent text-accent hover:bg-accent/20 hover:scale-[1.02]"
                    : "bg-background border-border text-foreground-secondary hover:text-foreground hover:border-accent hover:scale-[1.02] shadow-sm hover:shadow-md"
            }`}
        >
            {completed ? (
                <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Completed!</span>
                </>
            ) : (
                <>
                    <Circle className="w-5 h-5" />
                    <span>Mark as Completed</span>
                </>
            )}
        </button>
    );
}
