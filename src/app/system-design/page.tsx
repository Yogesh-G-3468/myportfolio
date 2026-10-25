import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  FlaskConical,
  GraduationCap,
  FileText,
  Bookmark,
  Layers,
  Shield,
  Zap,
  Cpu,
  Database,
  Network,
  CheckCircle2,
} from "lucide-react";
import { getAllModules, getAllTopics } from "@/lib/system-design/content";
import ContinueCard from "@/components/system-design/ContinueCard";
import SearchTrigger from "@/components/system-design/SearchTrigger";

export default function SystemDesignLandingPage() {
  const modules = getAllModules();
  const allTopics = getAllTopics();

  const totalTopics = allTopics.length;
  const p0Topics = allTopics.filter((t) => t.priority === "P0").length;

  const learningPaths = [
    {
      id: "backend",
      title: "Backend Engineer",
      duration: "4–6 Weeks",
      focus: "APIs, Relational/NoSQL DBs, Caching, Messaging, High-Availability",
      slug: "backend",
      badge: "Most Popular",
    },
    {
      id: "genai",
      title: "GenAI & ML Systems",
      duration: "3–4 Weeks",
      focus: "RAG architecture, vLLM inference, KV cache, Vector DBs, Agents",
      slug: "genai",
      badge: "Trending",
    },
    {
      id: "staff",
      title: "Senior & Staff Engineer",
      duration: "6–8 Weeks",
      focus: "Distributed Consensus, Multi-Region, Chaos Eng, FinOps, Sagas",
      slug: "staff",
      badge: "Advanced",
    },
    {
      id: "fresher",
      title: "Fresher / Interview Sprint",
      duration: "2 Weeks",
      focus: "Foundations, Estimation Math, Core Top 10 HLD Case Studies",
      slug: "fresher",
      badge: "Quick Start",
    },
  ];

  return (
    <div className="w-full max-w-[1200px] mx-auto py-4 px-2 sm:px-6 space-y-12">
      {/* Top Bar with Search & Quick Tools */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-foreground-secondary">
          <Link href="/" className="hover:text-accent transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground font-bold">System Design Hub</span>
        </div>

        <SearchTrigger
          topics={allTopics.map((t) => ({
            slug: t.slug,
            moduleSlug: t.moduleSlug,
            moduleTitle: t.moduleTitle,
            title: t.title,
            summary: t.summary,
            type: t.type,
            level: t.level,
            priority: t.priority,
            tags: t.tags,
          }))}
        />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-background-elevated p-8 sm:p-14 shadow-sm">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete, Gap-Free System Design Course</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground tracking-tight leading-tight">
            Master System Design from{" "}
            <span className="font-[family-name:var(--font-instrument-serif)] italic font-normal bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
              Zero to Staff Engineer
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-foreground-secondary leading-relaxed">
            A self-paced, book-quality course built without gaps. Every core distributed concept, algorithm, technology deep-dive, low-level design, and high-level case study with production trade-offs and interactive simulators.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/60">
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                24
              </span>
              <span className="text-xs text-foreground-secondary uppercase tracking-wider font-medium">
                Curriculum Modules
              </span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-accent font-mono">
                {modules.reduce((acc, m) => acc + (m.curriculumItems?.length || m.topics.length), 0)}
              </span>
              <span className="text-xs text-foreground-secondary uppercase tracking-wider font-medium">
                Curriculum Topics
              </span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                8
              </span>
              <span className="text-xs text-foreground-secondary uppercase tracking-wider font-medium">
                Interactive Labs
              </span>
            </div>
            <div>
              <span className="block text-2xl sm:text-3xl font-extrabold text-foreground font-mono">
                500+
              </span>
              <span className="text-xs text-foreground-secondary uppercase tracking-wider font-medium">
                Glossary Terms
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Continue Learning Prompt / Recommended Action */}
      <ContinueCard />

      {/* Featured Feature Links */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/system-design/labs"
          className="p-6 rounded-3xl border border-border bg-background-elevated hover:border-accent/40 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-foreground text-base group-hover:text-accent transition-colors">
              8 Interactive Labs
            </h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Real-time simulators: Rate limiters, Consistent hashing, Cache eviction, Raft election, and Capacity calculators.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-accent gap-1">
            <span>Launch Labs</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/system-design/practice"
          className="p-6 rounded-3xl border border-border bg-background-elevated hover:border-accent/40 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-foreground text-base group-hover:text-accent transition-colors">
              Flashcards & Mock Mode
            </h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Leitner-box spaced repetition flashcards and a 45-minute timed mock interview simulator with scoring rubrics.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-accent gap-1">
            <span>Practice Now</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/system-design/cheatsheets"
          className="p-6 rounded-3xl border border-border bg-background-elevated hover:border-accent/40 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-foreground text-base group-hover:text-accent transition-colors">
              Master Cheat Sheets
            </h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Latency numbers every engineer must know, DB selection matrices, isolation anomalies, and GoF patterns.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-accent gap-1">
            <span>View Cheat Sheets</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          href="/system-design/glossary"
          className="p-6 rounded-3xl border border-border bg-background-elevated hover:border-accent/40 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-foreground text-base group-hover:text-accent transition-colors">
              A-Z Architecture Glossary
            </h3>
            <p className="text-xs text-foreground-secondary leading-relaxed">
              Over 500 rigorously defined system design terms, acronyms, and formulas cross-linked to topic guides.
            </p>
          </div>
          <div className="mt-4 flex items-center text-xs font-semibold text-accent gap-1">
            <span>Explore Terms</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </section>

      {/* Curated Learning Tracks */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              Curated Learning Tracks
            </h2>
            <p className="text-sm text-foreground-secondary mt-1">
              Follow a role-tailored sequence designed to maximize learning efficiency.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {learningPaths.map((path) => (
            <Link
              key={path.id}
              href={`/system-design/paths/${path.slug}`}
              className="p-6 rounded-3xl border border-border bg-background-elevated hover:border-accent/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                    {path.badge}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {path.duration}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors">
                  {path.title}
                </h3>
                <p className="text-xs text-foreground-secondary leading-relaxed">
                  {path.focus}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-foreground-secondary group-hover:text-accent">
                <span>View Syllabus</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* The 24 Curriculum Modules Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
              All 24 Curriculum Modules
            </h2>
            <p className="text-sm text-foreground-secondary mt-1">
              Zero gaps. Every module contains deep technical breakdowns, diagrams, trade-offs, and interview Q&A.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m, idx) => (
            <Link
              key={m.slug}
              href={`/system-design/${m.slug}`}
              className="p-6 rounded-3xl border border-border bg-background-elevated hover:border-accent/40 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-accent">
                    Module {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      m.priority === "P0"
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    }`}
                  >
                    {m.priority} Core
                  </span>
                </div>

                <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors leading-snug">
                  {m.title.replace(/^Module \d+:\s*/, "")}
                </h3>

                <p className="text-xs text-foreground-secondary line-clamp-3 leading-relaxed">
                  {m.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-foreground-secondary">
                <span className="font-medium">
                  {m.curriculumItems?.length || m.topics.length} {(m.curriculumItems?.length || m.topics.length) === 1 ? "topic" : "topics"}
                  {m.topics.length > 0 && ` • ${m.topics.length} ready`}
                </span>
                <span className="font-semibold text-accent flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Explore Module <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
