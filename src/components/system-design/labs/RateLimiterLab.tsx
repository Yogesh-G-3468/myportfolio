"use client";

import { useState, useEffect } from "react";
import { Zap, Play, RotateCcw, ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

type AlgorithmType = "token-bucket" | "leaky-bucket" | "fixed-window" | "sliding-window";

interface RequestLog {
  id: number;
  time: string;
  allowed: boolean;
  algorithm: string;
}

export default function RateLimiterLab() {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("token-bucket");
  const [capacity, setCapacity] = useState<number>(10);
  const [refillRate, setRefillRate] = useState<number>(2); // tokens/sec or leak/sec
  const [currentTokens, setCurrentTokens] = useState<number>(10);
  const [leakyQueue, setLeakyQueue] = useState<number>(0);
  const [windowCount, setWindowCount] = useState<number>(0);
  const [logs, setLogs] = useState<RequestLog[]>([]);

  // Ticking interval for refills / leaks
  useEffect(() => {
    const interval = setInterval(() => {
      // Token bucket: add tokens up to capacity
      setCurrentTokens((prev) => Math.min(capacity, prev + refillRate));

      // Leaky bucket: leak queue items
      setLeakyQueue((prev) => Math.max(0, prev - refillRate));

      // Fixed window: simple interval reset
      setWindowCount((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [capacity, refillRate]);

  const sendRequest = (count: number = 1) => {
    const now = new Date().toLocaleTimeString();
    const newLogs: RequestLog[] = [];

    for (let i = 0; i < count; i++) {
      let allowed = false;

      if (algorithm === "token-bucket") {
        if (currentTokens >= 1) {
          allowed = true;
          setCurrentTokens((t) => t - 1);
        }
      } else if (algorithm === "leaky-bucket") {
        if (leakyQueue < capacity) {
          allowed = true;
          setLeakyQueue((q) => q + 1);
        }
      } else if (algorithm === "fixed-window" || algorithm === "sliding-window") {
        if (windowCount < capacity) {
          allowed = true;
          setWindowCount((c) => c + 1);
        }
      }

      newLogs.unshift({
        id: Date.now() + i,
        time: now,
        allowed,
        algorithm,
      });
    }

    setLogs((prev) => [...newLogs, ...prev].slice(0, 30));
  };

  const handleReset = () => {
    setCurrentTokens(capacity);
    setLeakyQueue(0);
    setWindowCount(0);
    setLogs([]);
  };

  const allowedCount = logs.filter((l) => l.allowed).length;
  const rejectedCount = logs.filter((l) => !l.allowed).length;

  return (
    <div className="rounded-3xl border border-border bg-background-elevated p-6 sm:p-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
          <Zap className="w-4 h-4" />
          Interactive Simulator 2
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          Rate Limiter Algorithm Simulator
        </h3>
        <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
          Compare Token Bucket, Leaky Bucket, and Sliding Window counters under burst conditions. Observe token refills, queue drains, and HTTP 429 rejections in real time.
        </p>
      </div>

      {/* Algorithm selector pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "token-bucket", label: "Token Bucket" },
          { id: "leaky-bucket", label: "Leaky Bucket" },
          { id: "fixed-window", label: "Fixed Window" },
          { id: "sliding-window", label: "Sliding Window Counter" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setAlgorithm(item.id as AlgorithmType);
              handleReset();
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              algorithm === item.id
                ? "bg-accent text-white shadow-sm"
                : "bg-background border border-border hover:bg-muted text-foreground-secondary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* State visualizer & Controls */}
        <div className="space-y-6 bg-background/50 p-6 rounded-2xl border border-border/70">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Bucket Capacity / Burst Limit</span>
            <span className="font-mono text-accent">{capacity} requests</span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            value={capacity}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCapacity(val);
              setCurrentTokens(val);
            }}
            className="w-full accent-accent"
          />

          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Refill / Leak Rate</span>
            <span className="font-mono text-accent">{refillRate} tokens/sec</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={refillRate}
            onChange={(e) => setRefillRate(Number(e.target.value))}
            className="w-full accent-accent"
          />

          {/* Graphical gauge of current capacity */}
          <div className="p-4 rounded-xl border border-border/80 bg-background-elevated space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Current Status</span>
              <span className="font-mono text-accent">
                {algorithm === "token-bucket"
                  ? `${currentTokens} / ${capacity} tokens available`
                  : algorithm === "leaky-bucket"
                  ? `${leakyQueue} / ${capacity} queue depth`
                  : `${windowCount} / ${capacity} requests in window`}
              </span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  algorithm === "leaky-bucket"
                    ? leakyQueue >= capacity
                      ? "bg-red-500"
                      : "bg-accent"
                    : currentTokens <= 2
                    ? "bg-red-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${
                    algorithm === "token-bucket"
                      ? (currentTokens / capacity) * 100
                      : algorithm === "leaky-bucket"
                      ? (leakyQueue / capacity) * 100
                      : (windowCount / capacity) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Trigger buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => sendRequest(1)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-accent text-white font-semibold text-xs hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Play size={13} fill="white" />
              <span>Send 1 Request</span>
            </button>
            <button
              onClick={() => sendRequest(5)}
              className="py-2.5 px-4 rounded-xl bg-background border border-border hover:bg-muted text-foreground font-semibold text-xs transition-all"
            >
              Burst: 5 Requests
            </button>
            <button
              onClick={() => sendRequest(15)}
              className="py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 font-semibold text-xs transition-all"
            >
              Surge: 15 Requests
            </button>
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-border hover:bg-muted text-foreground-secondary"
              title="Reset state"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Live log feed */}
        <div className="bg-background/50 p-6 rounded-2xl border border-border/70 flex flex-col h-[320px]">
          <div className="flex items-center justify-between pb-3 border-b border-border text-xs font-semibold">
            <span>Request Traffic Log</span>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <span className="text-green-500">{allowedCount} 200 OK</span>
              <span className="text-red-500">{rejectedCount} 429 Too Many Requests</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pt-3 pr-1 text-xs">
            {logs.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
                Press "Send Request" or "Burst" to simulate live traffic.
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`flex items-center justify-between p-2 rounded-lg border text-[11px] font-mono ${
                    log.allowed
                      ? "border-green-500/30 bg-green-500/5 text-green-700 dark:text-green-300"
                      : "border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {log.allowed ? (
                      <CheckCircle2 size={13} className="text-green-500" />
                    ) : (
                      <XCircle size={13} className="text-red-500" />
                    )}
                    <span>{log.allowed ? "HTTP 200 Allowed" : "HTTP 429 Rate Limited"}</span>
                  </div>
                  <span className="opacity-60">{log.time}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
