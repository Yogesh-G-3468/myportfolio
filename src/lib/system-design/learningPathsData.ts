export interface LearningPath {
  slug: string;
  title: string;
  duration: string;
  role: string;
  summary: string;
  recommendedAudience: string;
  milestones: {
    week: string;
    title: string;
    description: string;
    topicSlugs: { module: string; topic: string; title: string; priority: string }[];
  }[];
}

export const LEARNING_PATHS: Record<string, LearningPath> = {
  backend: {
    slug: "backend",
    title: "Backend Systems Engineer Track",
    duration: "4–6 Weeks",
    role: "Mid/Senior Backend Engineer",
    summary: "The definitive track for backend software engineers: API architectures, database internals (B-trees, LSM, replication, sharding), distributed caching, messaging backbones (Kafka), and resilience patterns.",
    recommendedAudience: "Engineers building REST/gRPC backends, microservices, and high-throughput data layers.",
    milestones: [
      {
        week: "Week 1",
        title: "API Paradigms, Resilience & Rate Limiting",
        description: "Master REST vs GraphQL vs gRPC, idempotency keys, retries with jitter, and distributed rate limiting algorithms.",
        topicSlugs: [
          { module: "api-design", topic: "rate-limiting-algorithms", title: "Rate Limiting Algorithms (Token Bucket, Leaky Bucket, Sliding Window)", priority: "P0" },
          { module: "foundations", topic: "back-of-envelope-estimation", title: "Back-of-the-Envelope Capacity Estimations", priority: "P0" },
        ],
      },
      {
        week: "Week 2",
        title: "Distributed Caching & In-Memory Architectures",
        description: "Cache-Aside, Write-Through, Write-Behind, eviction policies (LRU/LFU/ARC), stampede mitigations, and Redis cluster internals.",
        topicSlugs: [
          { module: "caching", topic: "caching-strategies", title: "Caching Strategies & Invalidation", priority: "P0" },
          { module: "technology-comparisons", topic: "tech-redis", title: "Redis Deep Dive: Event Loop, Memory, and Clustering", priority: "P1" },
        ],
      },
      {
        week: "Week 3",
        title: "High-Volume Messaging & Asynchronous Event Sinks",
        description: "Broker trade-offs (Kafka vs RabbitMQ vs SQS), partition design, consumer groups, KRaft, and transactional outbox patterns.",
        topicSlugs: [
          { module: "technology-comparisons", topic: "comp-kafka-vs-rabbitmq-vs-sqs", title: "Comparison: Kafka vs RabbitMQ vs SQS vs Pulsar", priority: "P1" },
          { module: "landmark-papers", topic: "paper-amazon-dynamo", title: "Amazon Dynamo Landmark Architecture Paper", priority: "P2" },
        ],
      },
      {
        week: "Week 4",
        title: "Production Case Studies: Infrastructure Primitives",
        description: "Design high-scale infrastructure: URL Shorteners, Rate Limiter Services, and Distributed Unique ID Generators.",
        topicSlugs: [
          { module: "case-studies", topic: "case-url-shortener", title: "High-Level Design: Bitly URL Shortener", priority: "P0" },
          { module: "lld", topic: "lld-parking-lot", title: "Low-Level Design: Parking Lot Controller", priority: "P0" },
        ],
      },
    ],
  },
  genai: {
    slug: "genai",
    title: "GenAI & LLM Systems Engineer Track",
    duration: "3–4 Weeks",
    role: "AI & Machine Learning Systems Engineer",
    summary: "Architecting scalable infrastructure for generative AI: Tokenization, KV caching, continuous batching (vLLM), PagedAttention, Vector databases, RAG end-to-end, and multi-agent coordination.",
    recommendedAudience: "Engineers building enterprise RAG platforms, LLM serving gateways, and autonomous agents.",
    milestones: [
      {
        week: "Week 1",
        title: "LLM Inference Internals & Serving Systems",
        description: "Prefill vs decode phases, KV cache GPU memory bounds, continuous batching, and speculative decoding.",
        topicSlugs: [
          { module: "caching", topic: "caching-strategies", title: "Semantic Caching & In-Memory Tiers", priority: "P0" },
          { module: "api-design", topic: "rate-limiting-algorithms", title: "Token-Based Cost & Rate Limiting for LLM APIs", priority: "P0" },
        ],
      },
      {
        week: "Week 2",
        title: "Enterprise RAG & Hybrid Vector Search",
        description: "Chunking strategies, embeddings, HNSW vector search, BM25 hybrid ranking, and permission-aware retrieval (ACLs).",
        topicSlugs: [
          { module: "technology-comparisons", topic: "tech-redis", title: "In-Memory Vector Indexes and Semantic Caching", priority: "P1" },
          { module: "landmark-papers", topic: "paper-amazon-dynamo", title: "Consistent Distributed Storage Backends", priority: "P2" },
        ],
      },
      {
        week: "Week 3",
        title: "Case Studies: LLM Gateways & Autonomous Agents",
        description: "Designing multi-provider LLM gateways, streaming SSE responses, tool execution sandboxes, and circuit-breakers.",
        topicSlugs: [
          { module: "case-studies", topic: "case-url-shortener", title: "Foundational Microservice Gateway Architecture", priority: "P0" },
          { module: "lld", topic: "lld-parking-lot", title: "Object-Oriented Design & State Management", priority: "P0" },
        ],
      },
    ],
  },
  staff: {
    slug: "staff",
    title: "Senior & Staff Architect Track",
    duration: "6–8 Weeks",
    role: "Staff / Principal / Chief Architect",
    summary: "High-stakes distributed engineering: Multi-datacenter active-active, consensus protocols (Raft, Paxos), disaster recovery (RPO/RTO), metastable failure control, and enterprise cloud FinOps.",
    recommendedAudience: "Senior engineers preparing for Staff+ architecture reviews and leadership interview loops.",
    milestones: [
      {
        week: "Week 1–2",
        title: "Consensus, Distributed Ordering & Time",
        description: "Raft protocol deep-dive, Paxos intuition, Google TrueTime, Lamport timestamps, and distributed locking with fencing tokens.",
        topicSlugs: [
          { module: "landmark-papers", topic: "paper-amazon-dynamo", title: "Amazon Dynamo Paper: Sloppy Quorums and Vector Clocks", priority: "P2" },
          { module: "api-design", topic: "rate-limiting-algorithms", title: "Distributed Consensus & Rate Limit Coordination", priority: "P0" },
        ],
      },
      {
        week: "Week 3–4",
        title: "High-Availability, Multi-Region & Cell Architectures",
        description: "Active-Active multi-region topologies, cell-based architectures, shuffle sharding, and blast radius containment.",
        topicSlugs: [
          { module: "technology-comparisons", topic: "comp-kafka-vs-rabbitmq-vs-sqs", title: "Multi-Cluster Message Federation", priority: "P1" },
          { module: "caching", topic: "caching-strategies", title: "Multi-Tier Caching & Geo-Distribution", priority: "P0" },
        ],
      },
      {
        week: "Week 5–6",
        title: "Staff-Level Case Studies & System Defense",
        description: "Designing mission-critical distributed systems end-to-end, defending design decisions, and navigating technical debt.",
        topicSlugs: [
          { module: "case-studies", topic: "case-url-shortener", title: "Bitly URL Shortener: Global Scaling Evolution", priority: "P0" },
          { module: "technology-comparisons", topic: "tech-redis", title: "Redis Enterprise Clustering Internals", priority: "P1" },
        ],
      },
    ],
  },
  fresher: {
    slug: "fresher",
    title: "Fresher & Interview Sprint Track",
    duration: "2 Weeks",
    role: "Junior / SDE-1 / College Graduate",
    summary: "Fast-track interview preparation: Master back-of-the-envelope capacity calculations, the 45-minute interview framework, and core high-frequency case studies.",
    recommendedAudience: "Students, bootcamp grads, and junior engineers preparing for upcoming technical interviews.",
    milestones: [
      {
        week: "Week 1",
        title: "Core Foundations & Back-of-Envelope Math",
        description: "Learn QPS, storage sizing, read/write ratios, cache 80/20 rule, and how to structure a 45-minute interview without freezing.",
        topicSlugs: [
          { module: "caching", topic: "caching-strategies", title: "Caching Fundamentals & Strategies", priority: "P0" },
          { module: "api-design", topic: "rate-limiting-algorithms", title: "Rate Limiting Basics & Algorithms", priority: "P0" },
        ],
      },
      {
        week: "Week 2",
        title: "Top Case Studies & LLD Patterns",
        description: "Master the canonical interview designs: URL Shorteners, Parking Lots, and in-memory caches.",
        topicSlugs: [
          { module: "case-studies", topic: "case-url-shortener", title: "URL Shortener Full 13-Step Case Study", priority: "P0" },
          { module: "lld", topic: "lld-parking-lot", title: "Parking Lot Low-Level Design with Class Diagram", priority: "P0" },
        ],
      },
    ],
  },
};
