export const personalInfo = {
  name: "Yogeshwaran G",
  title: "Solutions Enabler & Senior Software Engineer",
  tagline: "Solutions Enabler & Senior Software Engineer building GenAI platforms and data pipelines.",
  description:
    "Solutions Enabler & Senior Software Engineer at JMAN Group, specializing in full-stack architecture, GenAI integration, and enterprise data engineering. Turning complex technical challenges into scalable, high-impact software solutions.",
  email: "yogeshwaran.g@protonmail.com",
  phone: "+91 75501 55076",
  location: "Chennai, India",
  website: "https://yogeshwaran.dev",
  portfolio: "yogeshwaran.dev",
  linkedin: "https://www.linkedin.com/in/yogeshwaran-g/",
  github: "https://github.com/Yogesh-G-3468",
  githubUsername: "Yogesh-G-3468",
  resumeUrl: "/Yogesh_Resume.docx",
};

export const aboutText = {
  bio: "I'm a Solutions Enabler & Senior Software Engineer at JMAN Group where I've progressed from intern to Solutions Enabler. I specialize in building full-stack platforms, optimizing GenAI backend architectures, and engineering Databricks & Snowflake data pipelines. Graduated from SRM Easwari Engineering College with a B.Tech in Artificial Intelligence and Data Science (CGPA 8.57 / 10, First Class with Distinction).",
  highlights: [
    "Architected automated AI hiring platforms, GenAI API backends, and reverse ETL pipelines",
    "Expertise in Next.js, React, Node.js, NestJS, Python, FastAPI, Django, PostgreSQL, Azure, AWS & Databricks",
    "Passionate about self-hosting, open-source software, and AI application engineering",
  ],
};

export const skills = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "NestJS",
  "Python",
  "FastAPI",
  "Django",
  "GraphQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Azure",
  "AWS (Bedrock, Fargate, ECS)",
  "LangChain",
  "LangGraph",
  "Gemini API",
  "Databricks",
  "Snowflake",
  "dbt",
  "Fivetran",
  "Microsoft Fabric",
  "Git",
];

export interface ExperienceItem {
  id: number;
  title: string;
  company: string;
  period: string;
  location?: string;
  bullets: string[];
}

export const experience: ExperienceItem[] = [
  {
    id: 1,
    title: "Solutions Enabler",
    company: "JMAN Group",
    period: "Jun 2026 – Present",
    bullets: [
      "Designed and independently deployed an automated campus hiring platform using Next.js, LangChain, Gemini API, hosted on Azure VM using Claude Code and Antigravity.",
      "Integrated candidate-to-interviewer mapping, MS Teams meeting booking, automated interview invitations, and AI-driven evaluation metrics to eliminate bias.",
    ],
  },
  {
    id: 2,
    title: "Senior Software Engineer",
    company: "JMAN Group",
    period: "Jun 2025 – Jun 2026",
    bullets: [
      "Reduced GenAI API latency by 40% with async FastAPI backend on Amazon Bedrock (3x concurrency, AWS Fargate/ECS/ECR, OpenSearch RAG).",
      "Modernized CRM timesheet module (Next.js, NestJS, GraphQL, 10% delivery speedup).",
      "Databricks data ingestion with Fivetran, Medallion Architecture (Bronze/Silver/Gold), reporting layer, and Reverse ETL into HubSpot.",
      "Snowflake + dbt client exit cube and real-time ARR dashboards supporting corporate exit procedures.",
    ],
  },
  {
    id: 3,
    title: "Software Engineer",
    company: "JMAN Group",
    period: "Jun 2024 – Jun 2025",
    bullets: [
      "Built internal product/accelerator management platform on Next.js, NestJS, PostgreSQL on Azure VM.",
      "Digitized 12 finance Excel budgeting models into Azure-hosted web platform (Django, React, Redis).",
      "Microsoft Fabric workspace setup, client requirement gathering, ETL transformations, and executive reporting dashboards.",
    ],
  },
  {
    id: 4,
    title: "Software Development Engineer Intern",
    company: "JMAN Group",
    period: "Jan 2024 – Jun 2024",
    bullets: [
      "Full-stack web development, data engineering pipelines, REST APIs (Next.js, NestJS).",
    ],
  },
];

export const education = {
  degree: "Bachelor of Technology in Artificial Intelligence and Data Science",
  institution: "SRM Easwari Engineering College",
  period: "2020 – 2024",
  cgpa: "8.57 / 10",
  distinction: "First Class with Distinction",
};

export interface ProjectItem {
  id: number;
  title: string;
  category: "Data Engineering" | "Full-Stack" | "AI & GenAI" | "Open Source";
  description: string;
  bullets: string[];
  tech: string[];
  link?: string;
  github?: string;
  stats?: string;
}

export const featuredProjects: ProjectItem[] = [
  {
    id: 1,
    title: "24/7 Self-Hosted Async FastAPI Platform",
    category: "Full-Stack",
    description: "Production self-hosted FastAPI backend infrastructure running 24/7.",
    bullets: [
      "Self-hosted FastAPI backend running 24/7 on local hardware, exposed securely via Cloudflare DNS & encrypted tunnels.",
      "Consumed by Next.js frontend with OAuth 2.0 / JWT Auth & RBAC access control.",
    ],
    tech: ["FastAPI", "Python", "Next.js", "Cloudflare DNS", "OAuth 2.0", "JWT", "Docker"],
  },
  {
    id: 2,
    title: "Freelance Full-Stack Web App",
    category: "Full-Stack",
    description: "Production web platform with cloud database and fine-grained authorization.",
    bullets: [
      "Full-stack Next.js web application deployed on Vercel with PostgreSQL database on Azure VM.",
      "Implemented fine-grained Auth/Authz access control policies for multi-tenant users.",
    ],
    tech: ["Next.js", "React", "TypeScript", "PostgreSQL", "Azure VM", "Vercel", "Tailwind CSS"],
  },
  {
    id: 3,
    title: "AI Job Application Agent",
    category: "AI & GenAI",
    description: "Autonomous multi-agent system automating job applications and ATS customization.",
    bullets: [
      "Multi-agent LangChain/LangGraph workflow scraping 50+ job boards in parallel.",
      "Performs vector RAG matching and dynamically generates ATS-optimized resumes.",
    ],
    tech: ["LangChain", "LangGraph", "Python", "Vector RAG", "FastAPI", "OpenAI / Gemini"],
  },
  {
    id: 4,
    title: "Portfolio & AI Blog Generator",
    category: "AI & GenAI",
    description: "AI platform converting video transcripts into structured, illustrated tech blog posts.",
    bullets: [
      "Next.js/TypeScript app converting YouTube transcripts into illustrated blogs in under 2 minutes.",
      "Integrated automated image generation and Markdown formatting.",
    ],
    tech: ["Next.js", "TypeScript", "Gemini API", "Node.js", "Tailwind CSS"],
  },
  {
    id: 5,
    title: "youtube-transcript-api-ts",
    category: "Open Source",
    description: "Published open-source npm library for fetching YouTube transcripts programmatically.",
    bullets: [
      "Published open-source npm package with 500+ downloads.",
      "Provides robust TypeScript types and async transcript extraction API.",
    ],
    tech: ["TypeScript", "npm", "Node.js", "Open Source"],
    stats: "500+ Downloads",
    github: "https://github.com/Yogesh-G-3468/youtube-transcript-api-ts",
  },
];

export const navLinks = [
  { name: "About", href: "#about" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Blogs", href: "/blogs" },
  { name: "Tailor Resume", href: "/resume-tailor" },
  { name: "Career Scraper", href: "/career-scraper" },
  { name: "DSA Patterns", href: "/dsa" },
  { name: "Contact", href: "#contact" },
];
