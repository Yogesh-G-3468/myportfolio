"use client";

import { useState } from "react";
import { Calculator, Server, HardDrive, Wifi, Database } from "lucide-react";

export default function BackOfEnvelopeLab() {
  const [dau, setDau] = useState<number>(50); // Millions DAU
  const [reqPerUser, setReqPerUser] = useState<number>(20); // Requests per user per day
  const [readRatio, setReadRatio] = useState<number>(80); // Read % (80/20)
  const [avgPayloadKb, setAvgPayloadKb] = useState<number>(5); // KB
  const [replicationFactor, setReplicationFactor] = useState<number>(3);
  const [retentionYears, setRetentionYears] = useState<number>(5);
  const [peakMultiplier, setPeakMultiplier] = useState<number>(2);

  // Calculations:
  // Total daily requests = DAU * 10^6 * reqPerUser
  const totalDailyReq = dau * 1_000_000 * reqPerUser;
  const avgQps = Math.round(totalDailyReq / 86400);
  const peakQps = Math.round(avgQps * peakMultiplier);
  const readQps = Math.round((avgQps * readRatio) / 100);
  const writeQps = avgQps - readQps;

  // Bandwidth: avgQps * avgPayloadKb KB/s -> MB/s
  const bandwidthMbSec = ((avgQps * avgPayloadKb) / 1024).toFixed(2);
  const peakBandwidthMbSec = ((peakQps * avgPayloadKb) / 1024).toFixed(2);

  // Storage: Daily writes * payload * replication * 365 * retentionYears
  const dailyWriteReq = (totalDailyReq * (100 - readRatio)) / 100;
  const dailyStorageBytes = dailyWriteReq * (avgPayloadKb * 1024) * replicationFactor;
  const yearlyStorageTb = (dailyStorageBytes * 365) / (1024 * 1024 * 1024 * 1024);
  const totalStorageTb = (yearlyStorageTb * retentionYears).toFixed(1);

  // Cache: 20% of daily reads cached in memory (80/20 rule)
  const dailyReadReq = (totalDailyReq * readRatio) / 100;
  const cacheBytes = dailyReadReq * 0.2 * (avgPayloadKb * 1024);
  const cacheGb = (cacheBytes / (1024 * 1024 * 1024)).toFixed(1);

  // Server count: assume 1 standard container/server handles ~2,000 QPS
  const serverCount = Math.max(2, Math.ceil(peakQps / 2000));

  return (
    <div className="rounded-3xl border border-border bg-background-elevated p-6 sm:p-8 space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
          <Calculator className="w-4 h-4" />
          Interactive Simulator 1
        </div>
        <h3 className="text-2xl font-bold text-foreground">
          Back-of-the-Envelope Capacity Estimator
        </h3>
        <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed">
          Tweak active users, request ratios, payload sizes, and replication factors to instantly calculate production throughput, storage sizing, bandwidth requirements, and server fleet sizes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sliders and Controls */}
        <div className="space-y-5 bg-background/50 p-6 rounded-2xl border border-border/70">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Daily Active Users (DAU)</span>
              <span className="text-accent font-mono">{dau} Million</span>
            </div>
            <input
              type="range"
              min="1"
              max="500"
              value={dau}
              onChange={(e) => setDau(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Requests per User / Day</span>
              <span className="text-accent font-mono">{reqPerUser} req/day</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={reqPerUser}
              onChange={(e) => setReqPerUser(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Read / Write Ratio</span>
              <span className="text-accent font-mono">
                {readRatio}% Read / {100 - readRatio}% Write
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="99"
              value={readRatio}
              onChange={(e) => setReadRatio(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Average Request Payload Size</span>
              <span className="text-accent font-mono">{avgPayloadKb} KB</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={avgPayloadKb}
              onChange={(e) => setAvgPayloadKb(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold block mb-1">Replication Factor</label>
              <select
                value={replicationFactor}
                onChange={(e) => setReplicationFactor(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-xs font-medium"
              >
                <option value={1}>1x (No replication)</option>
                <option value={2}>2x (Multi-zone)</option>
                <option value={3}>3x (Standard production)</option>
                <option value={5}>5x (Global quorum)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1">Storage Retention</label>
              <select
                value={retentionYears}
                onChange={(e) => setRetentionYears(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-border bg-background text-xs font-medium"
              >
                <option value={1}>1 Year</option>
                <option value={3}>3 Years</option>
                <option value={5}>5 Years</option>
                <option value={10}>10 Years</option>
              </select>
            </div>
          </div>
        </div>

        {/* Real-time Math Output Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl border border-border bg-background/40 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Server size={13} className="text-accent" /> Throughput (QPS)
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
              {avgQps.toLocaleString()}
            </div>
            <p className="text-[11px] text-foreground-secondary">
              Peak (~{peakMultiplier}x): <strong className="text-accent">{peakQps.toLocaleString()} QPS</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-background/40 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Wifi size={13} className="text-blue-500" /> Network Bandwidth
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
              {bandwidthMbSec} <span className="text-xs font-sans text-muted-foreground">MB/s</span>
            </div>
            <p className="text-[11px] text-foreground-secondary">
              Peak: <strong className="text-foreground">{peakBandwidthMbSec} MB/s</strong>
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-background/40 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <HardDrive size={13} className="text-emerald-500" /> Total Storage ({retentionYears}y)
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
              {totalStorageTb} <span className="text-xs font-sans text-muted-foreground">TB</span>
            </div>
            <p className="text-[11px] text-foreground-secondary">
              With {replicationFactor}x redundancy
            </p>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-background/40 space-y-1">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
              <Database size={13} className="text-purple-500" /> 80/20 Cache Memory
            </span>
            <div className="text-xl sm:text-2xl font-black font-mono text-foreground">
              {cacheGb} <span className="text-xs font-sans text-muted-foreground">GB</span>
            </div>
            <p className="text-[11px] text-foreground-secondary">
              Fleet size: ~<strong className="text-foreground">{serverCount} servers</strong> (@2k QPS/server)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
