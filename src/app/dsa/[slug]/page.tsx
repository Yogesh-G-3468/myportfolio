import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, BookOpen, ChevronRight } from "lucide-react";
import { Marked } from "marked";
import hljs from "highlight.js";
import metadata from "@/content/dsa/metadata.json";
import DsaCompleteButton from "@/components/DsaCompleteButton";

const customMarked = new Marked({
    renderer: {
        code({ text, lang }: { text: string; lang?: string }) {
            const validLanguage = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
            const highlighted = hljs.highlight(text, { language: validLanguage }).value;
            return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`;
        }
    }
});

interface PageProps {
    params: Promise<{ slug: string }>;
}

// Generate static params for build optimization
export async function generateStaticParams() {
    return metadata.map((pattern) => ({
        slug: pattern.slug,
    }));
}

export default async function DsaPatternPage({ params }: PageProps) {
    const { slug } = await params;

    // Find current pattern in metadata
    const currentIndex = metadata.findIndex((p) => p.slug === slug);
    if (currentIndex === -1) {
        notFound();
    }

    const currentPattern = metadata[currentIndex];
    const prevPattern = currentIndex > 0 ? metadata[currentIndex - 1] : null;
    const nextPattern = currentIndex < metadata.length - 1 ? metadata[currentIndex + 1] : null;

    // Read the markdown file content
    const filePath = path.join(
        process.cwd(),
        "src",
        "content",
        "dsa",
        `${slug}.md`
    );

    let rawMarkdown = "";
    try {
        rawMarkdown = await fs.promises.readFile(filePath, "utf8");
    } catch (e) {
        console.error(`Failed to read markdown file at ${filePath}:`, e);
        notFound();
    }

    // Rewrite relative image paths (e.g., ./images/xxx.png or images/xxx.png to /dsa/images/xxx.png)
    let processedMarkdown = rawMarkdown
        .replace(/\(\.\/images\//g, "(/dsa/images/")
        .replace(/\(images\//g, "(/dsa/images/")
        .replace(/src="\.\/images\//g, 'src="/dsa/images/')
        .replace(/src="images\//g, 'src="/dsa/images/')
        .replace(/\(\.\.\/images\//g, "(/dsa/images/");

    // If it's a pattern page, we strip the main H1 from the text to avoid double headers since we render the title in a custom header
    const h1Regex = /^#\s+.+$/m;
    processedMarkdown = processedMarkdown.replace(h1Regex, "");

    // Parse markdown to HTML using custom marked with syntax highlighting
    const htmlContent = await customMarked.parse(processedMarkdown);

    // Calculate reading time (200 words per minute)
    const wordCount = rawMarkdown.split(/\s+/).length;
    const readTime = Math.ceil(wordCount / 200);

    return (
        <article className="max-w-4xl mx-auto py-4 px-2 sm:px-6">
            {/* Breadcrumb / Top Nav */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground-secondary mb-6 bg-background-elevated/40 border border-border/50 py-1.5 px-4 rounded-full w-fit backdrop-blur-sm">
                <Link href="/" className="hover:text-accent transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3 opacity-60" />
                <Link href="/dsa" className="hover:text-accent transition-colors">DSA Patterns</Link>
                <ChevronRight className="w-3 h-3 opacity-60" />
                <span className="text-foreground truncate max-w-[150px]">{currentPattern.title}</span>
            </div>

            <div className="bg-background-elevated border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow p-6 sm:p-10 mb-8">
                {/* Meta details */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-foreground-secondary mb-5">
                    <span className="flex items-center gap-1 text-accent">
                        <BookOpen className="w-4 h-4" />
                        {currentPattern.patternNum !== null
                            ? `Pattern ${String(currentPattern.patternNum).padStart(2, "0")}`
                            : "Resource Guide"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {readTime} min read
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-8 tracking-tight leading-tight">
                    {currentPattern.patternNum !== null && (
                        <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent mr-2 font-mono font-bold">
                            {String(currentPattern.patternNum).padStart(2, "0")}.
                        </span>
                    )}
                    {currentPattern.title}
                </h1>

                {/* Divider */}
                <hr className="border-border/60 mb-8" />

                {/* Rendered HTML content */}
                <div
                    className="prose prose-lg dark:prose-invert max-w-none
                        prose-headings:text-foreground prose-headings:font-bold prose-headings:scroll-mt-20
                        prose-h1:text-3xl prose-h1:mb-6 prose-h1:leading-tight
                        prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-accent prose-h2:font-semibold
                        prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                        prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-8 prose-p:text-[17px] sm:prose-p:text-lg
                        prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-a:font-medium
                        prose-strong:text-foreground prose-strong:font-bold
                        prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
                        prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
                        prose-li:text-foreground/90 prose-li:text-[16px] sm:prose-li:text-[17px] prose-li:mb-3 prose-li:leading-relaxed prose-li:marker:text-accent
                        prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-code:font-mono prose-code:text-[14px]
                        prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-border prose-pre:rounded-2xl prose-pre:p-6 prose-pre:shadow-md prose-pre:my-8
                        prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-accent/5 prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:my-6 prose-blockquote:text-base prose-blockquote:font-medium prose-blockquote:text-foreground-secondary
                        prose-img:rounded-xl prose-img:shadow-sm prose-img:border prose-img:border-border prose-img:my-8 prose-img:mx-auto prose-img:max-w-full
                        prose-hr:border-border prose-hr:my-10
                    "
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />

                {/* Progress Button at Bottom */}
                {currentPattern.slug !== "overview" && (
                    <div className="mt-12 pt-8 border-t border-border/65 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-foreground-secondary">
                            Finished studying this pattern? Mark it complete to track your progress!
                        </p>
                        <DsaCompleteButton slug={currentPattern.slug} />
                    </div>
                )}
            </div>

            {/* Next/Prev Navigation */}
            <div className="flex justify-between items-center gap-4 mt-6">
                {prevPattern ? (
                    <Link
                        href={`/dsa/${prevPattern.slug}`}
                        className="group flex-1 max-w-[48%] flex items-center gap-3 p-4 rounded-2xl bg-background-elevated hover:bg-background border border-border hover:border-accent/40 transition-all text-left"
                    >
                        <ArrowLeft className="w-5 h-5 text-foreground-secondary group-hover:-translate-x-1 transition-transform shrink-0" />
                        <div className="min-w-0">
                            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Previous</span>
                            <span className="block text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                                {prevPattern.title}
                            </span>
                        </div>
                    </Link>
                ) : (
                    <div className="flex-1 max-w-[48%]" />
                )}

                {nextPattern ? (
                    <Link
                        href={`/dsa/${nextPattern.slug}`}
                        className="group flex-1 max-w-[48%] flex items-center justify-between gap-3 p-4 rounded-2xl bg-background-elevated hover:bg-background border border-border hover:border-accent/40 transition-all text-right"
                    >
                        <div className="min-w-0 ml-auto">
                            <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Next Pattern</span>
                            <span className="block text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                                {nextPattern.title}
                            </span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-foreground-secondary group-hover:translate-x-1 transition-transform shrink-0" />
                    </Link>
                ) : (
                    <div className="flex-1 max-w-[48%]" />
                )}
            </div>
        </article>
    );
}
