"use client";

import { useState } from "react";
import { ShieldCheck, ShieldAlert, Cpu, CheckCircle2, XCircle } from "lucide-react";

export default function CapExplorerLab() {
  const [n, setN] = useState<number>(5); // Total replicas
  const [w, setW] = useState<number>(3); // Write quorum
  const [r, setR] = useState<number>(3); // Read quorum

  const isStrictQuorum = r + w > n;
  const writeFaultTolerance = n - w;
  const readFaultTolerance = n - r;

  return (
    <div className="rounded-3xl border border-border bg-background-elevated p-6 sm:p-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
          <Cpu className="w-4 h-4" />
          Interactive Simulator 7
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          CAP & Quorum Consistency Explorer (R + W &gt; N)
        </h3>
        <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
          Tune replica count (N), write quorum (W), and read quorum (R). Visualize the Pigeonhole Principle in distributed storage (Cassandra, DynamoDB, Spanner) and see how quorum overlap guarantees strong consistency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sliders */}
        <div className="space-y-6 bg-background/50 p-6 rounded-2xl border border-border/70">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Total Cluster Replicas (N)</span>
              <span className="font-mono text-accent">{n} nodes</span>
            </div>
            <input
              type="range"
              min="3"
              max="7"
              step="2"
              value={n}
              onChange={(e) => {
                const val = Number(e.target.value);
                setN(val);
                setW(Math.min(w, val));
                setR(Math.min(r, val));
              }}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Write Quorum (W) — Nodes required to ack write</span>
              <span className="font-mono text-accent">{w} nodes</span>
            </div>
            <input
              type="range"
              min="1"
              max={n}
              value={w}
              onChange={(e) => setW(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Read Quorum (R) — Nodes queried during read</span>
              <span className="font-mono text-accent">{r} nodes</span>
            </div>
            <input
              type="range"
              min="1"
              max={n}
              value={r}
              onChange={(e) => setR(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          {/* Node fleet visualization */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Node Overlap Visualization ({n} Total Nodes)
            </span>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: n }).map((_, idx) => {
                const isWriteNode = idx < w;
                const isReadNode = idx >= n - r;
                const isOverlapNode = isWriteNode && isReadNode;

                let badge = "bg-muted text-muted-foreground border-border";
                let label = `Node ${idx + 1}`;

                if (isOverlapNode) {
                  badge = "bg-accent text-white border-accent shadow-md ring-2 ring-accent/30 font-bold";
                  label = `Node ${idx + 1} (OVERLAP: R+W)`;
                } else if (isWriteNode) {
                  badge = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
                  label = `Node ${idx + 1} (Write)`;
                } else if (isReadNode) {
                  badge = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
                  label = `Node ${idx + 1} (Read)`;
                }

                return (
                  <div
                    key={idx}
                    className={`flex-1 min-w-[70px] p-2.5 rounded-xl border text-center text-xs font-mono transition-all ${badge}`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-foreground-secondary">
              Nodes marked <strong>OVERLAP</strong> guarantee that the read quorum intercepts at least one replica holding the latest write timestamp.
            </p>
          </div>
        </div>

        {/* Guarantees & Math verdict */}
        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isStrictQuorum
                  ? "border-green-500 bg-green-500/10 text-green-900 dark:text-green-200"
                  : "border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm mb-1">
                {isStrictQuorum ? (
                  <>
                    <CheckCircle2 size={16} className="text-green-500" />
                    <span>STRONG CONSISTENCY GUARANTEED (R + W &gt; N)</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert size={16} className="text-amber-500" />
                    <span>EVENTUAL CONSISTENCY ONLY (R + W ≤ N)</span>
                  </>
                )}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                Current equation: <strong>R ({r}) + W ({w}) = {r + w}</strong> vs{" "}
                <strong>N ({n})</strong>.{" "}
                {isStrictQuorum
                  ? `Because ${r + w} > ${n}, by the Pigeonhole Principle, read and write quorums MUST overlap on at least ${
                      r + w - n
                    } node(s). Stale reads are mathematically impossible.`
                  : `Because ${r + w} ≤ ${n}, write and read quorums can query disjoint sets of nodes, creating a high probability of stale reads.`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
                  Write Fault Tolerance
                </span>
                <span className="text-xl font-black text-foreground font-mono">
                  {writeFaultTolerance} node(s) down
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Can survive {writeFaultTolerance} node failure(s) and still accept writes.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-background/50 space-y-1">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase block">
                  Read Fault Tolerance
                </span>
                <span className="text-xl font-black text-foreground font-mono">
                  {readFaultTolerance} node(s) down
                </span>
                <p className="text-[10px] text-muted-foreground">
                  Can survive {readFaultTolerance} node failure(s) and still serve reads.
                </p>
              </div>
            </div>

            {/* Common Production Presets */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Load Common Production Presets:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => {
                    setN(3);
                    setW(2);
                    setR(2);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted font-medium text-foreground"
                >
                  Standard Majority (N=3, W=2, R=2)
                </button>
                <button
                  onClick={() => {
                    setN(5);
                    setW(3);
                    setR(3);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted font-medium text-foreground"
                >
                  Distributed Quorum (N=5, W=3, R=3)
                </button>
                <button
                  onClick={() => {
                    setN(3);
                    setW(1);
                    setR(3);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted font-medium text-foreground"
                >
                  Fast Writes (N=3, W=1, R=3)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
