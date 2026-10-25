"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ShieldAlert, Play, RotateCcw, Crown, HeartCrack } from "lucide-react";

interface RaftNode {
  id: number;
  role: "Leader" | "Candidate" | "Follower" | "Dead";
  term: number;
  votes: number;
  votedFor: number | null;
}

export default function RaftVisualizerLab() {
  const [term, setTerm] = useState<number>(1);
  const [nodes, setNodes] = useState<RaftNode[]>([
    { id: 1, role: "Leader", term: 1, votes: 0, votedFor: 1 },
    { id: 2, role: "Follower", term: 1, votes: 0, votedFor: 1 },
    { id: 3, role: "Follower", term: 1, votes: 0, votedFor: 1 },
    { id: 4, role: "Follower", term: 1, votes: 0, votedFor: 1 },
    { id: 5, role: "Follower", term: 1, votes: 0, votedFor: 1 },
  ]);
  const [electionLog, setElectionLog] = useState<string[]>([
    "Cluster initialized: Node 1 elected Leader in Term 1 with 5/5 votes.",
  ]);

  // Kill current leader and trigger election
  const killLeader = () => {
    const currentLeader = nodes.find((n) => n.role === "Leader");
    if (!currentLeader) return;

    const nextTerm = term + 1;
    setTerm(nextTerm);

    // Pick an alive follower to become candidate
    const aliveFollowers = nodes.filter((n) => n.id !== currentLeader.id && n.role !== "Dead");
    if (aliveFollowers.length === 0) return;

    const candidate = aliveFollowers[Math.floor(Math.random() * aliveFollowers.length)];

    setElectionLog((prev) => [
      `🚨 Heartbeat timeout! Node ${currentLeader.id} crashed. Node ${candidate.id} increments term to ${nextTerm} and starts election.`,
      ...prev,
    ]);

    // Candidate transitions and asks for votes
    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === currentLeader.id) {
          return { ...n, role: "Dead" };
        }
        if (n.id === candidate.id) {
          return { ...n, role: "Candidate", term: nextTerm, votes: 1, votedFor: candidate.id };
        }
        return { ...n, term: nextTerm, votes: 0, votedFor: candidate.id };
      })
    );

    // After brief delay, candidate collects majority votes and becomes Leader
    setTimeout(() => {
      const majorityCount = Math.floor(aliveFollowers.length / 2) + 1;
      setElectionLog((prev) => [
        `👑 Node ${candidate.id} collected ${aliveFollowers.length} votes (majority >= 3 required). Promoted to LEADER in Term ${nextTerm}!`,
        ...prev,
      ]);

      setNodes((prev) =>
        prev.map((n) => {
          if (n.id === candidate.id) {
            return { ...n, role: "Leader", votes: aliveFollowers.length };
          }
          if (n.role === "Dead") return n;
          return { ...n, role: "Follower" };
        })
      );
    }, 1000);
  };

  const recoverAll = () => {
    const nextTerm = term + 1;
    setTerm(nextTerm);
    setNodes([
      { id: 1, role: "Leader", term: nextTerm, votes: 5, votedFor: 1 },
      { id: 2, role: "Follower", term: nextTerm, votes: 0, votedFor: 1 },
      { id: 3, role: "Follower", term: nextTerm, votes: 0, votedFor: 1 },
      { id: 4, role: "Follower", term: nextTerm, votes: 0, votedFor: 1 },
      { id: 5, role: "Follower", term: nextTerm, votes: 0, votedFor: 1 },
    ]);
    setElectionLog((prev) => [
      `🔄 All cluster nodes restored. Node 1 reassumed leadership for Term ${nextTerm}.`,
      ...prev,
    ]);
  };

  return (
    <div className="rounded-3xl border border-border bg-background-elevated p-6 sm:p-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
          <Crown className="w-4 h-4" />
          Interactive Simulator 8
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          Raft Consensus Leader Election Visualizer
        </h3>
        <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
          Simulate distributed consensus failure modes. Crash the active leader to trigger heartbeat timeouts, randomized election timers, term increments, and majority quorum voting (3/5).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Raft Nodes Fleet */}
        <div className="space-y-6 bg-background/50 p-6 rounded-2xl border border-border/70">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>Raft Cluster State</span>
            <span className="font-mono text-accent">Term {term}</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {nodes.map((node) => {
              const isLeader = node.role === "Leader";
              const isCandidate = node.role === "Candidate";
              const isDead = node.role === "Dead";

              let border = "border-border bg-background/60 text-foreground";
              if (isLeader) {
                border = "border-accent bg-accent/15 text-accent font-bold ring-2 ring-accent/30";
              } else if (isCandidate) {
                border = "border-amber-500 bg-amber-500/15 text-amber-600 font-bold animate-pulse";
              } else if (isDead) {
                border = "border-red-500/40 bg-red-500/10 text-red-500 opacity-60";
              }

              return (
                <div
                  key={node.id}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${border}`}
                >
                  {isLeader ? (
                    <Crown size={18} className="text-accent" />
                  ) : isDead ? (
                    <HeartCrack size={18} className="text-red-500" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-current" />
                  )}
                  <span className="text-xs font-bold font-mono">Node {node.id}</span>
                  <span className="text-[10px] uppercase font-mono tracking-wider">
                    {node.role}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={killLeader}
              className="flex-1 py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 font-semibold text-xs hover:bg-red-500/20 transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <HeartCrack size={14} />
              <span>Kill Active Leader</span>
            </button>
            <button
              onClick={recoverAll}
              className="py-2.5 px-4 rounded-xl bg-background border border-border hover:bg-muted font-semibold text-xs text-foreground transition-all flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span>Recover Cluster</span>
            </button>
          </div>
        </div>

        {/* Raft protocol invariants & logs */}
        <div className="space-y-4 bg-background/50 p-6 rounded-2xl border border-border/70 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Core Raft Invariants
            </span>
            <div className="p-3.5 rounded-xl border border-border/60 bg-background/40 text-xs text-foreground-secondary space-y-1.5 leading-relaxed">
              <p>
                <strong>Leader Completeness:</strong> A candidate can only win an election if its log is at least as up-to-date as any other node in the majority.
              </p>
              <p>
                <strong>At Most One Leader per Term:</strong> Each node votes for at most one candidate per term, preventing split-brain leadership.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Election Audit Log
            </span>
            <div className="h-36 overflow-y-auto space-y-1 text-xs font-mono">
              {electionLog.map((log, i) => (
                <div key={i} className="p-1.5 rounded bg-muted/40 text-foreground-secondary">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
