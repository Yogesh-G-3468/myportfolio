"use client";

import { useState } from "react";
import { Database, Play, RotateCcw, Shuffle, Sparkles } from "lucide-react";

type CacheAlgorithm = "LRU" | "LFU" | "FIFO";

interface CacheEntry {
  key: string;
  frequency: number;
  addedAt: number;
}

export default function CacheEvictionLab() {
  const [algorithm, setAlgorithm] = useState<CacheAlgorithm>("LRU");
  const [cacheSize, setCacheSize] = useState<number>(4);
  const [cache, setCache] = useState<CacheEntry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [hits, setHits] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [timeStep, setTimeStep] = useState<number>(0);

  const accessKey = (key: string) => {
    setTimeStep((t) => t + 1);
    const existingIdx = cache.findIndex((c) => c.key === key);

    if (existingIdx !== -1) {
      // CACHE HIT
      setHits((h) => h + 1);
      setHistory((prev) => [`HIT: ${key}`, ...prev].slice(0, 15));

      setCache((prev) => {
        const updated = [...prev];
        const entry = updated[existingIdx];
        entry.frequency += 1;

        if (algorithm === "LRU") {
          // Move to most recently used (end of array)
          updated.splice(existingIdx, 1);
          updated.push(entry);
        }
        return updated;
      });
    } else {
      // CACHE MISS
      setMisses((m) => m + 1);
      const newEntry: CacheEntry = { key, frequency: 1, addedAt: timeStep };

      setCache((prev) => {
        if (prev.length < cacheSize) {
          setHistory((h) => [`MISS (new): ${key}`, ...h].slice(0, 15));
          return [...prev, newEntry];
        }

        // Must Evict
        let evictIdx = 0;
        if (algorithm === "LRU") {
          // Evict least recently used (first element)
          evictIdx = 0;
        } else if (algorithm === "LFU") {
          // Evict lowest frequency
          let minFreq = Infinity;
          prev.forEach((item, idx) => {
            if (item.frequency < minFreq) {
              minFreq = item.frequency;
              evictIdx = idx;
            }
          });
        } else if (algorithm === "FIFO") {
          // Evict oldest addedAt
          let oldestTime = Infinity;
          prev.forEach((item, idx) => {
            if (item.addedAt < oldestTime) {
              oldestTime = item.addedAt;
              evictIdx = idx;
            }
          });
        }

        const evicted = prev[evictIdx];
        setHistory((h) => [`MISS (evicted ${evicted.key}): ${key}`, ...h].slice(0, 15));

        const next = [...prev];
        next.splice(evictIdx, 1);
        next.push(newEntry);
        return next;
      });
    }
  };

  const runZipfTrace = () => {
    // Skewed keys: 'A' and 'B' are accessed ~70% of the time
    const keys = ["A", "A", "A", "B", "B", "C", "A", "D", "B", "E", "A", "F", "B", "A"];
    keys.forEach((k, i) => {
      setTimeout(() => accessKey(k), i * 150);
    });
  };

  const handleReset = () => {
    setCache([]);
    setHits(0);
    setMisses(0);
    setHistory([]);
    setTimeStep(0);
  };

  const total = hits + misses;
  const hitRatio = total > 0 ? Math.round((hits / total) * 100) : 0;

  return (
    <div className="rounded-3xl border border-border bg-background-elevated p-6 sm:p-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
          <Database className="w-4 h-4" />
          Interactive Simulator 4
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          Cache Eviction Simulator (LRU, LFU, FIFO)
        </h3>
        <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
          Test eviction strategies under real workloads. Watch how LRU tracks recency, LFU measures frequency, and Zipf traces maximize hit ratios.
        </p>
      </div>

      {/* Algorithm selector pills */}
      <div className="flex flex-wrap gap-2">
        {(["LRU", "LFU", "FIFO"] as CacheAlgorithm[]).map((algo) => (
          <button
            key={algo}
            onClick={() => {
              setAlgorithm(algo);
              handleReset();
            }}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
              algorithm === algo
                ? "bg-accent text-white shadow-sm"
                : "bg-background border border-border hover:bg-muted text-foreground-secondary"
            }`}
          >
            {algo} Eviction
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Cache visualization */}
        <div className="space-y-6 bg-background/50 p-6 rounded-2xl border border-border/70">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Cache Size Limit (Slots)</span>
            <span className="font-mono text-accent">{cacheSize} keys</span>
          </div>
          <input
            type="range"
            min="2"
            max="6"
            value={cacheSize}
            onChange={(e) => {
              setCacheSize(Number(e.target.value));
              handleReset();
            }}
            className="w-full accent-accent"
          />

          {/* Slots display */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Current In-Memory Cache Slots ({cache.length}/{cacheSize})
            </span>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: cacheSize }).map((_, idx) => {
                const item = cache[idx];
                return (
                  <div
                    key={idx}
                    className={`h-20 rounded-2xl border flex flex-col items-center justify-center p-2 transition-all ${
                      item
                        ? "border-accent/40 bg-accent/10 shadow-sm"
                        : "border-dashed border-border/70 bg-background/30 text-muted-foreground"
                    }`}
                  >
                    {item ? (
                      <>
                        <span className="text-xl font-bold font-mono text-foreground">
                          {item.key}
                        </span>
                        <span className="text-[10px] text-foreground-secondary font-mono">
                          freq: {item.frequency}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Empty</span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground text-center pt-1">
              {algorithm === "LRU" && "Left: Eviction candidate (oldest) → Right: Most recently used"}
              {algorithm === "LFU" && "Eviction chooses key with lowest access frequency"}
              {algorithm === "FIFO" && "Eviction strictly follows First-In First-Out order"}
            </p>
          </div>

          {/* Access keys */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Request a Key:
            </span>
            <div className="flex flex-wrap gap-2">
              {["A", "B", "C", "D", "E", "F"].map((k) => (
                <button
                  key={k}
                  onClick={() => accessKey(k)}
                  className="w-10 h-10 rounded-xl bg-background border border-border hover:border-accent hover:text-accent font-bold font-mono text-sm transition-all"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Batch operations */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={runZipfTrace}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-white font-semibold text-xs hover:opacity-90 transition-all shadow-sm"
            >
              <Sparkles size={13} />
              <span>Simulate Zipf 80/20 Workload</span>
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-xl border border-border hover:bg-muted text-foreground-secondary"
              title="Reset Cache"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Real-time stats & Hit ratio */}
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl border border-border bg-background/40 text-center">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
                Cache Hits
              </span>
              <span className="text-2xl font-black text-green-500 font-mono">{hits}</span>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-background/40 text-center">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
                Cache Misses
              </span>
              <span className="text-2xl font-black text-red-500 font-mono">{misses}</span>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-background/40 text-center">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
                Hit Ratio
              </span>
              <span className="text-2xl font-black text-accent font-mono">{hitRatio}%</span>
            </div>
          </div>

          {/* Hit Ratio progress bar */}
          <div className="p-4 rounded-2xl border border-border/80 bg-background/50 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Cache Efficiency (Hit Ratio)</span>
              <span className="font-mono text-accent">{hitRatio}%</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${hitRatio}%` }}
              />
            </div>
          </div>

          {/* Trace log */}
          <div className="p-4 rounded-2xl border border-border bg-background/50 h-44 overflow-y-auto space-y-1 text-xs font-mono">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Event Trace Log
            </span>
            {history.length === 0 ? (
              <p className="text-muted-foreground italic text-xs pt-4 text-center">
                Click keys above to watch eviction mechanics in action.
              </p>
            ) : (
              history.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-1.5 rounded ${
                    item.startsWith("HIT")
                      ? "text-green-600 dark:text-green-400 bg-green-500/10"
                      : "text-foreground-secondary bg-muted/40"
                  }`}
                >
                  {item}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
