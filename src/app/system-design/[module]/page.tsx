import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpen, Clock, ChevronRight, Layers, Sparkles } from "lucide-react";
import { getAllModules, getAllTopics } from "@/lib/system-design/content";

interface ModulePageProps {
  params: Promise<{ module: string }>;
}

export async function generateStaticParams() {
  const modules = getAllModules();
  return modules.map((m) => ({
    module: m.slug,
  }));
}

export default async function ModuleOverviewPage({ params }: ModulePageProps) {
  const { module: moduleSlug } = await params;
  const modules = getAllModules();
  const currentModule = modules.find((m) => m.slug === moduleSlug);

  if (!currentModule) {
    notFound();
  }

  const moduleIndex = modules.findIndex((m) => m.slug === moduleSlug);
  const prevModule = moduleIndex > 0 ? modules[moduleIndex - 1] : null;
  const nextModule = moduleIndex < modules.length - 1 ? modules[moduleIndex + 1] : null;

  return (
    <div className="w-full max-w-[1000px] py-4 px-2 sm:px-6 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground-secondary bg-background-elevated/40 border border-border/50 py-1.5 px-4 rounded-full w-fit backdrop-blur-sm">
        <Link href="/" className="hover:text-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 opacity-60" />
        <Link href="/system-design" className="hover:text-accent transition-colors">
          System Design Hub
        </Link>
        <ChevronRight className="w-3 h-3 opacity-60" />
        <span className="text-foreground truncate max-w-[200px]">{currentModule.title}</span>
      </div>

      {/* Module Header Card */}
      <div className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-accent px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              Module {String(moduleIndex + 1).padStart(2, "0")}
            </span>
            <span
              className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                currentModule.priority === "P0"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}
            >
              {currentModule.priority} Priority
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
            {currentModule.title.replace(/^Module \d+:\s*/, "")}
          </h1>

          <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed">
            {currentModule.summary}
          </p>

          <div className="flex items-center gap-6 pt-4 text-xs font-medium text-foreground-secondary border-t border-border/60">
            <span>
              <strong className="text-foreground text-sm">
                {currentModule.topics.length}
              </strong>{" "}
              {currentModule.topics.length === 1 ? "Guide" : "Guides"} Available
            </span>
            <span>
              <strong className="text-foreground text-sm">
                {currentModule.curriculumItems?.length || currentModule.topics.length}
              </strong>{" "}
              Curriculum Topics
            </span>
            <span>
              Self-Paced Architecture Curriculum
            </span>
          </div>
        </div>
      </div>

      {/* Available Authored Guides */}
      {currentModule.topics.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">
              Deep-Dive Guides & Worked Solutions
            </h2>
            <span className="text-xs text-foreground-secondary font-mono">
              {currentModule.topics.length} available
            </span>
          </div>

          <div className="space-y-3">
            {currentModule.topics.map((t, idx) => (
              <Link
                key={t.slug}
                href={`/system-design/${currentModule.slug}/${t.slug}`}
                className="group block p-5 rounded-2xl border border-border bg-background-elevated hover:border-accent/40 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-accent">
                        {String(idx + 1).padStart(2, "0")}.
                      </span>
                      <h3 className="font-bold text-base text-foreground group-hover:text-accent transition-colors truncate">
                        {t.title}
                      </h3>
                    </div>
                    <p className="text-xs text-foreground-secondary line-clamp-2 leading-relaxed">
                      {t.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 sm:self-center">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded font-mono uppercase bg-muted text-foreground-secondary">
                        {t.type}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {t.readingTime}m
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Full Module Syllabus & Curriculum Items */}
      {currentModule.curriculumItems && currentModule.curriculumItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Module Syllabus & Curriculum Roadmap
              </h2>
              <p className="text-xs text-foreground-secondary mt-1">
                Every concept and interview requirement defined in the complete gap-free curriculum contract.
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              {currentModule.curriculumItems.length} topics
            </span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-background-elevated/40 divide-y divide-border/50 overflow-hidden">
            {currentModule.curriculumItems.map((item, idx) => {
              const matchedTopic = currentModule.topics.find(
                (t) => t.slug === item.id || t.covers?.includes(item.title)
              );

              return (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="font-mono text-xs text-muted-foreground mt-0.5 shrink-0">
                      {String(idx + 1).padStart(2, "0")}.
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground">
                        Priority: {item.priority}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0 sm:self-center">
                    {matchedTopic ? (
                      <Link
                        href={`/system-design/${currentModule.slug}/${matchedTopic.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent text-white text-xs font-semibold hover:opacity-90 shadow-sm transition-all"
                      >
                        <span>Read Guide</span>
                        <ArrowRight size={12} />
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono text-muted-foreground bg-muted/60 border border-border/40">
                        Syllabus Roadmap
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Prev / Next Module Navigation */}
      <div className="flex justify-between items-center gap-4 pt-6 border-t border-border/60">
        {prevModule ? (
          <Link
            href={`/system-design/${prevModule.slug}`}
            className="group flex-1 max-w-[48%] flex items-center gap-3 p-4 rounded-2xl bg-background-elevated hover:bg-background border border-border hover:border-accent/40 transition-all text-left"
          >
            <ArrowLeft className="w-5 h-5 text-foreground-secondary group-hover:-translate-x-1 transition-transform shrink-0" />
            <div className="min-w-0">
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Previous Module
              </span>
              <span className="block text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                {prevModule.title}
              </span>
            </div>
          </Link>
        ) : (
          <div className="flex-1 max-w-[48%]" />
        )}

        {nextModule ? (
          <Link
            href={`/system-design/${nextModule.slug}`}
            className="group flex-1 max-w-[48%] flex items-center justify-between gap-3 p-4 rounded-2xl bg-background-elevated hover:bg-background border border-border hover:border-accent/40 transition-all text-right"
          >
            <div className="min-w-0 ml-auto">
              <span className="block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Next Module
              </span>
              <span className="block text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                {nextModule.title}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-foreground-secondary group-hover:translate-x-1 transition-transform shrink-0" />
          </Link>
        ) : (
          <div className="flex-1 max-w-[48%]" />
        )}
      </div>
    </div>
  );
}
