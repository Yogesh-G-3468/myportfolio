import { stratosFetch } from "../dashboard/api";

// ── Types ──────────────────────────────────────────────────────────────

export interface ScraperJob {
  id: number;
  site_name: string;
  title: string;
  location: string;
  department: string | null;
  apply_url: string;
  posted_date: string | null;
  relevance_score: number;
  discovered_at: string;
}

export interface ScraperRun {
  id: number;
  started_at: string;
  finished_at: string | null;
  sites_attempted: number;
  sites_succeeded: number;
  new_jobs_found: number;
  errors: string | null;
}

export interface ScraperSite {
  id: number;
  site_name: string;
  url: string;
  site_type?: string;
  api_pattern?: string | null;
  last_success?: string | null;
  fail_count?: number;
  is_active: boolean;
}

export interface ScraperPreferences {
  roles: string[];
  locations: string[];
  experience_range: string;
  min_relevance_score: number;
  scrape_interval_hours: number;
}

// ── API Functions ──────────────────────────────────────────────────────

export const fetchScraperJobs = async (
  minScore: number = 0.5,
  limit: number = 50
): Promise<ScraperJob[]> => {
  const params = new URLSearchParams({
    min_score: minScore.toString(),
    limit: limit.toString(),
  });
  const response = await stratosFetch(`/scraper/jobs?${params.toString()}`);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to fetch scraper jobs");
  }
  return response.json();
};

export const fetchScraperRuns = async (
  limit: number = 10
): Promise<ScraperRun[]> => {
  const params = new URLSearchParams({ limit: limit.toString() });
  const response = await stratosFetch(`/scraper/runs?${params.toString()}`);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to fetch scraper runs");
  }
  return response.json();
};

export const triggerScrapeNow = async (): Promise<{ status: string }> => {
  const response = await stratosFetch("/scraper/run-now", { method: "POST" });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to trigger scrape");
  }
  return response.json();
};

export const fetchScraperSites = async (
  search: string = "",
  isActive?: boolean,
  limit: number = 100,
  skip: number = 0
): Promise<ScraperSite[]> => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    skip: skip.toString(),
  });
  if (search) params.append("search", search);
  if (isActive !== undefined) params.append("is_active", isActive.toString());

  const response = await stratosFetch(`/scraper/sites?${params.toString()}`);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to fetch scraper sites");
  }
  return response.json();
};

export const addScraperSite = async (
  siteName: string,
  url: string,
  isActive: boolean = true
): Promise<ScraperSite> => {
  const response = await stratosFetch("/scraper/sites", {
    method: "POST",
    body: JSON.stringify({
      site_name: siteName,
      url,
      is_active: isActive,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to add scraper site");
  }
  return response.json();
};

export const updateScraperSite = async (
  siteId: number,
  url: string,
  isActive: boolean,
  siteName: string
): Promise<ScraperSite> => {
  const response = await stratosFetch(`/scraper/sites/${siteId}`, {
    method: "PUT",
    body: JSON.stringify({
      site_name: siteName,
      url,
      is_active: isActive,
    }),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to update scraper site");
  }
  return response.json();
};

export const fetchScraperPreferences = async (): Promise<ScraperPreferences> => {
  const response = await stratosFetch("/scraper/preferences");
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to fetch scraper preferences");
  }
  return response.json();
};

export const updateScraperPreferences = async (
  preferences: ScraperPreferences
): Promise<ScraperPreferences> => {
  const response = await stratosFetch("/scraper/preferences", {
    method: "PUT",
    body: JSON.stringify(preferences),
  });
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to update scraper preferences");
  }
  return response.json();
};

// ── Demo Mock Data ─────────────────────────────────────────────────────

export const MOCK_SCRAPER_JOBS: ScraperJob[] = [
  {
    id: 1,
    site_name: "stripe",
    title: "Senior Backend Engineer",
    location: "Remote — India",
    department: "Engineering",
    apply_url: "https://stripe.com/jobs/1234",
    posted_date: "2026-07-15",
    relevance_score: 0.92,
    discovered_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    site_name: "notion",
    title: "Full-Stack Engineer, AI Platform",
    location: "San Francisco, CA (Hybrid)",
    department: "Product Engineering",
    apply_url: "https://notion.so/careers/5678",
    posted_date: "2026-07-14",
    relevance_score: 0.87,
    discovered_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    site_name: "vercel",
    title: "Software Engineer — Next.js Core",
    location: "Remote",
    department: "Framework",
    apply_url: "https://vercel.com/careers/9012",
    posted_date: "2026-07-13",
    relevance_score: 0.84,
    discovered_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    site_name: "supabase",
    title: "Backend Engineer — Auth & Realtime",
    location: "Remote — APAC",
    department: "Platform",
    apply_url: "https://supabase.com/careers/3456",
    posted_date: "2026-07-12",
    relevance_score: 0.78,
    discovered_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    site_name: "linear",
    title: "Product Engineer",
    location: "Remote (US/EU Timezones)",
    department: "Engineering",
    apply_url: "https://linear.app/careers/7890",
    posted_date: "2026-07-11",
    relevance_score: 0.72,
    discovered_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    site_name: "resend",
    title: "TypeScript Engineer",
    location: "Remote",
    department: null,
    apply_url: "https://resend.com/careers/1122",
    posted_date: "2026-07-10",
    relevance_score: 0.68,
    discovered_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 7,
    site_name: "postman",
    title: "Senior Software Engineer — API Platform",
    location: "Bengaluru, India",
    department: "Platform",
    apply_url: "https://postman.com/careers/3344",
    posted_date: "2026-07-09",
    relevance_score: 0.65,
    discovered_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 8,
    site_name: "razorpay",
    title: "Software Engineer II — Payments",
    location: "Bengaluru, India",
    department: "Payments",
    apply_url: "https://razorpay.com/careers/5566",
    posted_date: "2026-07-08",
    relevance_score: 0.61,
    discovered_at: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 9,
    site_name: "cloudflare",
    title: "Systems Engineer — Workers Runtime",
    location: "London, UK (Hybrid)",
    department: "Engineering",
    apply_url: "https://cloudflare.com/careers/7788",
    posted_date: "2026-07-07",
    relevance_score: 0.55,
    discovered_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 10,
    site_name: "atlassian",
    title: "Software Engineer — Jira Cloud",
    location: "Sydney, AU (Remote Eligible)",
    department: "Cloud Platform",
    apply_url: "https://atlassian.com/careers/9900",
    posted_date: "2026-07-06",
    relevance_score: 0.52,
    discovered_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export const MOCK_SCRAPER_RUNS: ScraperRun[] = [
  {
    id: 5,
    started_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 1 * 60 * 60 * 1000 + 150000).toISOString(),
    sites_attempted: 8,
    sites_succeeded: 8,
    new_jobs_found: 4,
    errors: null,
  },
  {
    id: 4,
    started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 125000).toISOString(),
    sites_attempted: 8,
    sites_succeeded: 7,
    new_jobs_found: 6,
    errors: "postman: 429 Too Many Requests",
  },
  {
    id: 3,
    started_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 3 * 60 * 60 * 1000 + 180000).toISOString(),
    sites_attempted: 8,
    sites_succeeded: 8,
    new_jobs_found: 2,
    errors: null,
  },
  {
    id: 2,
    started_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 4 * 60 * 60 * 1000 + 95000).toISOString(),
    sites_attempted: 8,
    sites_succeeded: 6,
    new_jobs_found: 8,
    errors: "cloudflare: Connection timeout | razorpay: 503 Service Unavailable",
  },
  {
    id: 1,
    started_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    finished_at: new Date(Date.now() - 5 * 60 * 60 * 1000 + 140000).toISOString(),
    sites_attempted: 8,
    sites_succeeded: 8,
    new_jobs_found: 10,
    errors: null,
  },
];

export const MOCK_SCRAPER_SITES: ScraperSite[] = [
  {
    id: 1,
    site_name: "Stripe",
    url: "https://stripe.com/jobs",
    site_type: "api",
    api_pattern: "https://api.stripe.com/v1/jobs",
    last_success: "2026-07-18T10:00:00Z",
    fail_count: 0,
    is_active: true,
  },
  {
    id: 2,
    site_name: "Notion",
    url: "https://notion.so/careers",
    site_type: "html",
    api_pattern: null,
    last_success: "2026-07-18T10:00:00Z",
    fail_count: 0,
    is_active: true,
  },
  {
    id: 3,
    site_name: "Vercel",
    url: "https://vercel.com/careers",
    site_type: "api",
    api_pattern: "https://boards-api.greenhouse.io/v1/boards/vercel/jobs",
    last_success: "2026-07-18T10:00:00Z",
    fail_count: 0,
    is_active: true,
  },
  {
    id: 4,
    site_name: "Supabase",
    url: "https://supabase.com/careers",
    site_type: "api",
    api_pattern: "https://boards-api.greenhouse.io/v1/boards/supabase/jobs",
    last_success: "2026-07-18T10:00:00Z",
    fail_count: 0,
    is_active: true,
  },
  {
    id: 5,
    site_name: "Linear",
    url: "https://linear.app/careers",
    site_type: "html",
    api_pattern: null,
    last_success: "2026-07-18T10:00:00Z",
    fail_count: 0,
    is_active: true,
  },
  {
    id: 6,
    site_name: "Resend",
    url: "https://resend.com/careers",
    site_type: "html",
    api_pattern: null,
    last_success: "2026-07-18T10:00:00Z",
    fail_count: 0,
    is_active: true,
  },
  {
    id: 7,
    site_name: "Postman",
    url: "https://postman.com/careers",
    site_type: "html",
    api_pattern: null,
    last_success: "2026-07-18T09:00:00Z",
    fail_count: 1,
    is_active: false,
  },
  {
    id: 8,
    site_name: "Razorpay",
    url: "https://razorpay.com/careers",
    site_type: "html",
    api_pattern: null,
    last_success: "2026-07-18T06:00:00Z",
    fail_count: 2,
    is_active: false,
  },
  {
    id: 9,
    site_name: "Cloudflare",
    url: "https://cloudflare.com/careers",
    site_type: "api",
    api_pattern: "https://boards-api.greenhouse.io/v1/boards/cloudflare/jobs",
    last_success: "2026-07-18T10:00:00Z",
    fail_count: 0,
    is_active: true,
  },
  {
    id: 10,
    site_name: "Atlassian",
    url: "https://atlassian.com/careers",
    site_type: "api",
    api_pattern: null,
    last_success: "2026-07-18T10:00:00Z",
    fail_count: 0,
    is_active: true,
  },
  {
    id: 11,
    site_name: "OpenAI",
    url: "https://openai.com/careers",
    site_type: "html",
    api_pattern: null,
    last_success: null,
    fail_count: 0,
    is_active: false,
  },
  {
    id: 12,
    site_name: "Google",
    url: "https://careers.google.com",
    site_type: "api",
    api_pattern: "https://careers.google.com/api/v1/jobs",
    last_success: "2026-07-18T10:00:00Z",
    fail_count: 0,
    is_active: true,
  },
];

export const MOCK_SCRAPER_PREFERENCES: ScraperPreferences = {
  roles: ["Data Engineer", "Backend Engineer"],
  locations: ["Chennai", "Remote - India"],
  experience_range: "2-6 years",
  min_relevance_score: 0.5,
  scrape_interval_hours: 1,
};
