# System Design Hub: Gap-Hunt Analysis and Audit Report

This report documents the rigorous multi-pass gap sweeps executed across the System Design Hub curriculum, cross-referenced against landmark systems literature, enterprise cloud architectures, and modern production failure modes.

---

## 1. Sweep Methodologies Applied

### Pass 1: End-to-End Layer Sweep
*Followed the lifecycle of a request: Client → DNS → Anycast Edge CDN → L4/L7 Load Balancer → API Gateway → Service Mesh → Microservice → In-Memory Cache → Distributed Queue → Sharded Database → Cold Storage / Data Lake → SRE Monitoring.*
- **Findings & Additions**:
  - Added **GCRA (Generic Cell Rate Algorithm)** to rate limiting alongside token bucket and sliding window.
  - Added **QUIC and HTTP/3 Head-of-Line Blocking** solutions to Module 4.
  - Added **Change Data Capture (CDC)** invalidation pipelines to Module 7.
  - Added **Singleflight (Request Coalescing)** to cache stampede defenses.

### Pass 2: The "-ilities" Non-Functional Sweep
*Audited Scalability, Availability, Reliability, Durability, Latency, Observability, Extensibility, Operability, Security, Privacy, and FinOps across all modules.*
- **Findings & Additions**:
  - Ensured every HLD case study includes an explicit **Section 10: Cross-Cutting Concerns (Security, Privacy, Observability, Cost)**.
  - Added **FinOps cloud unit economics** (egress costs, spot/reserved pricing) to Module 13.
  - Added **Differential Privacy, PII masking, and India's DPDP Act** alongside GDPR to Module 15.

### Pass 3: Failure & Overload Control Sweep
*Asked: "What fails, how is it detected, and how is it mitigated?" for every architectural layer.*
- **Findings & Additions**:
  - Added **Metastable Failures** (feedback loops during incident recovery) to Module 12.
  - Added **Retry Budgets and Jittered Exponential Backoff** to prevent retry storms.
  - Added **Shuffle Sharding** for noisy neighbor and poison pill blast-radius containment.

### Pass 4: Scale-Step Sweep (1 → 10k → 1M → 100M → Global)
*Ensured every step in growth has an explicit taught architectural solution.*
- **Findings & Additions**:
  - Single server → Separate DB tier → Load Balancers → In-memory Cache → Read Replicas → Sharded Database → Message Queues → Multi-Region Active-Active.

### Pass 5: Reference Literature & TOC Audit
*Cross-referenced against:*
- *Designing Data-Intensive Applications* (Kleppmann): Replication, Partitioning, Transactions, Consensus, Batch, Stream.
- *System Design Interview* (Alex Xu, Vols 1 & 2): All case studies captured in Module 23.
- *Site Reliability Engineering* (Google): Four Golden Signals, Burn-rate alerting, Error budgets.
- *Database Internals* (Petrov): B+Tree vs LSM-tree internals, SSTables, Bloom filters.
- *Designing Machine Learning Systems* (Chip Huyen): Feature stores, training-serving skew, continuous batching.

---

## 2. Summary of Gap Additions Recorded

| Layer / Domain | Concept Added | Module Placement | Rationale |
| :--- | :--- | :--- | :--- |
| **GenAI Systems** | Continuous Batching & PagedAttention | Module 19 | Essential for modern LLM serving interview questions (vLLM architecture). |
| **GenAI Systems** | Permission-Aware RAG (ACL Filtering) | Module 19 | Enterprise document retrieval must respect role-based access control. |
| **API Gateways** | Token-Based Cost Limiting | Module 5 | Rate limiters must meter prompt/completion token weights, not just raw HTTP requests. |
| **Distributed Systems** | Fencing Tokens | Module 9 | Critical to prevent split-brain writes during GC pauses with distributed locks. |
| **Databases** | Online Schema Migrations (Expand-Contract) | Module 6 | Zero-downtime DB migrations with gh-ost and pt-online-schema-change. |
| **Security** | LLM Prompt Injection & Tool Guardrails | Module 15 | OWASP LLM Top 10 security threats. |

---

## 3. Backlink Verification
- Every concept page auto-computes backlinks to case studies referencing its curriculum tags.
- Every case study lists foundational concepts used in Section 12.
