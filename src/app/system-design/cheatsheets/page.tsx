import Link from "next/link";
import { FileText, ChevronRight, Zap, Database, Server, Shield, Layers } from "lucide-react";

export const metadata = {
  title: "System Design Cheat Sheets — Quick Reference Guides",
  description:
    "Latency numbers every engineer should know, database selection matrix, cache strategies, ACID isolation anomalies, and the 13-step case study blueprint.",
};

export default function CheatSheetsPage() {
  return (
    <div className="w-full max-w-[1000px] mx-auto py-4 px-2 sm:px-6 space-y-12">
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
        <span className="text-foreground">Master Cheat Sheets</span>
      </div>

      {/* Header */}
      <div className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
          <FileText className="w-3.5 h-3.5" />
          <span>High-Density Reference Sheets</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
          System Design Master Cheat Sheets
        </h1>

        <p className="text-base sm:text-lg text-foreground-secondary leading-relaxed max-w-3xl">
          Consolidated decision matrices, latency reference numbers, isolation anomalies, and architectural blueprints designed for quick review before engineering reviews and interview loops.
        </p>
      </div>

      {/* Sheet 1: Latency Numbers Every Systems Engineer Should Know */}
      <section className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
            <Zap size={14} />
            Hardware & Network Latency Cheat Sheet
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Latency Numbers Every Systems Engineer Should Know
          </h2>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Mental orders of magnitude essential for back-of-the-envelope capacity estimations.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-muted text-foreground font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-3.5 border-b border-border">Operation</th>
                <th className="p-3.5 border-b border-border">Typical Latency</th>
                <th className="p-3.5 border-b border-border font-mono">Scaled to Human Time (1ns = 1s)</th>
                <th className="p-3.5 border-b border-border">Architectural Takeaway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono text-xs">
              <tr>
                <td className="p-3.5 font-sans font-medium text-foreground">L1 CPU Cache Reference</td>
                <td className="p-3.5 text-accent font-bold">0.5 – 1 ns</td>
                <td className="p-3.5 text-foreground-secondary">1 second</td>
                <td className="p-3.5 font-sans text-foreground-secondary">Keep hot data in L1/L2 cache lines</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-medium text-foreground">Branch Misprediction</td>
                <td className="p-3.5 text-accent font-bold">3 – 5 ns</td>
                <td className="p-3.5 text-foreground-secondary">3 – 5 seconds</td>
                <td className="p-3.5 font-sans text-foreground-secondary">Branch predictor pipeline stall</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-medium text-foreground">L2 CPU Cache Reference</td>
                <td className="p-3.5 text-accent font-bold">4 – 7 ns</td>
                <td className="p-3.5 text-foreground-secondary">7 seconds</td>
                <td className="p-3.5 font-sans text-foreground-secondary">~14x slower than L1</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-medium text-foreground">Mutex Lock / Unlock</td>
                <td className="p-3.5 text-accent font-bold">17 – 25 ns</td>
                <td className="p-3.5 text-foreground-secondary">25 seconds</td>
                <td className="p-3.5 font-sans text-foreground-secondary">Prefer atomic CAS or lock-free channels</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-medium text-foreground">Main Memory (RAM) Access</td>
                <td className="p-3.5 text-accent font-bold">100 ns</td>
                <td className="p-3.5 text-foreground-secondary">1.7 minutes</td>
                <td className="p-3.5 font-sans text-foreground-secondary">Redis / Memcached in-memory lookup bound</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-medium text-foreground">Compress 1KB (Zstandard)</td>
                <td className="p-3.5 text-accent font-bold">2,000 ns (2 µs)</td>
                <td className="p-3.5 text-foreground-secondary">33 minutes</td>
                <td className="p-3.5 font-sans text-foreground-secondary">Saves network bandwidth at low CPU cost</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-medium text-foreground">SSD Random Read (NVMe)</td>
                <td className="p-3.5 text-accent font-bold">16,000 ns (16 µs)</td>
                <td className="p-3.5 text-foreground-secondary">4.4 hours</td>
                <td className="p-3.5 font-sans text-foreground-secondary">Fast random disk seek baseline</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-medium text-foreground">Read 1MB Sequentially (RAM)</td>
                <td className="p-3.5 text-accent font-bold">250,000 ns (250 µs)</td>
                <td className="p-3.5 text-foreground-secondary">2.9 days</td>
                <td className="p-3.5 font-sans text-foreground-secondary">Sequential RAM throughput ~4 GB/s</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-medium text-foreground">Same Datacenter Round Trip</td>
                <td className="p-3.5 text-accent font-bold">500,000 ns (0.5 ms)</td>
                <td className="p-3.5 text-foreground-secondary">5.8 days</td>
                <td className="p-3.5 font-sans text-foreground-secondary">Internal microservice RPC budget</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-medium text-foreground">Disk Seek (Rotational HDD)</td>
                <td className="p-3.5 text-accent font-bold">10,000,000 ns (10 ms)</td>
                <td className="p-3.5 text-foreground-secondary">3.8 months</td>
                <td className="p-3.5 font-sans text-foreground-secondary">Avoid random HDD I/O; use LSM trees</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-medium text-foreground">US East to US West RTT</td>
                <td className="p-3.5 text-accent font-bold">60,000,000 ns (60 ms)</td>
                <td className="p-3.5 text-foreground-secondary">1.9 years</td>
                <td className="p-3.5 font-sans text-foreground-secondary">Speed of light in fiber limitation</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-medium text-foreground">US to Europe Transatlantic RTT</td>
                <td className="p-3.5 text-accent font-bold">150,000,000 ns (150 ms)</td>
                <td className="p-3.5 text-foreground-secondary">4.8 years</td>
                <td className="p-3.5 font-sans text-foreground-secondary">Requires CDN edge termination & local DB reads</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Sheet 2: Database Selection Matrix */}
      <section className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
            <Database size={14} />
            Storage Engine Cheat Sheet
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Database Selection Decision Matrix
          </h2>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Pick the right storage paradigm by access patterns and consistency guarantees.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-muted text-foreground font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-3.5 border-b border-border">Category</th>
                <th className="p-3.5 border-b border-border">Primary Products</th>
                <th className="p-3.5 border-b border-border">Ideal Access Pattern</th>
                <th className="p-3.5 border-b border-border">Weakness / When NOT to use</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              <tr>
                <td className="p-3.5 font-bold text-foreground">Relational (RDBMS)</td>
                <td className="p-3.5 font-mono text-accent">PostgreSQL, MySQL</td>
                <td className="p-3.5 text-foreground-secondary">Complex joins, strict ACID transactions, audit ledgers, structured relational schemas.</td>
                <td className="p-3.5 text-foreground-secondary">Horizontal writes beyond single master IOPS require sharding complexity (Vitess/Citus).</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-foreground">Key-Value Store</td>
                <td className="p-3.5 font-mono text-accent">Redis, DynamoDB, Aerospike</td>
                <td className="p-3.5 text-foreground-secondary">Sub-millisecond point lookups by primary key (O(1)), sessions, caching, token buckets.</td>
                <td className="p-3.5 text-foreground-secondary">Complex multi-field queries, relational joins, table scans.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-foreground">Wide-Column (LSM)</td>
                <td className="p-3.5 font-mono text-accent">Cassandra, ScyllaDB, HBase</td>
                <td className="p-3.5 text-foreground-secondary">Massive append-only write volumes (1M+ writes/sec), time-series IoT, partition keys.</td>
                <td className="p-3.5 text-foreground-secondary">No cross-partition joins; secondary indexes suffer from scatter-gather overhead.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-foreground">Document Store</td>
                <td className="p-3.5 font-mono text-accent">MongoDB, Couchbase</td>
                <td className="p-3.5 text-foreground-secondary">Polymorphic, hierarchical data, product catalogs with evolving JSON attributes.</td>
                <td className="p-3.5 text-foreground-secondary">Unbounded document growth causes B-tree re-allocations; cross-document consistency overhead.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-foreground">Column-Oriented (OLAP)</td>
                <td className="p-3.5 font-mono text-accent">ClickHouse, Snowflake, BigQuery</td>
                <td className="p-3.5 text-foreground-secondary">Analytical aggregate queries (SUM, AVG) over billions of rows; ad-click rollups.</td>
                <td className="p-3.5 text-foreground-secondary">Single-row point updates/deletes; transactional OLTP workloads.</td>
              </tr>
              <tr>
                <td className="p-3.5 font-bold text-foreground">Distributed SQL (NewSQL)</td>
                <td className="p-3.5 font-mono text-accent">Google Spanner, CockroachDB</td>
                <td className="p-3.5 text-foreground-secondary">Global horizontal scale with strict serializable ACID transactions across regions.</td>
                <td className="p-3.5 text-foreground-secondary">Higher write latency due to multi-Paxos/Raft consensus and TrueTime commit-wait.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Sheet 3: Isolation Anomalies Matrix */}
      <section className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
            <Shield size={14} />
            ACID Concurrency Cheat Sheet
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            Transaction Isolation Levels vs Phenomena
          </h2>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            ANSI SQL isolation levels and the concurrency anomalies they allow or prevent.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-muted text-foreground font-semibold uppercase text-[11px]">
              <tr>
                <th className="p-3.5 border-b border-border">Isolation Level</th>
                <th className="p-3.5 border-b border-border">Dirty Read</th>
                <th className="p-3.5 border-b border-border">Non-Repeatable Read</th>
                <th className="p-3.5 border-b border-border">Phantom Read</th>
                <th className="p-3.5 border-b border-border">Write Skew</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono text-xs">
              <tr>
                <td className="p-3.5 font-sans font-bold text-foreground">Read Uncommitted</td>
                <td className="p-3.5 text-red-500 font-bold">Allowed</td>
                <td className="p-3.5 text-red-500 font-bold">Allowed</td>
                <td className="p-3.5 text-red-500 font-bold">Allowed</td>
                <td className="p-3.5 text-red-500 font-bold">Allowed</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-bold text-foreground">Read Committed (Postgres Default)</td>
                <td className="p-3.5 text-green-500 font-bold">Prevented</td>
                <td className="p-3.5 text-red-500 font-bold">Allowed</td>
                <td className="p-3.5 text-red-500 font-bold">Allowed</td>
                <td className="p-3.5 text-red-500 font-bold">Allowed</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-bold text-foreground">Repeatable Read (MySQL Default)</td>
                <td className="p-3.5 text-green-500 font-bold">Prevented</td>
                <td className="p-3.5 text-green-500 font-bold">Prevented</td>
                <td className="p-3.5 text-green-500 font-bold">Prevented (MVCC)</td>
                <td className="p-3.5 text-red-500 font-bold">Allowed</td>
              </tr>
              <tr>
                <td className="p-3.5 font-sans font-bold text-foreground">Serializable (Strict SSI / 2PL)</td>
                <td className="p-3.5 text-green-500 font-bold">Prevented</td>
                <td className="p-3.5 text-green-500 font-bold">Prevented</td>
                <td className="p-3.5 text-green-500 font-bold">Prevented</td>
                <td className="p-3.5 text-green-500 font-bold">Prevented</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Sheet 4: 13-Step Case Study Blueprint */}
      <section className="bg-background-elevated border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-accent uppercase tracking-wider">
            <Layers size={14} />
            Interview Framework
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            The Fixed 13-Step Case Study Blueprint
          </h2>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Every case study in this hub and in senior engineering interviews follows this exact battle-tested framework.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {[
            { step: "01", title: "Problem Statement & Clarifying Questions", desc: "Scope boundaries, target users, scale targets, and explicit constraints." },
            { step: "02", title: "Functional & Non-Functional Requirements", desc: "Core use cases vs latency (p99), availability (nines), durability, and compliance." },
            { step: "03", title: "Capacity Estimation (Math Shown)", desc: "QPS (avg & peak), daily write storage, retention, network bandwidth, and cache sizing." },
            { step: "04", title: "API Design & Protocol Choice", desc: "Resource endpoints, REST/gRPC schemas, idempotency keys, and error status codes." },
            { step: "05", title: "Data Model & Database Selection", desc: "Schema, indexing strategy, B-Tree vs LSM justification, and rejected alternatives." },
            { step: "06", title: "High-Level Architecture (Mermaid)", desc: "End-to-end component diagram showing Clients, CDN, LB, Gateway, Services, Cache, and DB." },
            { step: "07", title: "Deep Dives into 2–4 Core Hard Parts", desc: "Concurrency race conditions, distributed locking, cache stampede prevention." },
            { step: "08", title: "Scaling Evolution (v1 → 10x → 100x)", desc: "From monolith to sharded clusters, cell-based architecture, and read replicas." },
            { step: "09", title: "Bottlenecks, Failure Modes & Hot Spots", desc: "What breaks when traffic surges 10x, single points of failure, partition tolerance." },
            { step: "10", title: "Cross-Cutting Security, Privacy & SLOs", desc: "Authentication, encryption at rest/transit, PII masking, metrics, and alerting." },
            { step: "11", title: "Trade-offs & Alternatives Considered", desc: "Why we picked X over Y; what changes under different latency/cost constraints." },
            { step: "12", title: "Concepts Used (Cross-links)", desc: "Direct backlinks to foundational concept guides used in the design." },
            { step: "13", title: "Interview Follow-ups (8–12 Questions)", desc: "Model answers to deep probe questions asked by interviewers." },
          ].map((item) => (
            <div key={item.step} className="p-3.5 rounded-2xl border border-border/80 bg-background/50 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-accent font-bold text-xs">{item.step}.</span>
                <span className="font-bold text-foreground text-sm">{item.title}</span>
              </div>
              <p className="text-foreground-secondary text-xs leading-relaxed pl-5">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
