# System Design Hub: Style Guide and Content Standards

This style guide establishes the standards for writing, structuring, and maintaining content within the **System Design Hub**. Every page must adhere strictly to these guidelines to ensure book-quality instruction, zero-gap coverage, and an outstanding reading experience.

---

## 1. Tone and Voice

- **Technical, Authoritative, yet Approachable**: Write like a Principal Engineer mentoring a talented engineer. Be direct, clear, and technically precise without academic pretentiousness or colloquial filler.
- **First Principles First**: Always start with *why* a problem exists before explaining *how* a pattern solves it.
- **Relentless Focus on Trade-offs**: Never claim a technology or pattern is universally "better". Every choice has costs: latency vs throughput, consistency vs availability, memory vs CPU, simplicity vs flexibility. Always specify the conditions under which a solution succeeds or fails.
- **Concrete over Abstract**: Use real latency numbers (e.g., L1 cache ~1ns, RAM ~100ns, SSD ~100µs, cross-region RTT ~100ms), exact formulas, QPS calculations, and concrete bit layouts.
- **Truthfulness and Grounding**: Never fabricate benchmarks, paper citations, internal system architectures, or fake URLs. If a company architecture is discussed, label it as "commonly publicly described" and cite canonical engineering blog sources by name.

---

## 2. Structure and Formatting

### 2.1 Front Matter Schema
Every topic must provide valid YAML front matter:
```yaml
---
title: "Topic Title"
module: "module-slug"
moduleTitle: "Module Name"
type: "concept" # concept | deep-dive | comparison | technology | case-study | lld | paper | cheatsheet | playbook
order: 1
level: "intermediate" # beginner | intermediate | advanced
priority: "P0" # P0 interview-core | P1 important | P2 breadth/real-world
readingTime: 12
tags: ["tag-one", "tag-two"]
prerequisites: ["prereq-topic-slug"]
relatedTopics: ["related-topic-slug"]
covers:
  - "Curriculum Item Exact Title"
glossaryTerms: ["term1", "term2"]
lastReviewed: "2026-10-25"
summary: "1-2 sentence high impact summary."
quiz:
  - question: "Question text?"
    options: ["Option A", "Option B", "Option C", "Option D"]
    answer: 0
    explanation: "Why A is correct."
---
```

### 2.2 Heading Hierarchy
- Document title comes from the front matter `title` and is rendered as the primary `<h1>`.
- Use `##` for top-level template sections (e.g., `## TL;DR`, `## Why It Matters`, `## Core Concepts`).
- Use `###` for sub-sections.
- Every heading must be capitalized in Title Case and descriptive.

---

## 3. Mandatory Template Sections

### 3.1 Concept and Deep-Dive Pages
1. **TL;DR**: 3–5 bullet points summarizing core mechanics and takeaways.
2. **Why It Matters**: The operational problem, failure mode, or scale constraint that necessitated this concept.
3. **Core Concepts & Mental Models**: Mathematical definitions, taxonomy, invariants.
4. **How It Works**: Deep step-by-step internal workflow, accompanied by at least one **Mermaid diagram**.
5. **Variants and Sub-Topics**: In-depth analysis of variations (e.g., in rate limiting: Token Bucket vs Leaky Bucket vs Sliding Window).
6. **Trade-offs Table**: Comparison matrix covering Latency, Throughput, Memory, Operational Complexity, and Failure Risks.
7. **Real-World Examples**: Production usage in large systems (e.g., Stripe, Netflix, Google, Meta).
8. **Worked Example**: Back-of-the-envelope capacity math and/or clean TypeScript/Python implementation.
9. **Pitfalls, Anti-Patterns, and Failure Modes**: What breaks in production, cascading risks, and mitigation strategies.
10. **Interview Corner**: 5–10 curated questions tagged `[Basic]`, `[Intermediate]`, or `[Advanced]` with comprehensive model answers and common follow-ups.
11. **Cheat Sheet & Key Takeaways**: Quick-reference table or bullet recap.
12. **Used In**: Backlinks to case studies applying this concept.
13. **Further Reading**: Canonical books and papers (titles and authors only; no dead links).

### 3.2 High-Level Design (HLD) Case Studies (13 Fixed Sections)
1. Problem Statement & Clarifying Questions
2. Functional & Non-Functional Requirements (with explicit Out-of-Scope boundaries)
3. Capacity Estimation (Math shown step-by-step: QPS avg/peak, Storage with replication & retention, Bandwidth, Cache 80/20 rule, Server count)
4. API Design (HTTP/gRPC schemas, request/response, idempotency keys, rate limits, status codes)
5. Data Model & Storage Choice (Relational vs NoSQL vs Blob vs Cache with justification)
6. High-Level Architecture & End-to-End Sequence Diagram (Mermaid)
7. Deep Dives into 2–4 Core Architectural Hard Parts
8. Scaling Path (v1 MVP → 10x Scale → 100x Scale evolution)
9. Bottlenecks, Failure Scenarios & Edge Cases
10. Cross-Cutting Concerns (Security, Privacy/Compliance, Observability SLOs, Cost drivers)
11. Trade-Offs & Alternative Architectures Considered
12. Concepts Used (Links back to concept pages)
13. Interview Follow-ups (8–12 questions with model answers)

---

## 4. Visuals and Diagrams

- **Mermaid Diagrams**: Every deep dive, case study, and LLD page must have at least one valid, legible Mermaid diagram.
- **Theming**: Keep Mermaid diagrams responsive and compatible with both light and dark backgrounds.
- **Direction**: Prefer `graph TD` or `graph LR` with distinct node styling and clear labels.
- Sequence diagrams (`sequenceDiagram`) must show participant lifelines and synchronous/asynchronous message types.

---

## 5. Callouts Syntax

Use standardized GitHub-style blockquotes for callouts:
- `> [!NOTE]` — Explanatory context, historical background, or implementation details.
- `> [!TIP]` — Performance optimization tricks, latency wins, or best practices.
- `> [!WARNING]` — Traps, data loss risks, race conditions, or unhandled scale bottlenecks.
- `> [!IMPORTANT]` — Crucial invariants, architectural rules, or mandatory steps.
- `> [!CAUTION]` — High-risk operational pitfalls.

---

## 6. Code Style

- Use **TypeScript** for web, distributed primitives, and algorithmic models.
- Use **Java** or **TypeScript** for Low-Level Design (OOP patterns, interfaces, thread-safety).
- Use **Python** for ML/AI pipelines and quick data manipulation scripts.
- Code must be production-ready, typed, syntax-valid, and free of vague placeholders.
