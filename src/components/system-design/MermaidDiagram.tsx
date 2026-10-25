"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, ZoomIn, ZoomOut } from "lucide-react";

interface MermaidProps {
  chart: string;
  caption?: string;
}

export default function MermaidDiagram({ chart, caption }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [hasError, setHasError] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      try {
        const mermaid = (await import("mermaid")).default;
        const isDark = document.documentElement.classList.contains("dark");

        mermaid.initialize({
          startOnLoad: false,
          theme: isDark ? "dark" : "neutral",
          securityLevel: "loose",
          fontFamily: "var(--font-inter), system-ui, sans-serif",
          themeVariables: isDark
            ? {
                primaryColor: "#2e1f18",
                primaryTextColor: "#e8e6e3",
                primaryBorderColor: "#e8825e",
                lineColor: "#6dacde",
                secondaryColor: "#1e1d1c",
                tertiaryColor: "#191919",
              }
            : {
                primaryColor: "#f0ddd6",
                primaryTextColor: "#1a1a1a",
                primaryBorderColor: "#c45d3e",
                lineColor: "#2d5a7b",
                secondaryColor: "#f3f1ee",
                tertiaryColor: "#ffffff",
              },
        });

        const uniqueId = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
        const { svg } = await mermaid.render(uniqueId, chart.trim());
        if (isMounted) {
          setSvg(svg);
          setHasError(false);
        }
      } catch (err) {
        console.warn("Mermaid rendering failed:", err);
        if (isMounted) {
          setHasError(true);
        }
      }
    }

    renderChart();

    const observer = new MutationObserver(() => {
      renderChart();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [chart]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-8 rounded-2xl border border-border bg-background-elevated/70 p-4 sm:p-6 shadow-sm overflow-hidden group">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50 text-xs text-foreground-secondary">
        <span className="font-semibold tracking-wider uppercase text-[11px] text-accent flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Architecture Diagram
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.7, s - 0.1))}
            className="p-1.5 rounded-lg hover:bg-muted text-foreground-secondary hover:text-foreground transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={() => setScale((s) => Math.min(1.5, s + 0.1))}
            className="p-1.5 rounded-lg hover:bg-muted text-foreground-secondary hover:text-foreground transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-muted text-foreground-secondary hover:text-foreground transition-colors text-xs font-medium"
            title="Copy Mermaid Code"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            <span>{copied ? "Copied" : "Source"}</span>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="w-full overflow-x-auto flex items-center justify-center py-2 transition-transform duration-200"
        style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
      >
        {hasError ? (
          <pre className="text-xs text-red-400 bg-background/50 p-4 rounded-xl font-mono overflow-x-auto w-full">
            <code>{chart}</code>
          </pre>
        ) : svg ? (
          <div
            className="mermaid-svg-wrapper w-full flex justify-center [&>svg]:max-w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-foreground-secondary text-sm">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <span>Rendering diagram...</span>
          </div>
        )}
      </div>

      {caption && (
        <p className="mt-3 pt-3 border-t border-border/40 text-xs text-center text-foreground-secondary italic">
          {caption}
        </p>
      )}
    </div>
  );
}
