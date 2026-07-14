import { stratosFetch, BASE_URL, getStratosToken } from "../dashboard/api";

export interface ResumeUploadResponse {
  resume_id: string;
  filename: string;
  content_type: string;
  sections_found: string[];
  plain_text_length: number;
  created_at: string;
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

export interface TailorResumeResponse {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  ats_score_before?: AtsScoreBreakdown;
  ats_score_after?: AtsScoreBreakdown;
  tailored_resume_markdown?: string;
  change_summary?: string[];
  missing_qualifications?: string[];
  download_url?: string;
}

// Upload resume as multipart/form-data
export const uploadResume = async (file: File): Promise<ResumeUploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await stratosFetch("/resume/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to upload resume file");
  }

  return response.json();
};

// Extract skills and attributes from JD
export const extractJD = async (jdText?: string, jdUrl?: string): Promise<JdExtractionResponse> => {
  const response = await stratosFetch("/jd/extract", {
    method: "POST",
    body: JSON.stringify({
      jd_text: jdText || "",
      jd_url: jdUrl || "",
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to extract job description details");
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
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to calculate ATS score");
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
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.detail || "Failed to start resume tailoring");
  }

  return response.json();
};

// Poll job status
export const getTailoredStatus = async (jobId: string): Promise<TailorResumeResponse> => {
  const response = await stratosFetch(`/resume/tailor/${jobId}`, {
    method: "GET",
  });

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
  const url = `${cleanBase}/resume/tailor/${jobId}/download?format=${format}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

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
  
  link.setAttribute("download", `${filename}.${ext}`);
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(blobUrl);
};
