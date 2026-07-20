"use client";

import React, { useState, useEffect } from "react";
import { Copy, Download, Check, FileCode, Sparkles } from "lucide-react";
import hljs from "highlight.js/lib/core";
import latexLanguage from "highlight.js/lib/languages/latex";

// Register latex language module if available
try {
  if (latexLanguage) {
    hljs.registerLanguage("latex", latexLanguage);
    hljs.registerLanguage("tex", latexLanguage);
  }
} catch (e) {
  console.warn("Failed registering latex language in hljs", e);
}

interface LatexCodeViewerProps {
  code: string;
  onCopySuccess?: (msg: string) => void;
  filename?: string;
}

export default function LatexCodeViewer({
  code,
  onCopySuccess,
  filename = "tailored_resume.tex",
}: LatexCodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  useEffect(() => {
    if (!code) {
      setHighlightedHtml("");
      return;
    }
    try {
      const highlighted = hljs.highlight(code, { language: "latex" }).value;
      setHighlightedHtml(highlighted);
    } catch (e) {
      // Fallback escape html
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      setHighlightedHtml(escaped);
    }
  }, [code]);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    if (onCopySuccess) {
      onCopySuccess("LaTeX source code copied to clipboard!");
    }
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: "text/x-tex;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".tex") ? filename : `${filename}.tex`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onCopySuccess) {
      onCopySuccess(`Downloaded ${filename} successfully!`);
    }
  };

  const linesCount = code ? code.split("\n").length : 0;
  const bytesCount = new Blob([code]).size;

  return (
    <div className="flex flex-col h-full border border-border rounded-2xl overflow-hidden bg-[#1e1e2e] text-slate-100 shadow-xl">
      {/* Code Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 bg-[#181825] border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
            <FileCode size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-100 tracking-tight">
                {filename}
              </span>
              <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded bg-accent/20 text-accent border border-accent/30 tracking-wider">
                LaTeX
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
              {linesCount} lines • {(bytesCount / 1024).toFixed(1)} KB • UTF-8
            </p>
          </div>
        </div>

        {/* Prominent Action Buttons */}
        <div className="flex items-center gap-2.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95 ${
              copied
                ? "bg-emerald-500 text-white"
                : "bg-slate-700/80 hover:bg-slate-700 text-slate-100 border border-slate-600/60"
            }`}
            title="Copy LaTeX Code to clipboard"
          >
            {copied ? (
              <>
                <Check size={14} strokeWidth={3} />
                <span>Copied Code!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy LaTeX Code</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="px-3.5 py-1.5 rounded-xl text-xs font-black bg-accent hover:bg-accent/90 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            title="Export directly as .tex file"
          >
            <Download size={14} />
            <span>Download .tex File</span>
          </button>
        </div>
      </div>

      {/* Syntax Highlighted Code Viewer Container */}
      <div className="relative flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed max-h-[550px] custom-scrollbar bg-[#1e1e2e]">
        <pre className="m-0 whitespace-pre font-mono">
          <code
            className="language-latex font-mono text-slate-200"
            dangerouslySetInnerHTML={{ __html: highlightedHtml || code }}
          />
        </pre>
      </div>

      {/* Footer info banner */}
      <div className="px-4 py-2 bg-[#181825] border-t border-slate-700/60 text-[10px] text-slate-400 flex items-center justify-between font-mono">
        <span className="flex items-center gap-1 text-slate-400">
          <Sparkles size={11} className="text-accent" /> Ready to compile with Overleaf, pdflatex, or XeLaTeX
        </span>
        <span className="text-slate-500">Yogeshwaran G Resume Template</span>
      </div>
    </div>
  );
}
