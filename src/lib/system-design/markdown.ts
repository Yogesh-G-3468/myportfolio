import { Marked } from "marked";
import hljs from "highlight.js";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export type ContentChunk =
  | { type: "html"; content: string }
  | { type: "mermaid"; chart: string; caption?: string };

export async function parseTopicContent(rawMarkdown: string): Promise<ContentChunk[]> {
  // Regex to extract ```mermaid ... ``` code blocks
  const mermaidRegex = /```mermaid\s*\n([\s\S]*?)```/g;

  const chunks: ContentChunk[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const marked = new Marked({
    renderer: {
      heading({ text, depth }: { text: string; depth: number }) {
        const plainText = text.replace(/<[^>]*>/g, "");
        const id = slugify(plainText);
        return `<h${depth} id="${id}" class="group flex items-center justify-between scroll-mt-24">
          <span>${text}</span>
          <a href="#${id}" class="opacity-0 group-hover:opacity-100 ml-2 text-accent text-sm font-normal" title="Direct link to heading">#</a>
        </h${depth}>`;
      },
      code({ text, lang }: { text: string; lang?: string }) {
        const validLanguage = lang && hljs.getLanguage(lang) ? lang : "plaintext";
        const highlighted = hljs.highlight(text, { language: validLanguage }).value;
        return `
          <div class="code-block-wrapper my-6 rounded-2xl border border-border bg-[#0d1117] overflow-hidden shadow-md">
            <div class="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 text-[11px] font-mono text-gray-400">
              <span class="uppercase font-semibold">${validLanguage}</span>
            </div>
            <pre class="p-4 sm:p-5 overflow-x-auto text-[13px] sm:text-sm font-mono leading-relaxed"><code class="hljs language-${validLanguage}">${highlighted}</code></pre>
          </div>
        `;
      },
    },
  });

  const processText = async (text: string): Promise<string> => {
    // Transform callout blockquotes: > [!NOTE], > [!TIP], > [!WARNING], > [!IMPORTANT], > [!INTERVIEWTIP]
    let transformed = text.replace(
      />\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION|INTERVIEWTIP|COMMONMISTAKE)\]\s*\n((?:>.*\n?)*)/gi,
      (full, type, contentLines) => {
        const cleanContent = contentLines.replace(/^>\s?/gm, "").trim();
        const upperType = type.toUpperCase();
        let borderClass = "border-blue-500/40 bg-blue-500/5 text-blue-900 dark:text-blue-200";
        let label = "Note";

        if (upperType === "TIP") {
          borderClass = "border-emerald-500/40 bg-emerald-500/5 text-emerald-900 dark:text-emerald-200";
          label = "Pro Tip";
        } else if (upperType === "WARNING" || upperType === "CAUTION") {
          borderClass = "border-amber-500/40 bg-amber-500/5 text-amber-900 dark:text-amber-200";
          label = "Warning";
        } else if (upperType === "IMPORTANT") {
          borderClass = "border-purple-500/40 bg-purple-500/5 text-purple-900 dark:text-purple-200";
          label = "Important Rule";
        } else if (upperType === "INTERVIEWTIP") {
          borderClass = "border-accent/40 bg-accent/5 text-foreground";
          label = "Interview Strategy";
        } else if (upperType === "COMMONMISTAKE") {
          borderClass = "border-red-500/40 bg-red-500/5 text-red-900 dark:text-red-200";
          label = "Common Pitfall";
        }

        return `
          <aside class="my-6 p-4 sm:p-5 rounded-2xl border-l-4 border ${borderClass} shadow-sm">
            <div class="font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-accent">
              <span>${label}</span>
            </div>
            <div class="text-sm leading-relaxed">${cleanContent}</div>
          </aside>
        `;
      }
    );

    const parsedHtml = await marked.parse(transformed);
    return parsedHtml
      .replace(/<table>/g, '<div class="table-responsive-wrapper my-8 overflow-x-auto rounded-2xl border border-border bg-background-elevated/40 shadow-sm"><table class="w-full text-left border-collapse text-xs sm:text-sm">')
      .replace(/<\/table>/g, "</table></div>");
  };

  while ((match = mermaidRegex.exec(rawMarkdown)) !== null) {
    const textBefore = rawMarkdown.substring(lastIndex, match.index);
    if (textBefore.trim()) {
      const html = await processText(textBefore);
      chunks.push({ type: "html", content: html });
    }

    const chart = match[1].trim();
    chunks.push({ type: "mermaid", chart });
    lastIndex = mermaidRegex.lastIndex;
  }

  const textRemaining = rawMarkdown.substring(lastIndex);
  if (textRemaining.trim()) {
    const html = await processText(textRemaining);
    chunks.push({ type: "html", content: html });
  }

  return chunks;
}
