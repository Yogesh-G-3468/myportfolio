import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  ChevronRight,
  Calendar,
  Tag,
  Share2,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import {
  getAllTopics,
  getTopicBySlug,
  getAdjacentTopics,
  getAllModules,
} from "@/lib/system-design/content";
import { parseTopicContent } from "@/lib/system-design/markdown";
import MermaidDiagram from "@/components/system-design/MermaidDiagram";
import TableOfContents from "@/components/system-design/TableOfContents";
import CompleteButton from "@/components/system-design/CompleteButton";
import TopicQuiz from "@/components/system-design/TopicQuiz";
import TrackLastVisited from "@/components/system-design/TrackLastVisited";

interface PageProps {
  params: Promise<{ module: string; topic: string }>;
}

export async function generateStaticParams() {
  const all = getAllTopics();
  return all.map((t) => ({
    module: t.moduleSlug,
    topic: t.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { module: moduleSlug, topic: topicSlug } = await params;
  const topic = getTopicBySlug(moduleSlug, topicSlug);
  if (!topic) return { title: "Topic Not Found" };

  return {
    title: `${topic.title} — System Design Hub`,
    description: topic.summary,
    openGraph: {
      title: `${topic.title} | System Design Hub`,
      description: topic.summary,
    },
  };
}

export default async function TopicDetailPage({ params }: PageProps) {
  const { module: moduleSlug, topic: topicSlug } = await params;
  const topic = getTopicBySlug(moduleSlug, topicSlug);

  if (!topic) {
    notFound();
  }

  const { prev, next } = getAdjacentTopics(moduleSlug, topicSlug);
  const chunks = await parseTopicContent(topic.body);

  return (
    <div className="flex gap-8 justify-between">
      {/* Persist reading history */}
      <TrackLastVisited
        title={topic.title}
        moduleTitle={topic.moduleTitle}
        href={`/system-design/${moduleSlug}/${topicSlug}`}
      />

      {/* Main Article Container (~75ch comfortable reading width) */}
      <article className="flex-1 min-w-0 max-w-[840px] py-4 px-2 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-foreground-secondary mb-6 bg-background-elevated/40 border border-border/50 py-1.5 px-4 rounded-full w-fit backdrop-blur-sm">
          <Link href="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 opacity-60" />
          <Link href="/system-design" className="hover:text-accent transition-colors">
            System Design
          </Link>
          <ChevronRight className="w-3 h-3 opacity-60" />
          <Link
            href={`/system-design/${moduleSlug}`}
            className="hover:text-accent transition-colors truncate max-w-[140px]"
          >
            {topic.moduleTitle}
          </Link>
          <ChevronRight className="w-3 h-3 opacity-60" />
          <span className="text-foreground truncate max-w-[180px]">{topic.title}</span>
        </div>

        {/* Topic Header Card */}
        <header className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-10 mb-8 shadow-sm">
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs mb-5">
            <span className="font-mono uppercase font-bold px-2.5 py-0.5 rounded-full bg-accent/10 text-accent">
              {topic.type}
            </span>
            <span
              className={`font-semibold uppercase text-[11px] px-2.5 py-0.5 rounded-full ${
                topic.level === "beginner"
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : topic.level === "intermediate"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
              }`}
            >
              {topic.level}
            </span>
            <span
              className={`font-mono text-[11px] font-bold px-2 py-0.5 rounded ${
                topic.priority === "P0"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-muted text-foreground-secondary"
              }`}
            >
              {topic.priority}
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1 text-foreground-secondary">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              {topic.readingTime} min read
            </span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span className="flex items-center gap-1 text-foreground-secondary">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              {topic.lastReviewed}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
            {topic.title}
          </h1>

          {/* High-Impact Summary */}
          <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed pt-2 border-t border-border/50">
            {topic.summary}
          </p>

          {/* Tags */}
          {topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-border/40">
              {topic.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-muted text-foreground-secondary"
                >
                  <Tag size={11} className="opacity-60" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Render Content Chunks */}
        <div className="prose prose-lg dark:prose-invert max-w-none text-foreground
          prose-headings:text-foreground prose-headings:font-bold prose-headings:scroll-mt-24
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-accent prose-h2:border-b prose-h2:border-border/60 prose-h2:pb-2
          prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-foreground/90 prose-p:leading-relaxed prose-p:mb-6 prose-p:text-[17px]
          prose-a:text-accent prose-a:no-underline hover:prose-a:underline
          prose-strong:text-foreground prose-strong:font-bold
          prose-ul:my-5 prose-ul:list-disc prose-ul:pl-6
          prose-ol:my-5 prose-ol:list-decimal prose-ol:pl-6
          prose-li:text-foreground/90 prose-li:mb-2 prose-li:leading-relaxed
          prose-blockquote:not-italic
        ">
          {chunks.map((chunk, idx) => {
            if (chunk.type === "mermaid") {
              return <MermaidDiagram key={idx} chart={chunk.chart} caption={chunk.caption} />;
            }
            return (
              <div
                key={idx}
                dangerouslySetInnerHTML={{ __html: chunk.content }}
              />
            );
          })}
        </div>

        {/* Backlinks: Used in these Case Studies */}
        {topic.usedInCaseStudies.length > 0 && (
          <div className="my-10 p-6 rounded-3xl border border-border bg-background-elevated/70 shadow-sm">
            <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-accent" />
              Applied In These Production Case Studies
            </h3>
            <p className="text-xs text-foreground-secondary mb-4">
              See how this architectural concept is practically applied in real high-scale system designs:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {topic.usedInCaseStudies.map((cs, i) => (
                <Link
                  key={i}
                  href={cs.href}
                  className="p-3 rounded-xl border border-border/70 hover:border-accent/40 bg-background/50 hover:bg-muted/40 transition-all text-xs font-semibold text-foreground hover:text-accent flex items-center justify-between"
                >
                  <span className="truncate">{cs.title}</span>
                  <ArrowRight size={13} className="shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Interactive Knowledge Check Quiz */}
        {topic.quiz && topic.quiz.length > 0 && (
          <TopicQuiz quiz={topic.quiz} topicSlug={topic.slug} />
        )}

        {/* Topic Completion Footer */}
        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground-secondary">
            Mastered this architecture topic? Mark it complete to update your course progress.
          </p>
          <CompleteButton moduleSlug={moduleSlug} topicSlug={topicSlug} />
        </div>

        {/* Prev / Next Topic Navigation */}
        <div className="flex justify-between items-center gap-4 mt-8 pt-6 border-t border-border/40">
          {prev ? (
            <Link
              href={prev.href}
              className="group flex-1 max-w-[48%] flex items-center gap-3 p-4 rounded-2xl bg-background-elevated hover:bg-background border border-border hover:border-accent/40 transition-all text-left"
            >
              <ArrowLeft className="w-5 h-5 text-foreground-secondary group-hover:-translate-x-1 transition-transform shrink-0" />
              <div className="min-w-0">
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  Previous Topic
                </span>
                <span className="block text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                  {prev.title}
                </span>
              </div>
            </Link>
          ) : (
            <div className="flex-1 max-w-[48%]" />
          )}

          {next ? (
            <Link
              href={next.href}
              className="group flex-1 max-w-[48%] flex items-center justify-between gap-3 p-4 rounded-2xl bg-background-elevated hover:bg-background border border-border hover:border-accent/40 transition-all text-right"
            >
              <div className="min-w-0 ml-auto">
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  Next Topic
                </span>
                <span className="block text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                  {next.title}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-foreground-secondary group-hover:translate-x-1 transition-transform shrink-0" />
            </Link>
          ) : (
            <div className="flex-1 max-w-[48%]" />
          )}
        </div>
      </article>

      {/* Sticky Table of Contents on Desktop */}
      <TableOfContents headings={topic.headings} />
    </div>
  );
}
