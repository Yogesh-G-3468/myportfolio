# Yogeshwaran G — Portfolio & System Design Hub

Personal portfolio and comprehensive **System Design Hub** built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

---

## 🚀 Features

- **Personal Portfolio**: Showcase of full-stack, data engineering, and GenAI platforms.
- **DSA Patterns**: Interactive data structures & algorithms pattern study engine.
- **System Design Hub (`/system-design`)**:
  - **Complete 24-Module Architecture Curriculum**: High-Level Design (HLD) case studies, Low-Level Design (LLD), distributed theory, and technology deep-dives.
  - **Zero-Gap Content Pipeline**: Validated against `content/system-design/_curriculum.yaml`.
  - **Interactive Labs (`/system-design/labs`)**: 8 client-side simulators (Back-of-envelope calculator, Rate limiter, Consistent hash ring, Cache eviction, Load balancer, Bloom filter, CAP consistency explorer, and Raft leader election).
  - **Practice & Mock Mode (`/system-design/practice`)**: Leitner-box spaced repetition flashcards and a 45-minute timed mock interview simulator.
  - **Master Cheat Sheets (`/system-design/cheatsheets`)**: Latency numbers, DB decision matrices, and isolation anomalies.
  - **A–Z Glossary (`/system-design/glossary`)**: Over 500+ rigorously defined terms.
  - **Client-Side Search**: Full-text search with `Ctrl/Cmd + K` and filter chips.
  - **Progress Persistence**: Auto-saved completion tracking with JSON Export and Import.

---

## 🛠️ How to Add a New Topic to System Design Hub

1. Add the curriculum item to `content/system-design/_curriculum.yaml` under the appropriate module.
2. Create a Markdown file in `content/system-design/<module-slug>/<topic-slug>.md` with front matter:

```yaml
---
title: "Token Bucket Rate Limiting"
module: "api-design"
moduleTitle: "Module 5: API Design and Communication"
type: "concept" # concept | deep-dive | comparison | technology | case-study | lld | paper | cheatsheet | playbook
order: 8
level: "intermediate" # beginner | intermediate | advanced
priority: "P0" # P0 interview-core | P1 important | P2 breadth
readingTime: 14
tags: ["rate-limiting", "redis"]
prerequisites: ["hashing-basics"]
relatedTopics: ["distributed-rate-limiter"]
covers:
  - "Rate Limiting Algorithms: Token Bucket, Leaky Bucket, Sliding Window Log, Sliding Window Counter, and GCRA"
glossaryTerms: ["Token Bucket", "429"]
lastReviewed: "2026-10-25"
summary: "1-2 sentence high-impact summary."
quiz:
  - question: "Question text?"
    options: ["Option A", "Option B", "Option C", "Option D"]
    answer: 0
    explanation: "Why A is correct."
---
```

3. Run the content validator:
```bash
npm run validate:content
```

4. Regenerate the coverage matrix:
```bash
npm run report:coverage
```

---

## 🧪 Development, Validation & Build Commands

```bash
# Run local development server
npm run dev

# Run strict content validator
npm run validate:content

# Generate curriculum coverage matrix
npm run report:coverage

# Build optimized production bundle
npm run build

# Start production server
npm run start
```
