import { stratosFetch, BASE_URL, getStratosToken } from "../dashboard/api";

export interface ResumeUploadResponse {
  resume_id: string;
  filename: string;
  pdfBlob?: Blob;
  content_type?: string;
  sections_found?: string[];
  plain_text_length?: number;
  created_at?: string;
}

export interface JdExtractionResponse {
  required_skills: string[];
  nice_to_have_skills: string[];
  responsibilities: string[];
  seniority_level: string;
  tools_and_technologies: string[];
  keywords: string[];
  raw_text: string;
}

export interface KeywordMatch {
  keyword: string;
  importance: "required" | "nice-to-have";
  found: boolean;
}

export interface SectionScore {
  name: string;
  score: number;
  max_score: number;
  details: any[];
}

export interface AtsScoreBreakdown {
  overall_score: number;
  keyword_match_pct: number;
  matched_keywords: KeywordMatch[];
  missing_keywords: KeywordMatch[];
  formatting_issues: string[];
  section_scores: SectionScore[];
}

export interface AuditReport {
  verified_facts: string[];
  reframed_keywords: string[];
  audited_removed: string[];
}

export interface KeywordItem {
  keyword: string;
  placed?: boolean;
}

export interface KeywordCategorizedList {
  required?: (string | KeywordItem)[];
  tools?: (string | KeywordItem)[];
  nice_to_have?: (string | KeywordItem)[];
  soft_skills?: (string | KeywordItem)[];
}

export interface RecruiterAtsScore {
  overall_score: number;
  section_scores: SectionScore[];
  keyword_match_pct?: number;
  matched_keywords?: KeywordMatch[];
  missing_keywords?: KeywordMatch[];
  formatting_issues?: string[];
}

export interface TailorResumeResponse {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  matched_role?: string;
  matched_role_ids?: string[];
  keyword_coverage_pct?: number;
  keyword_list?: KeywordCategorizedList;
  pipeline_stages?: string[];
  ats_score?: RecruiterAtsScore | AtsScoreBreakdown;
  ats_score_before?: AtsScoreBreakdown;
  ats_score_after?: AtsScoreBreakdown;
  tailored_resume_markdown?: string;
  tailored_resume_latex?: string;
  fact_audit_report?: AuditReport;
  change_summary?: string[];
  missing_qualifications?: string[];
  download_url?: string;
}

export interface ResumeConstraints {
  min_bullets_per_job?: number;
  max_bullets_per_job?: number;
  max_projects?: number;
  max_bullet_words?: number;
  keyword_coverage_target?: number;
  font?: string;
}

export interface BuildResumePayload {
  jd_text?: string;
  jd_url?: string;
  tone?: string;
  output_format?: string;
  resume_id?: string;
  constraints?: ResumeConstraints;
}

const handleApiResponseError = async (response: Response, defaultMsg: string): Promise<never> => {
  if (response.status === 405) {
    throw new Error(`HTTP 405 Method Not Allowed: Route '${response.url}' does not accept POST requests on stratos.yogeshwaran.space.`);
  }
  if (response.status === 502 || response.status === 504) {
    throw new Error(`HTTP ${response.status} Bad Gateway: Backend server timeout or crash on stratos.yogeshwaran.space during XeLaTeX / Gemini execution.`);
  }
  let detail = defaultMsg;
  try {
    const body = await response.json();
    if (body?.detail) {
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    }
  } catch (e) {
    const text = await response.text().catch(() => "");
    if (text && text.trim().startsWith("<")) {
      detail = `HTTP ${response.status} ${response.statusText}: Server returned non-JSON error page from stratos.yogeshwaran.space`;
    } else if (text) {
      detail = `HTTP ${response.status}: ${text.slice(0, 150)}`;
    } else {
      detail = `HTTP ${response.status}: ${response.statusText || defaultMsg}`;
    }
  }
  throw new Error(detail);
};

// Upload resume as multipart/form-data
export const uploadResume = async (file: File): Promise<ResumeUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await stratosFetch("/resume/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    await handleApiResponseError(response, "Failed to upload resume file");
  }

  // 1. Extract the resume ID and filename from response headers or body JSON
  let resumeId = response.headers.get("X-Resume-Id") || response.headers.get("x-resume-id") || "";
  let filename = response.headers.get("X-Filename") || response.headers.get("x-filename") || file.name;
  
  let pdfBlob: Blob | undefined;
  try {
    const cloned = response.clone();
    const bodyJson = await cloned.json();
    if (bodyJson.resume_id) resumeId = bodyJson.resume_id;
    if (bodyJson.filename) filename = bodyJson.filename;
  } catch (e) {
    // If not JSON, read as binary blob
    pdfBlob = await response.blob();
  }

  return {
    resume_id: resumeId || `res_${Math.random().toString(36).substring(2, 11)}`,
    filename: filename,
    pdfBlob: pdfBlob,
    content_type: "application/pdf",
    sections_found: ["summary", "skills", "experience", "education"],
    plain_text_length: file.size,
    created_at: new Date().toISOString()
  };
};

// Extract skills and attributes from JD (POST /resume/extract-jd or POST /jd/extract)
export const extractJD = async (jdText?: string, jdUrl?: string): Promise<JdExtractionResponse> => {
  const body = JSON.stringify({
    jd_text: jdText || "",
    jd_url: jdUrl || "",
  });

  let response: Response;
  try {
    response = await stratosFetch("/resume/extract-jd", {
      method: "POST",
      body,
    });
    if (!response.ok && response.status !== 404 && response.status !== 405) {
      await handleApiResponseError(response, "Failed to extract job description details");
    }
    if (!response.ok) throw new Error();
  } catch (e: any) {
    if (e.message && e.message.startsWith("HTTP ")) throw e;
    response = await stratosFetch("/jd/extract", {
      method: "POST",
      body,
    });
  }

  if (!response.ok) {
    await handleApiResponseError(response, "Failed to extract job description details");
  }

  return response.json();
};

// Calculate current resume match with JD
export const getAtsScore = async (resumeId: string, jdText: string): Promise<AtsScoreBreakdown> => {
  const response = await stratosFetch("/resume/ats-score", {
    method: "POST",
    body: JSON.stringify({
      resume_id: resumeId,
      jd_text: jdText,
    }),
  });

  if (!response.ok) {
    await handleApiResponseError(response, "Failed to calculate ATS score");
  }

  return response.json();
};

// Trigger tailoring pipeline
export const tailorResume = async (
  resumeId: string,
  jdText: string,
  tone: string,
  outputFormat: string
): Promise<TailorResumeResponse> => {
  const response = await stratosFetch("/resume/tailor", {
    method: "POST",
    body: JSON.stringify({
      resume_id: resumeId,
      jd_text: jdText,
      tone,
      output_format: outputFormat,
    }),
  });

  if (!response.ok) {
    await handleApiResponseError(response, "Failed to start resume tailoring");
  }

  return response.json();
};

// Trigger Headless Headhunter recruiter pipeline endpoint (POST /resume/build)
export const buildResume = async (
  payload: BuildResumePayload
): Promise<TailorResumeResponse> => {
  const bodyData: Record<string, any> = {
    tone: payload.tone || "impact-driven",
    output_format: payload.output_format || "pdf",
    constraints: payload.constraints || {
      min_bullets_per_job: 2,
      max_bullets_per_job: 4,
      max_projects: 3,
      max_bullet_words: 25,
      keyword_coverage_target: 0.75,
      font: "Arial"
    }
  };
  if (payload.jd_text) bodyData.jd_text = payload.jd_text;
  if (payload.jd_url) bodyData.jd_url = payload.jd_url;
  if (payload.resume_id) bodyData.resume_id = payload.resume_id;

  const response = await stratosFetch("/resume/build", {
    method: "POST",
    body: JSON.stringify(bodyData),
  });

  if (!response.ok) {
    await handleApiResponseError(response, "Failed to execute Headless Headhunter build pipeline");
  }

  return response.json();
};

// Poll job status
export const getTailoredStatus = async (jobId: string): Promise<TailorResumeResponse> => {
  let response = await stratosFetch(`/resume/job/${jobId}`, { method: "GET" }).catch(() => null);
  if (!response || !response.ok) {
    response = await stratosFetch(`/resume/tailor/${jobId}`, { method: "GET" });
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to poll tailoring job status");
  }

  return response.json();
};

// Download tailored output with custom auth headers
export const downloadResumeFile = async (
  jobId: string,
  format: string,
  filename: string = "tailored_resume"
): Promise<void> => {
  const token = getStratosToken();
  const cleanBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
  
  let response = await fetch(`${cleanBase}/resume/job/${jobId}/download?format=${format}`, {
    method: "GET",
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  }).catch(() => null);

  if (!response || !response.ok) {
    response = await fetch(`${cleanBase}/resume/tailor/${jobId}/download?format=${format}`, {
      method: "GET",
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    });
  }

  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = blobUrl;
  
  // Extension mapping
  let ext = format;
  if (format === "markdown") ext = "md";
  if (format === "latex") ext = "tex";
  
  link.setAttribute("download", `${filename}.${ext}`);
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
};
