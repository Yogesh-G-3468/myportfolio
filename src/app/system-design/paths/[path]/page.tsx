import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, ArrowRight, BookOpen, Clock, CheckCircle2, Sparkles, Layers } from "lucide-react";
import { LEARNING_PATHS } from "@/lib/system-design/learningPathsData";

interface PathProps {
  params: Promise<{ path: string }>;
}

export async function generateStaticParams() {
  return Object.keys(LEARNING_PATHS).map((slug) => ({
    path: slug,
  }));
}

export async function generateMetadata({ params }: PathProps) {
  const { path: pathSlug } = await params;
  const pathData = LEARNING_PATHS[pathSlug];
  if (!pathData) return { title: "Track Not Found" };

  return {
    title: `${pathData.title} — System Design Hub`,
    description: pathData.summary,
  };
}

export default async function LearningPathPage({ params }: PathProps) {
  const { path: pathSlug } = await params;
  const pathData = LEARNING_PATHS[pathSlug];

  if (!pathData) {
    notFound();
  }

  const allTracks = Object.values(LEARNING_PATHS);

  return (
    <div className="w-full max-w-[1000px] mx-auto py-4 px-2 sm:px-6 space-y-10">
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
        <span className="text-foreground">Learning Path: {pathData.title}</span>
      </div>

      {/* Header */}
      <div className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono font-bold text-accent px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            {pathData.role}
          </span>
          <span className="text-xs font-mono text-muted-foreground px-3 py-1 rounded-full bg-muted">
            {pathData.duration}
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          {pathData.title}
        </h1>

        <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed max-w-3xl">
          {pathData.summary}
        </p>

        <div className="pt-2 text-xs text-muted-foreground">
          <strong>Recommended Audience:</strong> {pathData.recommendedAudience}
        </div>
      </div>

      {/* Track Selector Bar */}
      <div className="flex flex-wrap gap-2 text-xs">
        {allTracks.map((track) => (
          <Link
            key={track.slug}
            href={`/system-design/paths/${track.slug}`}
            className={`px-4 py-2 rounded-2xl font-semibold transition-all ${
              track.slug === pathSlug
                ? "bg-accent text-white shadow-sm"
                : "bg-background-elevated border border-border hover:bg-muted text-foreground-secondary"
            }`}
          >
            {track.title.split(" Track")[0]}
          </Link>
        ))}
      </div>

      {/* Syllabus Milestones */}
      <section className="space-y-8">
        <h2 className="text-xl font-bold text-foreground">
          Step-by-Step Curriculum Syllabus
        </h2>

        <div className="space-y-6">
          {pathData.milestones.map((milestone, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-8 rounded-3xl border border-border bg-background-elevated space-y-4 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-accent px-2.5 py-0.5 rounded bg-accent/10">
                    {milestone.week}
                  </span>
                  <h3 className="text-lg font-bold text-foreground">
                    {milestone.title}
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
                {milestone.description}
              </p>

              {/* Topics list for milestone */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Assigned Topic Guides:
                </span>
                <div className="space-y-2">
                  {milestone.topicSlugs.map((t) => (
                    <Link
                      key={t.topic}
                      href={`/system-design/${t.module}/${t.topic}`}
                      className="group p-3.5 rounded-2xl border border-border/70 hover:border-accent/40 bg-background/50 hover:bg-muted/40 transition-all flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-accent" />
                        <span className="font-bold text-foreground group-hover:text-accent transition-colors">
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {t.priority}
                        </span>
                        <ArrowRight size={13} className="text-foreground-secondary group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
