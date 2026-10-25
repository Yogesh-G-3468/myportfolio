"use client";

import { useState, useMemo } from "react";
import { Filter, Plus, Search, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function BloomFilterLab() {
  const [bitSize, setBitSize] = useState<number>(32); // m
  const [hashCount, setHashCount] = useState<number>(3); // k
  const [bitArray, setBitArray] = useState<boolean[]>(() => Array(32).fill(false));
  const [insertedItems, setInsertedItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState<string>("");
  const [testItem, setTestItem] = useState<string>("");
  const [queryResult, setQueryResult] = useState<{ item: string; found: boolean; isFalsePositive: boolean } | null>(null);

  // Hash helper: generate k bit positions for a string
  const getHashIndices = (str: string, m: number, k: number): number[] => {
    const indices: number[] = [];
    for (let seed = 0; seed < k; seed++) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash * 31 + str.charCodeAt(i) + seed * 17) >>> 0;
      }
      indices.push(hash % m);
    }
    return indices;
  };

  const handleInsert = (itemToInsert?: string) => {
    const item = (itemToInsert || newItem).trim().toLowerCase();
    if (!item) return;

    const indices = getHashIndices(item, bitSize, hashCount);
    setBitArray((prev) => {
      const copy = [...prev];
      indices.forEach((idx) => {
        copy[idx] = true;
      });
      return copy;
    });

    if (!insertedItems.includes(item)) {
      setInsertedItems((prev) => [...prev, item]);
    }
    setNewItem("");
    setQueryResult(null);
  };

  const handleQuery = (itemToTest?: string) => {
    const item = (itemToTest || testItem).trim().toLowerCase();
    if (!item) return;

    const indices = getHashIndices(item, bitSize, hashCount);
    const allSet = indices.every((idx) => bitArray[idx]);

    const isActuallyInSet = insertedItems.includes(item);
    const isFalsePositive = allSet && !isActuallyInSet;

    setQueryResult({
      item,
      found: allSet,
      isFalsePositive,
    });
  };

  const handleReset = () => {
    setBitArray(Array(bitSize).fill(false));
    setInsertedItems([]);
    setQueryResult(null);
    setNewItem("");
    setTestItem("");
  };

  // Theoretical False Positive Probability: p = (1 - e^(-k*n/m))^k
  const theoreticalFpRate = useMemo(() => {
    const n = insertedItems.length;
    if (n === 0) return 0;
    const exponent = (-hashCount * n) / bitSize;
    const p = Math.pow(1 - Math.exp(exponent), hashCount);
    return Math.min(100, Math.max(0, p * 100)).toFixed(2);
  }, [insertedItems.length, bitSize, hashCount]);

  return (
    <div className="rounded-3xl border border-border bg-background-elevated p-6 sm:p-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          Interactive Simulator 6
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          Bloom Filter Probabilistic Data Structure
        </h3>
        <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
          Explore space-efficient membership testing. Insert items to see which bit positions are flipped to 1. Test existing or non-existent items to observe guaranteed zero false negatives and calculate false positive probability.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bit array & Controls */}
        <div className="space-y-6 bg-background/50 p-6 rounded-2xl border border-border/70">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Bit Array Size (m)</span>
                <span className="font-mono text-accent">{bitSize} bits</span>
              </div>
              <input
                type="range"
                min="16"
                max="64"
                step="8"
                value={bitSize}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setBitSize(val);
                  setBitArray(Array(val).fill(false));
                  setInsertedItems([]);
                  setQueryResult(null);
                }}
                className="w-full accent-accent"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Hash Functions (k)</span>
                <span className="font-mono text-accent">{hashCount} hashes</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={hashCount}
                onChange={(e) => {
                  setHashCount(Number(e.target.value));
                  setQueryResult(null);
                }}
                className="w-full accent-accent"
              />
            </div>
          </div>

          {/* Visual Bit Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>Bit Array State ({bitArray.filter(Boolean).length} / {bitSize} bits set)</span>
              <button
                onClick={handleReset}
                className="text-xs text-foreground-secondary hover:text-accent flex items-center gap-1"
              >
                <RotateCcw size={12} /> Clear
              </button>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 p-3 rounded-2xl border border-border/80 bg-background/60">
              {bitArray.map((bit, idx) => (
                <div
                  key={idx}
                  title={`Bit ${idx}: ${bit ? "1" : "0"}`}
                  className={`h-7 rounded flex items-center justify-center font-mono text-[11px] font-bold transition-all ${
                    bit
                      ? "bg-accent text-white shadow-sm scale-105"
                      : "bg-muted text-muted-foreground/60 border border-border/40"
                  }`}
                >
                  {bit ? "1" : "0"}
                </div>
              ))}
            </div>
          </div>

          {/* Insertion form */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              1. Insert Element Into Filter:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="e.g. user_101 or alice@domain.com"
                className="flex-1 p-2.5 rounded-xl border border-border bg-background text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleInsert()}
              />
              <button
                onClick={() => handleInsert()}
                className="px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-xs hover:opacity-90 flex items-center gap-1 shrink-0"
              >
                <Plus size={14} /> Insert
              </button>
            </div>
          </div>

          {/* Query form */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              2. Query Membership:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={testItem}
                onChange={(e) => setTestItem(e.target.value)}
                placeholder="e.g. user_101 or stranger_99"
                className="flex-1 p-2.5 rounded-xl border border-border bg-background text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleQuery()}
              />
              <button
                onClick={() => handleQuery()}
                className="px-4 py-2.5 rounded-xl bg-background border border-border hover:bg-muted font-semibold text-xs text-foreground flex items-center gap-1 shrink-0"
              >
                <Search size={14} /> Query
              </button>
            </div>
          </div>
        </div>

        {/* Math & Query Result Output */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Theoretical Math & Guarantees
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
                  Items Stored (n)
                </span>
                <span className="text-2xl font-black text-foreground font-mono">
                  {insertedItems.length}
                </span>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
                  False Positive Rate (p)
                </span>
                <span className="text-2xl font-black text-accent font-mono">
                  {theoreticalFpRate}%
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-border/80 bg-background/40 text-xs text-foreground-secondary space-y-2">
              <p>
                <strong>Zero False Negatives:</strong> If any bit is 0, the item was definitely <em>never inserted</em>.
              </p>
              <p>
                <strong>Possible False Positives:</strong> If all bits are 1, the item is <em>probably</em> in the set, but hash collisions may produce a false positive.
              </p>
            </div>
          </div>

          {/* Live Query Verdict */}
          {queryResult && (
            <div
              className={`p-5 rounded-2xl border transition-all ${
                queryResult.isFalsePositive
                  ? "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200"
                  : queryResult.found
                  ? "border-green-500 bg-green-500/10 text-green-900 dark:text-green-200"
                  : "border-blue-500 bg-blue-500/10 text-blue-900 dark:text-blue-200"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                {queryResult.isFalsePositive ? (
                  <>
                    <AlertTriangle size={16} className="text-amber-500" />
                    <span>FALSE POSITIVE DETECTED!</span>
                  </>
                ) : queryResult.found ? (
                  <>
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span>PROBABLE YES (In Set)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} className="text-blue-500" />
                    <span>DEFINITE NO (Not In Set)</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {queryResult.isFalsePositive
                  ? `"${queryResult.item}" was NEVER inserted, but all ${hashCount} hash positions were already filled by other keys!`
                  : queryResult.found
                  ? `All ${hashCount} hash bits for "${queryResult.item}" are 1. The item was confirmed inserted in the set.`
                  : `At least one hash bit for "${queryResult.item}" is 0. With 100% mathematical certainty, this item was never inserted.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
