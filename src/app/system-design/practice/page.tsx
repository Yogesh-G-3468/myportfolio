"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ChevronRight,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  module: string;
  level: "Basic" | "Intermediate" | "Advanced";
}

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 1,
    question: "Why does Consistent Hashing use Virtual Nodes?",
    answer: "Virtual nodes solve non-uniform key distribution on the ring. By mapping each physical server to 100–200 virtual points, standard deviation of load across servers drops significantly (< 5%).",
    module: "Distributed Systems",
    level: "Intermediate",
  },
  {
    id: 2,
    question: "What is the difference between Cache-Aside and Write-Through?",
    answer: "In Cache-Aside, the application is responsible for querying cache, loading from DB on miss, and populating cache. In Write-Through, the application writes directly to the cache, which synchronously updates the database.",
    module: "Caching",
    level: "Basic",
  },
  {
    id: 3,
    question: "What is a Fencing Token in distributed locking?",
    answer: "A monotonically increasing counter issued by the lock service (e.g. ZooKeeper). When a client writes to storage, storage rejects writes with tokens older than the highest seen token, preventing split-brain writes during GC pauses.",
    module: "Distributed Systems",
    level: "Advanced",
  },
  {
    id: 4,
    question: "How does Token Bucket handle bursts compared to Leaky Bucket?",
    answer: "Token bucket permits bursts up to maximum bucket capacity because accumulated tokens can be spent instantly. Leaky bucket strictly smoothes output to a constant rate regardless of burstiness.",
    module: "API Design",
    level: "Intermediate",
  },
  {
    id: 5,
    question: "What is the difference between B+ Trees and LSM Trees?",
    answer: "B+ trees optimize for reads with fast in-place random lookups and range scans. LSM trees append writes sequentially to an in-memory MemTable, providing 5–10x higher write throughput at the cost of read compaction amplification.",
    module: "Databases",
    level: "Advanced",
  },
  {
    id: 6,
    question: "Why is Quorum R + W > N important in leaderless replication?",
    answer: "By the Pigeonhole Principle, if the read quorum (R) plus write quorum (W) exceeds total replicas (N), at least one replica in the read set must have participated in the latest write, ensuring strong read-your-writes consistency.",
    module: "Databases",
    level: "Intermediate",
  },
];

const CASE_STUDIES = [
  { title: "URL Shortener (Bitly)", slug: "case-url-shortener", time: "45 mins" },
  { title: "Distributed Rate Limiter Service", slug: "case-rate-limiter-service", time: "45 mins" },
  { title: "Distributed Unique ID Generator (Snowflake)", slug: "case-distributed-unique-id", time: "45 mins" },
  { title: "Social Media News Feed (Twitter/Instagram)", slug: "case-social-news-feed", time: "45 mins" },
  { title: "Real-Time Messaging Platform (WhatsApp)", slug: "case-chat-messaging-whatsapp", time: "45 mins" },
  { title: "Video Streaming Platform (YouTube/Netflix)", slug: "case-video-streaming-youtube", time: "45 mins" },
  { title: "E-Commerce Flash Sale Platform (Amazon)", slug: "case-ecommerce-amazon", time: "45 mins" },
  { title: "Ride-Sharing Dispatch Platform (Uber)", slug: "case-ridesharing-uber", time: "45 mins" },
];

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState<"flashcards" | "mock">("flashcards");

  // Flashcards state
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [boxes, setBoxes] = useState<Record<number, number>>({ 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1 });

  // Mock interview timer state
  const [selectedCase, setSelectedCase] = useState<string>(CASE_STUDIES[0].slug);
  const [timerSeconds, setTimerSeconds] = useState<number>(45 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [checklist, setChecklist] = useState<Record<number, boolean>>({});
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((sec) => sec - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const currentCard = DEFAULT_FLASHCARDS[cardIndex];

  const handleNextCard = (gotItRight: boolean) => {
    setIsFlipped(false);
    setBoxes((prev) => ({
      ...prev,
      [currentCard.id]: gotItRight ? Math.min(3, (prev[currentCard.id] || 1) + 1) : 1,
    }));
    setCardIndex((prev) => (prev + 1) % DEFAULT_FLASHCARDS.length);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const toggleCheck = (idx: number) => {
    setChecklist((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto py-4 px-2 sm:px-6 space-y-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground-secondary bg-background-elevated/40 border border-border/50 py-1.5 px-4 rounded-full w-fit backdrop-blur-sm">
        <Link href="/" className="hover:text-accent transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3 h-3 opacity-60" />
        <Link href="/system-design" className="hover:text-accent transition-colors">
          System Design Hub
        </Link>
        <ChevronRight className="w-3 h-3 opacity-60" />
        <span className="text-foreground">Practice & Mock Simulator</span>
      </div>

      {/* Header */}
      <div className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500 text-xs font-semibold">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Interview Readiness Arena</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          Flashcards & Mock Interview Mode
        </h1>

        <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed max-w-3xl">
          Test your retention with Leitner-box spaced repetition flashcards or simulate a real 45-minute timed technical system design interview with live step checklists.
        </p>

        {/* Tab switch */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={() => setActiveTab("flashcards")}
            className={`px-5 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all ${
              activeTab === "flashcards"
                ? "bg-accent text-white shadow-sm"
                : "bg-background border border-border text-foreground-secondary hover:text-foreground"
            }`}
          >
            Spaced Repetition Flashcards
          </button>
          <button
            onClick={() => setActiveTab("mock")}
            className={`px-5 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm transition-all ${
              activeTab === "mock"
                ? "bg-accent text-white shadow-sm"
                : "bg-background border border-border text-foreground-secondary hover:text-foreground"
            }`}
          >
            45-Minute Mock Interview Simulator
          </button>
        </div>
      </div>

      {/* Mode 1: Flashcards */}
      {activeTab === "flashcards" && (
        <section className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-10 space-y-6 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-accent font-bold uppercase tracking-wider">
              Card {cardIndex + 1} of {DEFAULT_FLASHCARDS.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Leitner Box:</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted font-bold text-foreground">
                Box {boxes[currentCard.id] || 1} / 3
              </span>
            </div>
          </div>

          {/* Flashcard interactive flip box */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[220px] rounded-3xl border-2 border-dashed border-accent/40 bg-background/50 hover:bg-background/80 transition-all p-8 flex flex-col justify-between text-center select-none shadow-sm"
          >
            <div className="flex justify-between items-center text-xs text-muted-foreground font-mono">
              <span>{currentCard.module}</span>
              <span className="px-2 py-0.5 rounded bg-muted text-[10px] font-bold">
                {currentCard.level}
              </span>
            </div>

            <div className="py-6">
              {!isFlipped ? (
                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold text-accent tracking-wider block">
                    Question (Click to flip)
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                    {currentCard.question}
                  </h3>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-xs uppercase font-bold text-green-500 tracking-wider block">
                    Model Answer
                  </span>
                  <p className="text-sm sm:text-base text-foreground leading-relaxed max-w-xl mx-auto">
                    {currentCard.answer}
                  </p>
                </div>
              )}
            </div>

            <span className="text-[11px] text-muted-foreground italic">
              Click anywhere on card to flip
            </span>
          </div>

          {/* Rating controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => handleNextCard(false)}
              className="px-6 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-500/20 transition-all"
            >
              Needs Review (Reset to Box 1)
            </button>
            <button
              onClick={() => handleNextCard(true)}
              className="px-6 py-2.5 rounded-xl border border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400 font-semibold text-xs hover:bg-green-500/20 transition-all"
            >
              Mastered (Advance to Next Box)
            </button>
          </div>
        </section>
      )}

      {/* Mode 2: 45-Minute Mock Interview Simulator */}
      {activeTab === "mock" && (
        <section className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
          {/* Header & Case Study Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
            <div className="space-y-1">
              <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                Target Interview Case Study
              </span>
              <select
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
                className="p-2.5 rounded-xl border border-border bg-background text-sm font-semibold text-foreground"
              >
                {CASE_STUDIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Countdown timer */}
            <div className="flex items-center gap-4 bg-background/60 p-3 rounded-2xl border border-border">
              <div className="text-center font-mono">
                <span className="text-2xl sm:text-3xl font-extrabold text-foreground">
                  {formatTime(timerSeconds)}
                </span>
                <span className="block text-[10px] text-muted-foreground uppercase">
                  Remaining
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="p-2.5 rounded-xl bg-accent text-white hover:opacity-90 transition-all"
                  title={isTimerRunning ? "Pause Timer" : "Start Timer"}
                >
                  {isTimerRunning ? <Pause size={15} /> : <Play size={15} fill="white" />}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(45 * 60);
                  }}
                  className="p-2.5 rounded-xl border border-border hover:bg-muted text-foreground-secondary"
                  title="Reset 45m Timer"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 7-Step Checklist */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Interview Milestones Checklist
              </span>

              <div className="space-y-2">
                {[
                  { step: "01", time: "0–5m", title: "Clarifying Questions & Scope", desc: "Define functional use cases, scale, latency targets, and explicit out-of-scope." },
                  { step: "02", time: "5–10m", title: "Capacity Estimation (Math)", desc: "Calculate read/write QPS, bandwidth, and 5-year storage retention." },
                  { step: "03", time: "10–15m", title: "API Design & Data Model", desc: "Design endpoints/RPCs, idempotency keys, and relational/NoSQL schemas." },
                  { step: "04", time: "15–25m", title: "High-Level Architecture", desc: "Draw end-to-end client to DB flow (LB, Gateway, Cache, Message Queue)." },
                  { step: "05", time: "25–35m", title: "Deep Dive into Hard Parts", desc: "Tackle concurrency race conditions, sharding keys, and cache stampede." },
                  { step: "06", time: "35–40m", title: "Bottlenecks & Fault Tolerance", desc: "Eliminate single points of failure, partition tolerance, and load shedding." },
                  { step: "07", time: "40–45m", title: "Wrap-up & Metrics / SLOs", desc: "Summarize trade-offs, metrics (p99 latency), and answer follow-ups." },
                ].map((item, idx) => {
                  const isChecked = !!checklist[idx];

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                        isChecked
                          ? "border-green-500/40 bg-green-500/5 text-foreground"
                          : "border-border/70 bg-background/40 hover:border-border text-foreground-secondary"
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 shrink-0"
                        aria-label="Toggle step check"
                      >
                        {isChecked ? (
                          <CheckCircle2 size={16} className="text-green-500" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-border" />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">
                            {item.step}. {item.title}
                          </span>
                          <span className="font-mono text-[10px] text-accent font-semibold">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground-secondary mt-0.5 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Notes scratchpad & Solution Link */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="space-y-2 flex-1 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Design Notes Scratchpad (Autosaved)
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Jot down functional requirements, back-of-the-envelope estimations (e.g. 50M DAU * 20 req = 11.5k QPS), DB choice trade-offs, and API schemas..."
                  className="flex-1 w-full p-4 rounded-2xl border border-border bg-background text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-accent min-h-[220px]"
                />
              </div>

              {/* Reveal Solution Button */}
              <div className="p-5 rounded-2xl border border-accent/30 bg-accent/5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-accent uppercase tracking-wider block">
                    Finished your mock interview?
                  </span>
                  <p className="text-xs text-foreground-secondary">
                    Compare your notes against the comprehensive production reference design.
                  </p>
                </div>
                <Link
                  href={`/system-design/case-studies/${selectedCase}`}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:opacity-90 shadow-sm"
                >
                  <span>Reveal Reference Solution</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
