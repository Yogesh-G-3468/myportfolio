"use client";

import { useState, useEffect } from "react";
import { Network, Play, RotateCcw, Server } from "lucide-react";

type LBAlgorithm = "round-robin" | "weighted" | "least-connections" | "power-of-two";

interface BackendServer {
  id: string;
  name: string;
  weight: number;
  activeConnections: number;
  totalHandled: number;
  color: string;
}

export default function LoadBalancerLab() {
  const [algorithm, setAlgorithm] = useState<LBAlgorithm>("round-robin");
  const [servers, setServers] = useState<BackendServer[]>([
    { id: "s1", name: "Backend 1 (us-east-1a)", weight: 1, activeConnections: 0, totalHandled: 0, color: "#c45d3e" },
    { id: "s2", name: "Backend 2 (us-east-1b)", weight: 2, activeConnections: 0, totalHandled: 0, color: "#2d5a7b" },
    { id: "s3", name: "Backend 3 (us-east-1c)", weight: 3, activeConnections: 0, totalHandled: 0, color: "#10b981" },
    { id: "s4", name: "Backend 4 (us-east-1d)", weight: 1, activeConnections: 0, totalHandled: 0, color: "#8b5cf6" },
  ]);
  const [rrIndex, setRrIndex] = useState<number>(0);
  const [trafficLog, setTrafficLog] = useState<string[]>([]);

  // Simulation: requests finish and connections drain gradually
  useEffect(() => {
    const drainInterval = setInterval(() => {
      setServers((prev) =>
        prev.map((s) => ({
          ...s,
          activeConnections: Math.max(0, s.activeConnections - Math.floor(Math.random() * 2 + 1)),
        }))
      );
    }, 1200);

    return () => clearInterval(drainInterval);
  }, []);

  const dispatchRequest = () => {
    let targetIdx = 0;

    if (algorithm === "round-robin") {
      targetIdx = rrIndex % servers.length;
      setRrIndex((prev) => prev + 1);
    } else if (algorithm === "least-connections") {
      // Pick server with lowest activeConnections
      let minConns = Infinity;
      servers.forEach((s, idx) => {
        if (s.activeConnections < minConns) {
          minConns = s.activeConnections;
          targetIdx = idx;
        }
      });
    } else if (algorithm === "weighted") {
      // Pick based on probability proportional to weight
      const totalWeight = servers.reduce((acc, s) => acc + s.weight, 0);
      let rand = Math.random() * totalWeight;
      for (let i = 0; i < servers.length; i++) {
        if (rand < servers[i].weight) {
          targetIdx = i;
          break;
        }
        rand -= servers[i].weight;
      }
    } else if (algorithm === "power-of-two") {
      // Pick 2 distinct random servers, route to the one with fewer connections
      const idx1 = Math.floor(Math.random() * servers.length);
      let idx2 = Math.floor(Math.random() * servers.length);
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * servers.length);
      }
      targetIdx = servers[idx1].activeConnections <= servers[idx2].activeConnections ? idx1 : idx2;
    }

    const chosen = servers[targetIdx];
    setTrafficLog((prev) => [`Routed request to ${chosen.name}`, ...prev].slice(0, 10));

    setServers((prev) => {
      const copy = [...prev];
      copy[targetIdx] = {
        ...copy[targetIdx],
        activeConnections: copy[targetIdx].activeConnections + 1,
        totalHandled: copy[targetIdx].totalHandled + 1,
      };
      return copy;
    });
  };

  const dispatchBurst = (count: number) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => dispatchRequest(), i * 60);
    }
  };

  const handleReset = () => {
    setServers((prev) =>
      prev.map((s) => ({
        ...s,
        activeConnections: 0,
        totalHandled: 0,
      }))
    );
    setRrIndex(0);
    setTrafficLog([]);
  };

  const totalHandled = servers.reduce((acc, s) => acc + s.totalHandled, 0);

  return (
    <div className="rounded-3xl border border-border bg-background-elevated p-6 sm:p-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
          <Network className="w-4 h-4" />
          Interactive Simulator 5
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          Load Balancing Algorithms Visualizer
        </h3>
        <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
          Compare Round Robin, Weighted, Least Connections, and Power-of-Two-Choices (P2C). Observe how P2C prevents hot-spotting without needing global state locking.
        </p>
      </div>

      {/* Algorithm selector pills */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "round-robin", label: "Round Robin" },
          { id: "weighted", label: "Weighted Round Robin" },
          { id: "least-connections", label: "Least Connections" },
          { id: "power-of-two", label: "Power of Two Choices (P2C)" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setAlgorithm(item.id as LBAlgorithm);
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
        {/* Backend servers visualization */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 border-b border-border">
            <span>Backend Server Fleet (4 Nodes)</span>
            <span>Total Requests: {totalHandled}</span>
          </div>

          <div className="space-y-3">
            {servers.map((s) => {
              const sharePercent = totalHandled > 0 ? Math.round((s.totalHandled / totalHandled) * 100) : 0;

              return (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl border border-border/80 bg-background/50 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-foreground">{s.name}</span>
                      {algorithm === "weighted" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                          weight: {s.weight}x
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-foreground-secondary">
                      Active: <strong className="text-accent">{s.activeConnections}</strong> | Total: {s.totalHandled} ({sharePercent}%)
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, s.activeConnections * 10)}%`,
                        backgroundColor: s.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trigger controls */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => dispatchRequest()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-accent text-white font-semibold text-xs hover:opacity-90 transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Play size={13} fill="white" />
              <span>Send 1 Request</span>
            </button>
            <button
              onClick={() => dispatchBurst(10)}
              className="py-2.5 px-4 rounded-xl bg-background border border-border hover:bg-muted text-foreground font-semibold text-xs transition-all"
            >
              Burst: 10 Requests
            </button>
            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl border border-border hover:bg-muted text-foreground-secondary"
              title="Reset metrics"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Algorithm intuition & live routing log */}
        <div className="space-y-5 bg-background/50 p-6 rounded-2xl border border-border/70 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Algorithm Mechanics
            </span>
            <div className="p-4 rounded-xl border border-border/60 bg-background/40 text-xs text-foreground-secondary leading-relaxed">
              {algorithm === "round-robin" && (
                <p>
                  <strong>Round Robin:</strong> Distributes requests sequentially across servers. Best for stateless services with uniform request processing times and identical server hardware.
                </p>
              )}
              {algorithm === "weighted" && (
                <p>
                  <strong>Weighted Round Robin:</strong> Assigns requests proportionally to server compute capacities (weights). Server 3 gets 3x more traffic than Server 1.
                </p>
              )}
              {algorithm === "least-connections" && (
                <p>
                  <strong>Least Connections:</strong> Routes incoming requests to whichever server currently has the fewest active TCP connections. Ideal for long-lived WebSockets or variable query latencies.
                </p>
              )}
              {algorithm === "power-of-two" && (
                <p>
                  <strong>Power of Two Choices (P2C):</strong> Randomly picks 2 candidate servers and routes to whichever has fewer active connections. Avoids the global lock bottleneck of Least Connections while cutting maximum queue depth exponentially (from O(log n / log log n) to O(log log n))!
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Recent Ingress Dispatch
            </span>
            <div className="h-40 overflow-y-auto space-y-1 text-xs font-mono">
              {trafficLog.length === 0 ? (
                <p className="text-muted-foreground italic text-xs pt-8 text-center">
                  Dispatch requests to see real-time routing decisions.
                </p>
              ) : (
                trafficLog.map((log, i) => (
                  <div key={i} className="p-1.5 rounded bg-muted/40 text-foreground-secondary">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
