import Link from "next/link";
import { ChevronRight, FlaskConical, Sparkles } from "lucide-react";
import BackOfEnvelopeLab from "@/components/system-design/labs/BackOfEnvelopeLab";
import RateLimiterLab from "@/components/system-design/labs/RateLimiterLab";
import ConsistentHashingLab from "@/components/system-design/labs/ConsistentHashingLab";
import CacheEvictionLab from "@/components/system-design/labs/CacheEvictionLab";
import LoadBalancerLab from "@/components/system-design/labs/LoadBalancerLab";
import BloomFilterLab from "@/components/system-design/labs/BloomFilterLab";
import CapExplorerLab from "@/components/system-design/labs/CapExplorerLab";
import RaftVisualizerLab from "@/components/system-design/labs/RaftVisualizerLab";

export const metadata = {
  title: "Interactive System Design Labs — 8 Hands-on Simulators",
  description:
    "Test distributed systems algorithms in real-time: Back-of-envelope calculations, Rate limiters, Consistent hashing, Cache eviction, Load balancers, Bloom filters, CAP quorum, and Raft consensus.",
};

export default function LabsPage() {
  return (
    <div className="w-full max-w-[1100px] mx-auto py-4 px-2 sm:px-6 space-y-12">
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
        <span className="text-foreground">Interactive Labs</span>
      </div>

      {/* Header */}
      <div className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-xs font-semibold">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Hands-on Systems Laboratory</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          8 Interactive System Design Labs
        </h1>

        <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed max-w-3xl">
          Theoretical architecture concepts become intuitive when you can tweak the knobs yourself. These client-side simulators allow you to experiment with capacity math, rate limiting bursts, consistent hash rings, cache eviction traces, and distributed consensus elections.
        </p>
      </div>

      {/* 8 Simulators Stack */}
      <div className="space-y-12">
        <BackOfEnvelopeLab />
        <RateLimiterLab />
        <ConsistentHashingLab />
        <CacheEvictionLab />
        <LoadBalancerLab />
        <BloomFilterLab />
        <CapExplorerLab />
        <RaftVisualizerLab />
      </div>
    </div>
  );
}
