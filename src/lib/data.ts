export const personalInfo = {
  name: "Yogeshwaran G",
  tagline: "Full-Stack Software Engineer | Building Scalable Systems & AI Solutions",
  description: "Specializing in generative AI, data engineering, and cloud-native applications. Proven track record delivering enterprise solutions that reduce cycle times and improve efficiency.",
  email: "yogeshwaran.g@protonmail.com",
  phone: "+91 7550155076",
  location: "Chennai, Tamil Nadu, India",
  linkedin: "https://www.linkedin.com/in/yogeshwaran-g/",
  github: "https://github.com/Yogesh-G-3468",
  resumeUrl: "/resume.pdf",
};

export const aboutText = {
  bio: "I'm a Full-Stack Software Engineer with 2+ years of experience at JMAN Group, where I've grown from Intern to Senior Software Engineer. I'm passionate about building scalable AI-powered applications and data pipelines that drive real business impact.",
  highlights: [
    "Progressed from Intern → Software Engineer → Senior Software Engineer at JMAN Group",
    "Core expertise in full-stack development, GenAI, and data engineering",
    "Currently focused on building scalable AI-powered applications and data pipelines",
  ],
};

export const skills = {
  Frontend: ["React", "Next.js", "HTML", "CSS", "TypeScript"],
  Backend: ["Node.js", "NestJS", "Django", "Flask", "Python"],
  Databases: ["PostgreSQL", "MongoDB", "SQL"],
  "Cloud & DevOps": ["Azure (App Service, VM, DevOps)", "Docker", "GitHub Actions"],
  "AI/ML": ["Amazon Bedrock", "Langchain"],
  Tools: ["Appian", "Git", "Jira", "Confluence", "Databricks"],
};

export const projects = [
  {
    id: 1,
    title: "GenAI Endpoint Enhancement",
    description: "Re-architected GenAI API reducing response latency by 40%. Built OpenAI-compatible interface for seamless LLM integration.",
    tech: ["Amazon Bedrock", "Python", "CI/CD", "API Design"],
    impact: "40% faster response times",
    category: "AI/ML",
  },
  {
    id: 2,
    title: "Accelerator Analytics Portal",
    description: "Internal platform with real-time analytics and AI chatbot for showcasing organizational tools.",
    tech: ["Next.js", "Azure", "Docker", "Amazon Bedrock"],
    impact: "45% increase in adoption, 500+ users",
    category: "Full-Stack",
  },
  {
    id: 3,
    title: "Customer Order & Inventory Platform",
    description: "Backend services for order management processing 10,000+ monthly transactions.",
    tech: ["NestJS", "PostgreSQL", "Next.js"],
    impact: "50% faster query response times",
    category: "Backend",
  },
  {
    id: 4,
    title: "Data Integration & Deduplication Pipeline",
    description: "Scalable pipeline merging heterogeneous data sources using fuzzy matching and deduplication.",
    tech: ["Databricks", "Splink", "ETL"],
    impact: "Improved data accuracy for analytics",
    category: "Data Engineering",
  },
  {
    id: 5,
    title: "Business Model Optimization App",
    description: "Migrated Excel financial models to collaborative cloud application.",
    tech: ["Django", "React", "Azure", "Docker"],
    impact: "60% reduction in manual errors",
    category: "Full-Stack",
  },
  {
    id: 6,
    title: "Appian Process Automation",
    description: "Workflow automation solution reducing manual processes with SQL optimization.",
    tech: ["Appian", "SQL"],
    impact: "35% faster cycle times, 40% faster queries",
    category: "Automation",
  },
];

export const experience = [
  {
    id: 1,
    title: "Senior Software Engineer",
    company: "JMAN Group",
    period: "June 2025 - Present",
    achievements: [
      "Leading development of AI-powered enterprise solutions",
      "Mentoring junior developers and conducting code reviews",
      "Architecting scalable microservices for high-traffic applications",
    ],
  },
  {
    id: 2,
    title: "Software Engineer",
    company: "JMAN Group",
    period: "June 2024 - April 2025",
    achievements: [
      "Re-architected GenAI API reducing response latency by 40%",
      "Built internal analytics portal serving 500+ users with 45% adoption increase",
      "Developed data integration pipelines processing heterogeneous data sources",
    ],
  },
  {
    id: 3,
    title: "Software Development Engineer Intern",
    company: "JMAN Group",
    period: "Jan 2024 - June 2024",
    achievements: [
      "Contributed to backend services for order management system",
      "Implemented SQL optimizations achieving 40% faster query times",
      "Collaborated on Appian workflow automation reducing manual processes by 35%",
    ],
  },
];

export const education = {
  degree: "B.Tech in AI & Data Science",
  institution: "SRM Easwari Engineering College",
  period: "2020 - 2024",
  cgpa: "8.47",
};

export const navLinks = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Education", href: "#education" },
  { name: "Contact", href: "#contact" },
];
