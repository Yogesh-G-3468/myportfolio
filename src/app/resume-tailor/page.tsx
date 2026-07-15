"use client";

import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  CheckCircle2,
  X,
  FileCode,
  Sparkles,
  Loader2,
  ArrowRight,
  Check,
  Download,
  AlertTriangle,
  Eye,
  Briefcase,
  Link as LinkIcon,
  Copy,
  LogOut,
  Lock,
  User,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet
} from "lucide-react";
import { marked } from "marked";
import {
  BASE_URL,
  getStratosToken,
  saveStratosAuth,
  clearStratosAuth
} from "@/components/dashboard/api";
import {
  uploadResume,
  extractJD,
  getAtsScore,
  tailorResume,
  getTailoredStatus,
  downloadResumeFile,
  ResumeUploadResponse,
  JdExtractionResponse,
  AtsScoreBreakdown,
  TailorResumeResponse
} from "@/components/resume-tailor/api";

// Circular Progress Component
const CircularProgress = ({
  score,
  size = 75,
  strokeWidth = 6,
  colorClass = "text-accent",
  bgColorClass = "text-border",
  label = ""
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  bgColorClass?: string;
  label?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(score, 100) / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${bgColorClass} stroke-current`}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`${colorClass} stroke-current transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-sm font-black text-foreground tabular-nums">{score}%</span>
      </div>
      {label && <span className="text-[10px] uppercase font-bold tracking-wider text-foreground-secondary">{label}</span>}
    </div>
  );
};

export default function ResumeTailorPage() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  // Auth state
  const [username, setUsername] = useState("yogesh");
  const [password, setPassword] = useState("testpassword");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Mode state
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  // File upload state
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [resumeMetadata, setResumeMetadata] = useState<ResumeUploadResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeBlobUrl, setResumeBlobUrl] = useState<string | null>(null);
  const [activeResumeTab, setActiveResumeTab] = useState<"upload" | "paste">("upload");
  const [pastedResumeText, setPastedResumeText] = useState("");
  const [showLatexBadge, setShowLatexBadge] = useState(false);

  // Revoke object URL on unmount or URL shift
  useEffect(() => {
    return () => {
      if (resumeBlobUrl) {
        URL.revokeObjectURL(resumeBlobUrl);
      }
    };
  }, [resumeBlobUrl]);
  
  // JD Ingestion state
  const [activeJdTab, setActiveJdTab] = useState<"paste" | "url">("paste");
  const [jdText, setJdText] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedJd, setExtractedJd] = useState<JdExtractionResponse | null>(null);
  const [selectedResponsibilities, setSelectedResponsibilities] = useState<string[]>([]);
  
  // Configuration options
  const [tone, setTone] = useState<string>("professional");
  const [outputFormat, setOutputFormat] = useState<string>("pdf");
  
  // Standalone scoring state
  const [isScoring, setIsScoring] = useState(false);
  const [atsScore, setAtsScore] = useState<AtsScoreBreakdown | null>(null);
  
  // Tailoring pipeline state
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoringStep, setTailoringStep] = useState<string>("idle"); // idle | extract | history | format | score | done
  const [tailoringJobId, setTailoringJobId] = useState<string | null>(null);
  const [tailoringResult, setTailoringResult] = useState<TailorResumeResponse | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<"changelog" | "preview" | "keywords">("changelog");
  
  // Load token and local settings on mount
  useEffect(() => {
    setMounted(true);
    const savedToken = getStratosToken();
    const savedDemoMode = localStorage.getItem("stratos_demo_mode") === "true";
    const savedResumeId = localStorage.getItem("stratos_resume_id");
    const savedResumeMetadata = localStorage.getItem("stratos_resume_metadata");
    
    setIsDemoMode(savedDemoMode);
    if (savedToken) {
      setToken(savedToken);
    } else if (savedDemoMode) {
      setToken("demo_token");
    }
    
    if (savedResumeId) {
      setResumeId(savedResumeId);
    }
    if (savedResumeMetadata) {
      try {
        setResumeMetadata(JSON.parse(savedResumeMetadata));
      } catch (e) {
        console.error(e);
      }
    }
    
    // Auth unauthorized listener
    const handleUnauthorized = () => {
      handleLogout();
    };
    window.addEventListener("stratos-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("stratos-unauthorized", handleUnauthorized);
    };
  }, []);

  // Toast Auto-Dismiss
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Polling loop for tailing status check
  useEffect(() => {
    if (!isTailoring || !tailoringJobId || isDemoMode) return;
    
    let pollInterval: NodeJS.Timeout;
    
    const checkJobStatus = async () => {
      try {
        const result = await getTailoredStatus(tailoringJobId);
        if (result.status === "completed") {
          setTailoringResult(result);
          setIsTailoring(false);
          setTailoringStep("done");
          setActiveRightTab("changelog");
          showToast("Resume tailoring complete!", "success");
        } else if (result.status === "failed") {
          setIsTailoring(false);
          setTailoringStep("idle");
          showToast("Resume tailoring pipeline failed on backend.", "error");
        } else if (result.status === "processing") {
          setTailoringStep("format");
        }
      } catch (err: any) {
        console.error("Polling error:", err);
        setIsTailoring(false);
        setTailoringStep("idle");
        showToast(err.message || "Failed checking tailoring status", "error");
      }
    };
    
    pollInterval = setInterval(checkJobStatus, 3000);
    return () => clearInterval(pollInterval);
  }, [isTailoring, tailoringJobId, isDemoMode]);

  const showToast = (text: string, type: "success" | "error") => {
    setToastMessage({ text, type });
  };

  // Auth actions
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    
    if (isDemoMode) {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      saveStratosAuth("demo_token", expiresAt);
      setToken("demo_token");
      setAuthLoading(false);
      showToast("Demo login successful!", "success");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Authentication rejected. Invalid credentials.");
      }

      const data = await response.json();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      saveStratosAuth(data.access_token, expiresAt);
      setToken(data.access_token);
      showToast("Successfully authenticated", "success");
    } catch (err: any) {
      setAuthError(err.message || "Something went wrong during authentication.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearStratosAuth();
    setToken(null);
    setResumeId(null);
    setResumeMetadata(null);
    setExtractedJd(null);
    setAtsScore(null);
    setTailoringResult(null);
    localStorage.removeItem("stratos_resume_id");
    localStorage.removeItem("stratos_resume_metadata");
    showToast("Logged out of tailoring platform", "success");
  };

  const toggleDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    localStorage.setItem("stratos_demo_mode", val ? "true" : "false");
    if (val) {
      setToken("demo_token");
      showToast("Switched to Demo Mode (Mock API enabled)", "success");
    } else {
      const savedToken = getStratosToken();
      setToken(savedToken);
      showToast("Switched to Production API Mode", "success");
    }
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFileProcess(e.target.files[0]);
    }
  };

  const handleFileProcess = async (file: File) => {
    // Basic extension check
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "docx", "txt", "tex"].includes(extension || "")) {
      showToast("Unsupported file format. Please upload PDF, DOCX, TXT or TEX", "error");
      return;
    }

    setIsUploading(true);
    showToast(`Uploading ${file.name}...`, "success");

    if (isDemoMode) {
      setTimeout(() => {
        const mockBlob = new Blob(["Mock PDF Binary Content"], { type: "application/pdf" });
        const mockUrl = URL.createObjectURL(mockBlob);
        setResumeBlobUrl(mockUrl);

        const mockUpload: ResumeUploadResponse = {
          resume_id: "845c479c-7e61-4688-bf2b-b9f121d515a8",
          filename: file.name,
          content_type: extension === "tex" ? "text/x-tex" : "application/pdf",
          sections_found: ["summary", "skills", "experience", "education"],
          plain_text_length: 4500,
          created_at: new Date().toISOString()
        };
        setResumeId(mockUpload.resume_id);
        setResumeMetadata(mockUpload);
        localStorage.setItem("stratos_resume_id", mockUpload.resume_id);
        localStorage.setItem("stratos_resume_metadata", JSON.stringify(mockUpload));
        setIsUploading(false);
        showToast("Resume uploaded successfully (Demo)", "success");
      }, 1000);
      return;
    }

    try {
      const data = await uploadResume(file);
      setResumeId(data.resume_id);
      
      if (data.pdfBlob) {
        const url = URL.createObjectURL(data.pdfBlob);
        setResumeBlobUrl(url);
      }

      setResumeMetadata(data);
      localStorage.setItem("stratos_resume_id", data.resume_id);
      
      // Filter out pdfBlob from stored metadata to avoid JSON serialization issues
      const { pdfBlob, ...serializableMetadata } = data;
      localStorage.setItem("stratos_resume_metadata", JSON.stringify(serializableMetadata));
      showToast("Resume uploaded successfully", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to upload resume file.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const clearUploadedFile = () => {
    setResumeId(null);
    setResumeMetadata(null);
    if (resumeBlobUrl) {
      URL.revokeObjectURL(resumeBlobUrl);
      setResumeBlobUrl(null);
    }
    setPastedResumeText("");
    setShowLatexBadge(false);
    localStorage.removeItem("stratos_resume_id");
    localStorage.removeItem("stratos_resume_metadata");
    showToast("Resume cleared", "success");
  };

  // Helper for detecting LaTeX markup
  const isLatexCode = (text: string): boolean => {
    const latexSignatures = [
      /\\documentclass/,
      /\\begin\{document\}/,
      /\\section\{/,
      /\\subsection\{/,
      /\\usepackage/,
      /\\item/
    ];
    if (/\\documentclass/.test(text)) return true;
    const matches = latexSignatures.filter((sig) => sig.test(text)).length;
    return matches >= 2;
  };

  const handlePastedResumeChange = (text: string) => {
    setPastedResumeText(text);
    if (isLatexCode(text)) {
      setShowLatexBadge(true);
    } else {
      setShowLatexBadge(false);
    }
  };

  const handleSavePastedResume = async () => {
    if (!pastedResumeText.trim()) {
      showToast("Please paste your resume content", "error");
      return;
    }
    const isLatex = isLatexCode(pastedResumeText);
    const filename = isLatex ? "resume.tex" : "resume.txt";
    const type = isLatex ? "text/x-tex" : "text/plain";
    const file = new File([pastedResumeText], filename, { type });
    await handleFileProcess(file);
  };

  // Ingest/extract Job Description
  const handleJdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeJdTab === "paste" && !jdText.trim()) {
      showToast("Please paste job description text", "error");
      return;
    }
    if (activeJdTab === "url" && !jdUrl.trim()) {
      showToast("Please enter a valid job description URL", "error");
      return;
    }

    setIsExtracting(true);
    showToast("Analyzing job description parameters...", "success");

    if (isDemoMode) {
      setTimeout(() => {
        const mockExtraction: JdExtractionResponse = {
          required_skills: ["Python", "TypeScript", "AWS"],
          nice_to_have_skills: ["Go", "Docker", "Kubernetes"],
          responsibilities: [
            "Design scaleable REST APIs using Python & FastAPI",
            "Deploy secure microservices on AWS Cloud infrastructure",
            "Maintain frontend interfaces with React & TypeScript",
            "Establish CI/CD pipelines for deployment automation"
          ],
          seniority_level: "Senior",
          tools_and_technologies: ["FastAPI", "React", "Git", "Docker", "Jira"],
          keywords: ["distributed systems", "CI/CD", "microservices", "REST APIs"],
          raw_text: jdText || `Mock job description text scraped from ${jdUrl}`
        };
        setExtractedJd(mockExtraction);
        setSelectedResponsibilities(mockExtraction.responsibilities);
        setIsExtracting(false);
        showToast("Job description extracted (Demo)", "success");
      }, 1200);
      return;
    }

    try {
      const data = await extractJD(
        activeJdTab === "paste" ? jdText : undefined,
        activeJdTab === "url" ? jdUrl : undefined
      );
      setExtractedJd(data);
      setSelectedResponsibilities(data.responsibilities);
      showToast("Job details extracted successfully", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to extract job description.", "error");
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleResponsibility = (resp: string) => {
    if (selectedResponsibilities.includes(resp)) {
      setSelectedResponsibilities(selectedResponsibilities.filter((r) => r !== resp));
    } else {
      setSelectedResponsibilities([...selectedResponsibilities, resp]);
    }
  };

  // Standalone ATS score checker
  const handleCheckAtsScore = async () => {
    if (!resumeId) {
      showToast("Please upload a resume first", "error");
      return;
    }
    const currentJdText = extractedJd?.raw_text || jdText;
    if (!currentJdText.trim()) {
      showToast("Please provide job description content", "error");
      return;
    }

    setIsScoring(true);
    showToast("Calculating ATS matching score...", "success");

    if (isDemoMode) {
      setTimeout(() => {
        const mockScore: AtsScoreBreakdown = {
          overall_score: 53,
          keyword_match_pct: 32.5,
          matched_keywords: [
            { keyword: "Python", importance: "required", found: true },
            { keyword: "React", importance: "required", found: true }
          ],
          missing_keywords: [
            { keyword: "TypeScript", importance: "required", found: false },
            { keyword: "AWS", importance: "required", found: false },
            { keyword: "Docker", importance: "nice-to-have", found: false }
          ],
          formatting_issues: [
            "No bullet points detected in experience section",
            "Missing clear section dividers"
          ],
          section_scores: [
            { name: "Keyword Coverage", score: 15, max_score: 50, details: [] },
            { name: "Formatting & Structure", score: 18, max_score: 25, details: [] },
            { name: "Section Completeness", score: 20, max_score: 25, details: [] }
          ]
        };
        setAtsScore(mockScore);
        setIsScoring(false);
        setActiveRightTab("keywords");
        showToast("ATS Match Score computed (Demo)", "success");
      }, 1000);
      return;
    }

    try {
      const score = await getAtsScore(resumeId, currentJdText);
      setAtsScore(score);
      setActiveRightTab("keywords");
      showToast("ATS Score computed successfully", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to calculate ATS score.", "error");
    } finally {
      setIsScoring(false);
    }
  };

  // Run Tailoring pipeline
  const handleTailorResume = async () => {
    if (!resumeId) {
      showToast("Please upload your base resume first", "error");
      return;
    }
    const currentJdText = extractedJd?.raw_text || jdText;
    if (!currentJdText.trim()) {
      showToast("Please provide job description parameters", "error");
      return;
    }

    setIsTailoring(true);
    setTailoringStep("extract");
    showToast("Starting resume tailoring pipeline...", "success");

    if (isDemoMode) {
      // Step-by-step progress simulation in Demo Mode
      setTimeout(() => {
        setTailoringStep("history");
        setTimeout(() => {
          setTailoringStep("format");
          setTimeout(() => {
            setTailoringStep("score");
            setTimeout(() => {
              const mockResult: TailorResumeResponse = {
                job_id: "673f8b9d-4e9b-430b-a9b1-5e28cdb119bf",
                status: "completed",
                ats_score_before: {
                  overall_score: 53,
                  keyword_match_pct: 32.5,
                  matched_keywords: [
                    { keyword: "Python", importance: "required", found: true },
                    { keyword: "React", importance: "required", found: true }
                  ],
                  missing_keywords: [
                    { keyword: "TypeScript", importance: "required", found: false },
                    { keyword: "AWS", importance: "required", found: false },
                    { keyword: "Docker", importance: "nice-to-have", found: false }
                  ],
                  formatting_issues: ["No bullet points detected"],
                  section_scores: [
                    { name: "Keyword Coverage", score: 15, max_score: 50, details: [] }
                  ]
                },
                ats_score_after: {
                  overall_score: 88,
                  keyword_match_pct: 85.0,
                  matched_keywords: [
                    { keyword: "Python", importance: "required", found: true },
                    { keyword: "TypeScript", importance: "required", found: true },
                    { keyword: "AWS", importance: "required", found: true },
                    { keyword: "React", importance: "required", found: true },
                    { keyword: "Docker", importance: "nice-to-have", found: true }
                  ],
                  missing_keywords: [
                    { keyword: "Go", importance: "nice-to-have", found: false }
                  ],
                  formatting_issues: [],
                  section_scores: [
                    { name: "Keyword Coverage", score: 45, max_score: 50, details: [] },
                    { name: "Formatting & Structure", score: 23, max_score: 25, details: [] },
                    { name: "Section Completeness", score: 20, max_score: 25, details: [] }
                  ]
                },
                tailored_resume_markdown: `# Yogeshwaran G\n\n## Professional Summary\nHighly motivated and results-oriented **Senior Software Engineer** with over 2 years of experience at JMAN Group, specializing in designing scaleable REST APIs, deploying microservices on **AWS**, and engineering frontends in **TypeScript** and **React**. Proven track record of turning complex data and GenAI requirements into clean, production-grade applications.\n\n## Experience\n### Senior Software Engineer | JMAN Group (2025 – Present)\n- Led development of custom GenAI microservices using **Python** (FastAPI) and deployed them onto **AWS** infrastructure, improving API response times by 30%.\n- Re-architected data ingestion pipelines in **TypeScript**, supporting real-time data streaming and complex ETL workflows.\n\n### Software Engineer | JMAN Group (2024 – 2025)\n- Developed robust, responsive UI layouts with **React** and Next.js, integrating complex backend feeds seamlessly.\n- Utilized **Docker** for containerization of services, ensuring consistent development and staging environment setups.\n\n## Skills\n- **Languages**: Python, TypeScript, JavaScript, SQL\n- **Frameworks & Libraries**: React, Next.js, FastAPI, Node.js, NestJS\n- **Cloud & DevOps**: AWS (EC2, S3, RDS), Docker, Git, CI/CD\n- **Databases**: PostgreSQL, MongoDB`,
                change_summary: [
                  "Rewrote the professional summary to focus on Python, TypeScript, and AWS API design.",
                  "Reordered experiences and added bullet points to prioritize AWS cloud deployments and Docker microservices.",
                  "Enhanced the skills section to align with the required keywords (TypeScript, AWS, Docker)."
                ],
                missing_qualifications: [
                  "We found no evidence of Kubernetes experience in your resume, which is required for this role."
                ],
                download_url: "/resume/tailor/673f8b9d-4e9b-430b-a9b1-5e28cdb119bf/download?format=pdf"
              };
              setTailoringResult(mockResult);
              setIsTailoring(false);
              setTailoringStep("done");
              setActiveRightTab("changelog");
              showToast("Resume tailoring complete! (Demo)", "success");
            }, 800);
          }, 800);
        }, 800);
      }, 800);
      return;
    }

    try {
      const data = await tailorResume(resumeId, currentJdText, tone, outputFormat);
      setTailoringJobId(data.job_id);
      if (data.status === "completed") {
        setTailoringResult(data);
        setIsTailoring(false);
        setTailoringStep("done");
        setActiveRightTab("changelog");
        showToast("Resume tailoring complete!", "success");
      } else {
        // Triggers the polling effect
        setTailoringStep("history");
        showToast("Tailoring processing in background...", "success");
      }
    } catch (err: any) {
      console.error(err);
      setIsTailoring(false);
      setTailoringStep("idle");
      showToast(err.message || "Failed to tailor resume.", "error");
    }
  };

  // Download Action
  const handleDownload = async () => {
    const jobId = tailoringResult?.job_id;
    if (!jobId) {
      showToast("No tailored resume available to download", "error");
      return;
    }

    showToast(`Downloading tailored resume (${outputFormat.toUpperCase()})...`, "success");

    if (isDemoMode) {
      // Mock client side file creation and download
      setTimeout(() => {
        let content = tailoringResult?.tailored_resume_markdown || "";
        let mime = "text/plain";
        let ext = outputFormat;
        
        if (outputFormat === "markdown") {
          mime = "text/markdown";
          ext = "md";
        } else if (outputFormat === "latex") {
          mime = "text/x-tex";
          ext = "tex";
          content = `% Mock LaTeX document\n\\documentclass{article}\n\\begin{document}\n${content}\n\\end{document}`;
        } else if (outputFormat === "docx") {
          content = "Mock DOCX binary content placeholder\n" + content;
          mime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else if (outputFormat === "pdf") {
          content = "Mock PDF binary content placeholder\n" + content;
          mime = "application/pdf";
        }

        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `tailored_resume.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast("Demo file downloaded successfully", "success");
      }, 800);
      return;
    }

    try {
      const filename = resumeMetadata?.filename 
        ? `${resumeMetadata.filename.split(".")[0]}_tailored`
        : "tailored_resume";
      await downloadResumeFile(jobId, outputFormat, filename);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Download failed. Try another format.", "error");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  // Helper for rendering markdown safely
  const getMarkdownHtml = (markdownStr?: string) => {
    if (!markdownStr) return "";
    try {
      return marked.parse(markdownStr);
    } catch (e) {
      // Basic text parser fallback
      return markdownStr
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold my-4">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold my-3">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold my-2">$1</h3>')
        .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, "<br />");
    }
  };

  if (!mounted) return null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Header / Mode Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 backdrop-blur-md border border-border p-5 rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-accent w-5 h-5 animate-pulse" />
              <h1 className="text-2xl font-black font-[family-name:var(--font-instrument-serif)] text-foreground tracking-tight">
                JD-Based Resume Tailor
              </h1>
            </div>
            <p className="text-xs text-foreground-secondary font-medium">
              Polish and optimize your resume keywords to align with job descriptions instantly.
            </p>
          </div>
          
          <div className="flex items-center gap-4 self-stretch md:self-auto justify-between">
            {/* Demo mode controller */}
            <div className="flex items-center gap-2 bg-muted p-1.5 rounded-xl border border-border/60">
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg transition-colors ${
                !isDemoMode 
                  ? "bg-foreground text-background" 
                  : "text-foreground-secondary hover:text-foreground cursor-pointer"
              }`}
              onClick={() => toggleDemoMode(false)}>
                PROD API
              </span>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                isDemoMode 
                  ? "bg-accent text-white" 
                  : "text-foreground-secondary hover:text-foreground cursor-pointer"
              }`}
              onClick={() => toggleDemoMode(true)}>
                DEMO MODE
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </span>
            </div>

            {token && (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border/80 hover:bg-muted text-xs font-bold rounded-xl text-rose-500 transition-colors"
                title="Log out from system"
              >
                <LogOut size={13} />
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Auth Guardian Screen */}
        {!token ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-accent/20 via-accent to-accent/20" />
              
              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-accent-light flex items-center justify-center text-accent mb-3">
                  <Lock size={22} className="animate-pulse" />
                </div>
                <h2 className="text-xl font-extrabold text-foreground">Secure Portal Login</h2>
                <p className="text-xs text-foreground-secondary mt-1">Authenticate to unlock resume engineering tools</p>
              </div>

              {authError && (
                <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-2xl text-xs flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">Username</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary" />
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border focus:border-accent rounded-xl text-xs outline-none transition-colors text-foreground font-semibold"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">Password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border focus:border-accent rounded-xl text-xs outline-none transition-colors text-foreground font-semibold"
                      placeholder="Enter password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 mt-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {authLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Authenticating User...
                    </>
                  ) : (
                    <>
                      Unlock Suite
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {isDemoMode && (
                <div className="mt-5 pt-4 border-t border-border/80 text-center">
                  <p className="text-[10px] text-accent/80 font-medium bg-accent-light/40 py-1.5 px-3 rounded-xl inline-block">
                    ⚡ You are in Demo Mode. Clicking unlock will bypass real JWT.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* Tailor UI Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (Controls & Inputs) - 5 Cols */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              {/* Step 1: Upload Resume */}
              <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-accent-light text-accent flex items-center justify-center font-black text-xs">
                      1
                    </div>
                    <h3 className="font-bold text-sm text-foreground">Base Resume</h3>
                  </div>
                  {resumeMetadata && (
                    <button 
                      onClick={clearUploadedFile}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      Clear File
                    </button>
                  )}
                </div>

                {resumeMetadata ? (
                  /* Uploaded File Detail card */
                  <div className="bg-muted/40 border border-border p-4 rounded-2xl flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center text-accent shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-foreground truncate">{resumeMetadata.filename}</h4>
                      <p className="text-[10px] text-foreground-secondary font-semibold mt-0.5">
                        Size: {((resumeMetadata.plain_text_length || 0) / 1024).toFixed(1)} KB • Extracted: {resumeMetadata.sections_found?.length || 0} sections
                      </p>
                      {resumeMetadata.sections_found && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {resumeMetadata.sections_found.map((s) => (
                            <span key={s} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-border text-foreground-secondary uppercase tracking-wider">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {resumeBlobUrl && (
                        <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-border/40">
                          <button
                            type="button"
                            onClick={() => window.open(resumeBlobUrl)}
                            className="text-[10px] font-bold text-accent hover:text-accent/80 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Eye size={12} />
                            Preview PDF
                          </button>
                          <a
                            href={resumeBlobUrl}
                            download={resumeMetadata.filename}
                            className="text-[10px] font-bold text-foreground-secondary hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Download size={12} />
                            Download PDF
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Tab Switcher */}
                    <div className="flex bg-muted p-1 rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveResumeTab("upload")}
                        className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                          activeResumeTab === "upload"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-foreground-secondary hover:text-foreground"
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveResumeTab("paste")}
                        className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                          activeResumeTab === "paste"
                            ? "bg-background text-foreground shadow-sm"
                            : "text-foreground-secondary hover:text-foreground"
                        }`}
                      >
                        Paste Text
                      </button>
                    </div>

                    {activeResumeTab === "upload" ? (
                      /* Drop zone */
                      <div
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all ${
                          dragActive 
                            ? "border-accent bg-accent-light/10" 
                            : "border-border hover:border-accent hover:bg-muted/30"
                        }`}
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept=".pdf,.docx,.txt,.tex"
                          className="hidden"
                        />
                        
                        {isUploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-accent" size={24} />
                            <span className="text-[11px] font-bold text-foreground">Reading and parsing resume...</span>
                          </div>
                        ) : (
                          <>
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-foreground-secondary">
                              <Upload size={18} />
                            </div>
                            <div className="text-center">
                              <p className="text-xs font-black text-foreground">Drag & Drop base resume file</p>
                              <p className="text-[10px] text-foreground-secondary mt-0.5 font-medium">
                                Supports PDF, DOCX, TXT, TEX (Max 10MB)
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      /* Paste Text Area */
                      <div className="space-y-3">
                        <textarea
                          value={pastedResumeText}
                          onChange={(e) => handlePastedResumeChange(e.target.value)}
                          placeholder="Paste your plain text or raw LaTeX resume here (e.g., beginning with \documentclass)..."
                          rows={6}
                          className="w-full p-3 bg-muted/40 border border-border rounded-xl text-xs outline-none focus:border-accent text-foreground font-semibold placeholder:text-muted-foreground/80 resize-none"
                        />

                        {showLatexBadge && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-light/40 border border-accent/20 rounded-xl text-accent text-[10px] font-bold animate-fade-in">
                            <Sparkles size={12} className="animate-pulse" />
                            ✨ LaTeX formatting signature detected
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={handleSavePastedResume}
                          disabled={isUploading}
                          className="w-full py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                        >
                          {isUploading ? (
                            <>
                              <Loader2 size={13} className="animate-spin" />
                              Parsing Resume...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={13} />
                              Save & Parse Resume
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step 2: JD Ingestion */}
              <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-border/80 pb-3">
                  <div className="w-7 h-7 rounded-lg bg-accent-light text-accent flex items-center justify-center font-black text-xs">
                    2
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Job Description (JD) Ingestion</h3>
                </div>

                {/* Tabs */}
                <div className="flex bg-muted p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveJdTab("paste")}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${
                      activeJdTab === "paste" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-foreground-secondary hover:text-foreground"
                    }`}
                  >
                    Paste JD Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveJdTab("url")}
                    className={`flex-1 py-2 text-[10px] font-black rounded-lg transition-all ${
                      activeJdTab === "url" 
                        ? "bg-background text-foreground shadow-sm" 
                        : "text-foreground-secondary hover:text-foreground"
                    }`}
                  >
                    Import Job URL
                  </button>
                </div>

                <form onSubmit={handleJdSubmit} className="space-y-3">
                  {activeJdTab === "paste" ? (
                    <textarea
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      placeholder="Paste raw job description requirements here..."
                      rows={6}
                      className="w-full p-3 bg-muted/40 border border-border rounded-xl text-xs outline-none focus:border-accent text-foreground font-semibold placeholder:text-muted-foreground/80 resize-none"
                    />
                  ) : (
                    <div className="relative">
                      <LinkIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary" />
                      <input
                        type="url"
                        value={jdUrl}
                        onChange={(e) => setJdUrl(e.target.value)}
                        placeholder="Paste LinkedIn, Indeed, Careers URL"
                        className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl text-xs outline-none focus:border-accent text-foreground font-semibold placeholder:text-muted-foreground/80"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isExtracting}
                    className="w-full py-2.5 bg-muted border border-border hover:bg-border active:scale-[0.98] text-foreground text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 size={13} className="animate-spin text-accent" />
                        Extracting Parameters...
                      </>
                    ) : (
                      <>
                        <Briefcase size={13} />
                        Parse Job Parameters
                      </>
                    )}
                  </button>
                </form>

                {/* Extracted Details */}
                {extractedJd && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 pt-3 border-t border-border/80"
                  >
                    {/* Skills lists */}
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black text-foreground-secondary uppercase tracking-widest">Extracted Attribute Mapping</h4>
                      
                      <div className="space-y-2">
                        {extractedJd.required_skills?.length > 0 && (
                          <div>
                            <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide block mb-1">Required Skills:</span>
                            <div className="flex flex-wrap gap-1">
                              {extractedJd.required_skills.map((s) => (
                                <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/15">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {extractedJd.nice_to_have_skills?.length > 0 && (
                          <div>
                            <span className="text-[9px] font-bold text-accent-secondary uppercase tracking-wide block mb-1">Nice-To-Have Skills:</span>
                            <div className="flex flex-wrap gap-1">
                              {extractedJd.nice_to_have_skills.map((s) => (
                                <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-secondary/10 text-accent-secondary border border-accent-secondary/15">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {extractedJd.tools_and_technologies?.length > 0 && (
                          <div>
                            <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-wide block mb-1">Tools & Tech:</span>
                            <div className="flex flex-wrap gap-1">
                              {extractedJd.tools_and_technologies.map((s) => (
                                <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded bg-border text-foreground-secondary">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Seniority badge */}
                    {extractedJd.seniority_level && (
                      <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                        <span className="text-[10px] font-black text-foreground-secondary uppercase tracking-widest">Seniority:</span>
                        <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-[10px] font-bold border border-accent/15 capitalize">
                          {extractedJd.seniority_level}
                        </span>
                      </div>
                    )}

                    {/* Responsibilities review checklist */}
                    {extractedJd.responsibilities?.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-foreground-secondary uppercase tracking-wide block">Review Core Responsibilities (Checked will be targeted):</span>
                        <div className="max-h-36 overflow-y-auto border border-border rounded-xl p-2.5 space-y-1.5 bg-muted/10">
                          {extractedJd.responsibilities.map((resp, i) => {
                            const isChecked = selectedResponsibilities.includes(resp);
                            return (
                              <div 
                                key={i} 
                                onClick={() => toggleResponsibility(resp)}
                                className="flex items-start gap-2 cursor-pointer select-none group"
                              >
                                <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                  isChecked 
                                    ? "bg-accent border-accent text-white" 
                                    : "border-border group-hover:border-foreground-secondary"
                                }`}>
                                  {isChecked && <Check size={10} strokeWidth={3} />}
                                </div>
                                <span className={`text-[10px] font-semibold leading-normal ${
                                  isChecked ? "text-foreground" : "text-foreground-secondary"
                                }`}>
                                  {resp}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Step 3: Configurations */}
              <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-border/80 pb-3">
                  <div className="w-7 h-7 rounded-lg bg-accent-light text-accent flex items-center justify-center font-black text-xs">
                    3
                  </div>
                  <h3 className="font-bold text-sm text-foreground">Pipeline Settings</h3>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">Format Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-accent rounded-xl text-xs outline-none text-foreground font-semibold cursor-pointer"
                    >
                      <option value="professional">Professional (Default)</option>
                      <option value="concise">Concise</option>
                      <option value="impact-driven">Impact-driven</option>
                      <option value="leadership-focused">Leadership-focused</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">Output Format</label>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value)}
                      className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-accent rounded-xl text-xs outline-none text-foreground font-semibold cursor-pointer"
                    >
                      <option value="docx">Microsoft Word (.docx)</option>
                      <option value="pdf">Adobe PDF (.pdf)</option>
                      <option value="markdown">Markdown (.md)</option>
                      <option value="latex">LaTeX Source (.tex)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCheckAtsScore}
                    disabled={isScoring || isTailoring}
                    className="col-span-1 py-3 bg-muted border border-border hover:bg-border text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isScoring ? (
                      <Loader2 size={13} className="animate-spin mx-auto text-foreground-secondary" />
                    ) : (
                      "Check ATS"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleTailorResume}
                    disabled={isTailoring || isScoring}
                    className="col-span-2 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {isTailoring ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={13} />
                        Tailor Resume
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column (Visualizations & Output Preview) - 7 Cols */}
            <div className="lg:col-span-7 h-full">
              <div className="bg-card border border-border rounded-3xl p-6 shadow-sm min-h-[500px] flex flex-col relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-accent/35 to-transparent" />
                
                {/* Empty State / Standby */}
                {!isTailoring && !tailoringResult && !atsScore && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-foreground-secondary mb-4">
                      <FileSpreadsheet size={32} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-extrabold text-base text-foreground mb-1">Awaiting Job Parameters</h3>
                    <p className="text-xs text-foreground-secondary max-w-sm leading-relaxed">
                      Upload your current resume and ingest a Job Description on the left, then trigger "ATS Score" or "Tailor Resume" to inspect matches.
                    </p>
                  </div>
                )}

                {/* Standalone ATS Score View (If clicked check ATS score before tailoring) */}
                {!isTailoring && atsScore && !tailoringResult && (
                  <div className="flex-1 flex flex-col gap-5">
                    <div className="flex items-center justify-between border-b border-border/80 pb-3">
                      <h3 className="font-extrabold text-sm text-foreground">ATS Score Breakdown (Pre-Tailored)</h3>
                      <button 
                        onClick={() => setAtsScore(null)} 
                        className="p-1 hover:bg-muted rounded-lg text-foreground-secondary transition-colors"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-muted/30 border border-border/60 p-4 rounded-2xl items-center text-center">
                      <div className="flex justify-center md:col-span-1">
                        <CircularProgress 
                          score={atsScore.overall_score} 
                          size={90} 
                          strokeWidth={8} 
                          colorClass={atsScore.overall_score > 70 ? "text-emerald-500" : atsScore.overall_score > 45 ? "text-amber-500" : "text-rose-500"}
                          label="Overall Score"
                        />
                      </div>
                      <div className="md:col-span-2 text-left space-y-2">
                        <h4 className="font-bold text-xs text-foreground">ATS Diagnostic Insights</h4>
                        <p className="text-[11px] text-foreground-secondary leading-relaxed">
                          Your resume matches **{atsScore.keyword_match_pct}%** of the job description keywords. We detected **{atsScore.missing_keywords?.length || 0} missing keywords** and **{atsScore.formatting_issues?.length || 0} formatting structural warnings**.
                        </p>
                      </div>
                    </div>

                    {/* Section breakdowns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {atsScore.section_scores?.map((s) => (
                        <div key={s.name} className="p-3 bg-card border border-border rounded-xl text-center">
                          <span className="text-[10px] font-bold text-foreground-secondary block mb-1.5 truncate">{s.name}</span>
                          <span className="text-lg font-black text-foreground">{s.score} <span className="text-xs text-foreground-secondary font-medium">/ {s.max_score}</span></span>
                        </div>
                      ))}
                    </div>

                    {/* Key gaps */}
                    <div className="space-y-2 flex-1">
                      <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">Identified Keyword Gaps</span>
                      <div className="border border-border rounded-xl overflow-hidden text-xs max-h-48 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-muted text-[10px] font-bold uppercase tracking-wider text-foreground-secondary border-b border-border">
                              <th className="p-2.5">Keyword</th>
                              <th className="p-2.5">Priority</th>
                              <th className="p-2.5 text-right">State</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {atsScore.missing_keywords?.map((kw, i) => (
                              <tr key={i} className="hover:bg-muted/10 transition-colors">
                                <td className="p-2.5 font-bold text-foreground">{kw.keyword}</td>
                                <td className="p-2.5 capitalize text-[10px] font-semibold text-foreground-secondary">{kw.importance}</td>
                                <td className="p-2.5 text-right">
                                  <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/15">
                                    Missing
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {atsScore.matched_keywords?.map((kw, i) => (
                              <tr key={i} className="hover:bg-muted/10 transition-colors">
                                <td className="p-2.5 font-bold text-foreground">{kw.keyword}</td>
                                <td className="p-2.5 capitalize text-[10px] font-semibold text-foreground-secondary">{kw.importance}</td>
                                <td className="p-2.5 text-right">
                                  <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/15">
                                    Matched
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing Loader */}
                {isTailoring && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <Loader2 size={36} className="animate-spin text-accent shrink-0" />
                      <div className="absolute inset-0 border border-accent/25 rounded-full animate-ping" />
                    </div>
                    
                    <div className="text-center space-y-1.5">
                      <h4 className="font-extrabold text-sm text-foreground">Tailoring Resume Pipeline Active</h4>
                      <p className="text-[11px] text-foreground-secondary max-w-xs font-semibold">
                        Executing LLM structural tailoring and compiling output formatting...
                      </p>
                    </div>

                    {/* Step log indicators */}
                    <div className="w-full max-w-xs bg-muted/50 border border-border p-3.5 rounded-2xl text-[11px] space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-foreground-secondary">Pipeline Progress Log</span>
                        <span className="text-[10px] text-accent animate-pulse">Running</span>
                      </div>
                      
                      <div className="space-y-1.5 font-semibold text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className={tailoringStep !== "idle" ? "text-foreground" : "text-muted-foreground"}>1. Scrape & parse Job Description</span>
                          {tailoringStep !== "extract" && tailoringStep !== "idle" ? (
                            <CheckCircle2 size={12} className="text-emerald-500" />
                          ) : tailoringStep === "extract" ? (
                            <Loader2 size={11} className="animate-spin text-accent" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={["history", "format", "score", "done"].includes(tailoringStep) ? "text-foreground" : "text-muted-foreground"}>2. Align professional history keywords</span>
                          {["format", "score", "done"].includes(tailoringStep) ? (
                            <CheckCircle2 size={12} className="text-emerald-500" />
                          ) : tailoringStep === "history" ? (
                            <Loader2 size={11} className="animate-spin text-accent" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={["format", "score", "done"].includes(tailoringStep) ? "text-foreground" : "text-muted-foreground"}>3. Generate output layout & files</span>
                          {["score", "done"].includes(tailoringStep) ? (
                            <CheckCircle2 size={12} className="text-emerald-500" />
                          ) : tailoringStep === "format" ? (
                            <Loader2 size={11} className="animate-spin text-accent" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className={["score", "done"].includes(tailoringStep) ? "text-foreground" : "text-muted-foreground"}>4. Recalculate match ATS score</span>
                          {tailoringStep === "done" ? (
                            <CheckCircle2 size={12} className="text-emerald-500" />
                          ) : tailoringStep === "score" ? (
                            <Loader2 size={11} className="animate-spin text-accent" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-border" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Results State */}
                {!isTailoring && tailoringResult && (
                  <div className="flex-1 flex flex-col">
                    
                    {/* Score comparison banner */}
                    <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 bg-muted/40 border border-border p-4 rounded-2xl mb-4 text-center md:text-left relative overflow-hidden">
                      <div className="md:col-span-5 flex items-center justify-center gap-6">
                        {tailoringResult.ats_score_before && (
                          <CircularProgress 
                            score={tailoringResult.ats_score_before.overall_score} 
                            size={70} 
                            strokeWidth={6} 
                            colorClass="text-rose-500"
                            label="Before"
                          />
                        )}
                        
                        <ArrowRight className="text-foreground-secondary w-5 h-5 shrink-0 hidden md:block" />

                        {tailoringResult.ats_score_after && (
                          <CircularProgress 
                            score={tailoringResult.ats_score_after.overall_score} 
                            size={75} 
                            strokeWidth={6} 
                            colorClass="text-emerald-500"
                            label="Optimized"
                          />
                        )}
                      </div>

                      <div className="md:col-span-7 flex flex-col justify-center space-y-1">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                          <TrendingUp size={12} />
                          Match Score Optimised Successfully
                        </span>
                        <h4 className="font-extrabold text-xs text-foreground">ATS Rating Boosted</h4>
                        <p className="text-[10px] text-foreground-secondary font-medium leading-normal">
                          Keyword match density increased from **{tailoringResult.ats_score_before?.keyword_match_pct || 0}%** to **{tailoringResult.ats_score_after?.keyword_match_pct || 0}%** by integrating critical responsibilities.
                        </p>
                      </div>
                    </div>

                    {/* Result Navigation tabs */}
                    <div className="flex bg-muted p-1 rounded-xl gap-1 mb-3">
                      <button
                        onClick={() => setActiveRightTab("changelog")}
                        className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                          activeRightTab === "changelog" 
                            ? "bg-background text-foreground shadow-sm" 
                            : "text-foreground-secondary hover:text-foreground"
                        }`}
                      >
                        Change Log
                      </button>
                      <button
                        onClick={() => setActiveRightTab("preview")}
                        className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                          activeRightTab === "preview" 
                            ? "bg-background text-foreground shadow-sm" 
                            : "text-foreground-secondary hover:text-foreground"
                        }`}
                      >
                        Markdown Preview
                      </button>
                      <button
                        onClick={() => setActiveRightTab("keywords")}
                        className={`flex-1 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                          activeRightTab === "keywords" 
                            ? "bg-background text-foreground shadow-sm" 
                            : "text-foreground-secondary hover:text-foreground"
                        }`}
                      >
                        Keywords Analysis
                      </button>
                    </div>

                    {/* Tab contents */}
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="flex-1 overflow-y-auto mb-4 border border-border/80 rounded-2xl p-4 bg-muted/15 custom-scrollbar min-h-[220px]">
                        
                        {/* Tab 1: Changelog */}
                        {activeRightTab === "changelog" && (
                          <div className="space-y-4">
                            {tailoringResult.change_summary && (
                              <div className="space-y-2">
                                <h4 className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">Modifications Done</h4>
                                <ul className="space-y-2">
                                  {tailoringResult.change_summary.map((change, i) => (
                                    <li key={i} className="text-xs text-foreground font-semibold flex items-start gap-2">
                                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                                      <span>{change}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {tailoringResult.missing_qualifications && tailoringResult.missing_qualifications.length > 0 && (
                              <div className="space-y-2 pt-3 border-t border-border/80">
                                <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                                  <AlertTriangle size={12} />
                                  Identified Qualification Gaps
                                </h4>
                                <ul className="space-y-2 bg-rose-500/5 border border-rose-500/15 p-3 rounded-xl">
                                  {tailoringResult.missing_qualifications.map((gap, i) => (
                                    <li key={i} className="text-xs text-rose-400 font-semibold flex items-start gap-2 leading-relaxed">
                                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                                      <span>{gap}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tab 2: Markdown Preview */}
                        {activeRightTab === "preview" && (
                          <div className="space-y-3 relative">
                            <div className="absolute right-2 top-0 z-10 flex gap-2">
                              <button
                                onClick={() => copyToClipboard(tailoringResult.tailored_resume_markdown || "")}
                                className="p-1.5 bg-background border border-border hover:bg-muted text-foreground-secondary hover:text-foreground rounded-lg transition-colors"
                                title="Copy Markdown"
                              >
                                <Copy size={13} />
                              </button>
                            </div>

                            <div 
                              className="prose prose-sm dark:prose-invert max-w-none text-xs text-foreground font-medium leading-relaxed font-sans"
                              dangerouslySetInnerHTML={{ __html: getMarkdownHtml(tailoringResult.tailored_resume_markdown) }}
                            />
                          </div>
                        )}

                        {/* Tab 3: Keywords match */}
                        {activeRightTab === "keywords" && tailoringResult.ats_score_after && (
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">Optimized Keyword Diagnostics</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {/* Matched */}
                              <div className="space-y-2 bg-emerald-500/5 border border-emerald-500/15 p-3 rounded-xl">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block border-b border-emerald-500/20 pb-1.5 mb-1.5">
                                  Matched ({tailoringResult.ats_score_after.matched_keywords?.length || 0})
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {tailoringResult.ats_score_after.matched_keywords?.map((kw, idx) => (
                                    <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/15">
                                      {kw.keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Missing */}
                              <div className="space-y-2 bg-rose-500/5 border border-rose-500/15 p-3 rounded-xl">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block border-b border-rose-500/20 pb-1.5 mb-1.5">
                                  Missing Gaps ({tailoringResult.ats_score_after.missing_keywords?.length || 0})
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {tailoringResult.ats_score_after.missing_keywords?.map((kw, idx) => (
                                    <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/15">
                                      {kw.keyword}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                      </div>

                      {/* Download Action banner */}
                      <div className="bg-muted border border-border p-3.5 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-accent-light text-accent flex items-center justify-center shrink-0">
                            {outputFormat === "pdf" ? <FileText size={16} /> : outputFormat === "docx" ? <FileSpreadsheet size={16} /> : <FileCode size={16} />}
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-foreground-secondary block">SELECTED OUTPUT FORMAT</span>
                            <span className="text-xs font-extrabold text-foreground uppercase">{outputFormat} Document</span>
                          </div>
                        </div>

                        <button
                          onClick={handleDownload}
                          className="px-4 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-[0.98] cursor-pointer shadow-sm"
                        >
                          <Download size={14} />
                          Download Resume
                        </button>
                      </div>

                    </div>

                  </div>
                )}
                
              </div>
            </div>

          </div>
        )}

      </main>
      <Footer />

      {/* Toast Notification Banner */}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-3 pointer-events-auto bg-card ${
                toastMessage.type === "success"
                  ? "border-emerald-500/20 text-foreground"
                  : "border-rose-500/20 text-foreground"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                toastMessage.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-rose-500/10 text-rose-400"
              }`}>
                {toastMessage.type === "success" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
              </div>
              <div className="flex-1 text-xs">
                <h5 className="font-bold text-foreground mb-0.5">
                  {toastMessage.type === "success" ? "Platform success event" : "Platform alert"}
                </h5>
                <p className="text-foreground-secondary font-medium leading-relaxed">{toastMessage.text}</p>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-foreground-secondary hover:text-foreground transition-colors cursor-pointer shrink-0 mt-0.5"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
