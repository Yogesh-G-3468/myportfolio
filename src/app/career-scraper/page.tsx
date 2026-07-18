"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar,
  Loader2,
  ArrowRight,
  Lock,
  User,
  LogOut,
  AlertTriangle,
  MapPin,
  Building2,
  Clock,
  ChevronDown,
  ExternalLink,
  Search,
  SlidersHorizontal,
  Briefcase,
  Activity,
  Target,
  BarChart3,
  Zap,
  RefreshCw,
  CheckCircle2,
  X,
  Settings,
  Plus,
  Globe,
  Check,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  BASE_URL,
  getStratosToken,
  saveStratosAuth,
  clearStratosAuth,
  stratosFetch,
} from "@/components/dashboard/api";

import {
  ScraperJob,
  ScraperRun,
  ScraperSite,
  ScraperPreferences,
  fetchScraperJobs,
  fetchScraperRuns,
  triggerScrapeNow,
  fetchScraperSites,
  addScraperSite,
  updateScraperSite,
  deleteScraperSite,
  fetchScraperPreferences,
  updateScraperPreferences,
  MOCK_SCRAPER_JOBS,
  MOCK_SCRAPER_RUNS,
  MOCK_SCRAPER_SITES,
  MOCK_SCRAPER_PREFERENCES,
} from "@/components/career-scraper/api";

// ── Helpers ────────────────────────────────────────────────────────────

const capitalize = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const relativeTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const formatDuration = (start: string, end: string | null): string => {
  if (!end) return "running…";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const totalSec = Math.round(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getRelevanceInfo = (score: number) => {
  if (score >= 0.8)
    return {
      label: "Excellent Match",
      color: "text-emerald-400",
      bg: "bg-emerald-500",
      bgLight: "bg-emerald-500/15",
      border: "border-emerald-500/30",
    };
  if (score >= 0.6)
    return {
      label: "Good Match",
      color: "text-blue-400",
      bg: "bg-blue-500",
      bgLight: "bg-blue-500/15",
      border: "border-blue-500/30",
    };
  return {
    label: "Fair Match",
    color: "text-amber-400",
    bg: "bg-amber-500",
    bgLight: "bg-amber-500/15",
    border: "border-amber-500/30",
  };
};

// ── Animated Counter ───────────────────────────────────────────────────

const AnimatedNumber = ({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) => {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    const duration = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = start + diff * eased;
      setDisplayed(current);
      if (progress < 1) requestAnimationFrame(animate);
      else ref.current = value;
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="tabular-nums">
      {decimals > 0 ? displayed.toFixed(decimals) : Math.round(displayed)}
      {suffix}
    </span>
  );
};

// ── Skeleton Card ──────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="bg-card/60 border border-border rounded-2xl p-5 animate-pulse">
    <div className="h-5 w-3/4 bg-muted rounded-lg mb-3" />
    <div className="h-3 w-1/2 bg-muted rounded-lg mb-4" />
    <div className="flex gap-3 mb-4">
      <div className="h-3 w-24 bg-muted rounded-lg" />
      <div className="h-3 w-20 bg-muted rounded-lg" />
    </div>
    <div className="h-2 w-full bg-muted rounded-full mb-3" />
    <div className="flex justify-between items-center">
      <div className="h-3 w-20 bg-muted rounded-lg" />
      <div className="h-8 w-16 bg-muted rounded-xl" />
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ══════════════════════════════════════════════════════════════════════

export default function CareerScraperPage() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Auth
  const [username, setUsername] = useState("yogesh");
  const [password, setPassword] = useState("testpassword");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Mode & Toast
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  // Job/Run Data
  const [jobs, setJobs] = useState<ScraperJob[]>([]);
  const [runs, setRuns] = useState<ScraperRun[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingRuns, setIsLoadingRuns] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  // Filter States
  const [minScore, setMinScore] = useState(0.5);
  const [limit, setLimit] = useState(50);
  const [searchText, setSearchText] = useState("");
  const [siteFilter, setSiteFilter] = useState("all");

  // Website Dictionary States
  const [showSitesDrawer, setShowSitesDrawer] = useState(false);
  const [demoSites, setDemoSites] = useState<ScraperSite[]>(MOCK_SCRAPER_SITES);
  const [sites, setSites] = useState<ScraperSite[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [siteSearchText, setSiteSearchText] = useState("");
  const [activeSitesCount, setActiveSitesCount] = useState(0);
  const [isBulkToggling, setIsBulkToggling] = useState(false);
  const [siteStatusTab, setSiteStatusTab] = useState<"all" | "active" | "inactive">("all");
  const [showAtsSources, setShowAtsSources] = useState(false);

  // Inline Site Editing States
  const [editingSiteId, setEditingSiteId] = useState<number | null>(null);
  const [editSiteName, setEditSiteName] = useState("");
  const [editSiteUrl, setEditSiteUrl] = useState("");
  const [isSavingSiteEdits, setIsSavingSiteEdits] = useState(false);

  // Add Site Form States
  const [newSiteName, setNewSiteName] = useState("");
  const [newSiteUrl, setNewSiteUrl] = useState("");
  const [newSiteActive, setNewSiteActive] = useState(true);
  const [isAddingSite, setIsAddingSite] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Scraper Preferences States
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [demoPreferences, setDemoPreferences] = useState<ScraperPreferences>(
    MOCK_SCRAPER_PREFERENCES
  );
  const [prefRoles, setPrefRoles] = useState<string[]>([]);
  const [prefLocations, setPrefLocations] = useState<string[]>([]);
  const [prefExperience, setPrefExperience] = useState("");
  const [prefMinScore, setPrefMinScore] = useState(0.5);
  const [prefInterval, setPrefInterval] = useState(1);
  const [telegramConfigured, setTelegramConfigured] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [showTelegramSetup, setShowTelegramSetup] = useState(false);
  
  // Tag Inputs
  const [newRoleInput, setNewRoleInput] = useState("");
  const [newLocInput, setNewLocInput] = useState("");

  // Collapsible sections
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [expandedErrorId, setExpandedErrorId] = useState<number | null>(null);

  // Refs
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // ── Mount & Auth Setup ─────────────────────────────────────────────

  useEffect(() => {
    setMounted(true);
    const savedToken = getStratosToken();
    const savedDemoMode =
      localStorage.getItem("stratos_demo_mode") === "true";
    setIsDemoMode(savedDemoMode);
    if (savedToken) {
      setToken(savedToken);
    } else if (savedDemoMode) {
      setToken("demo_token");
    }

    const handleUnauthorized = () => handleLogout();
    window.addEventListener("stratos-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("stratos-unauthorized", handleUnauthorized);
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  // Toast auto-dismiss
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toastMessage]);

  const showToast = (text: string, type: "success" | "error") =>
    setToastMessage({ text, type });

  // ── API Fetches ────────────────────────────────────────────────────

  const loadJobs = useCallback(
    async (ms: number = minScore, lm: number = limit) => {
      setIsLoadingJobs(true);
      if (isDemoMode) {
        setTimeout(() => {
          const filtered = MOCK_SCRAPER_JOBS.filter(
            (j) => j.relevance_score >= ms
          ).slice(0, lm);
          setJobs(filtered);
          setIsLoadingJobs(false);
        }, 600);
        return;
      }
      try {
        const data = await fetchScraperJobs(ms, lm);
        setJobs(data);
      } catch (err: any) {
        showToast(err.message || "Failed to load jobs", "error");
      } finally {
        setIsLoadingJobs(false);
      }
    },
    [isDemoMode, minScore, limit]
  );

  const loadRuns = useCallback(async () => {
    setIsLoadingRuns(true);
    if (isDemoMode) {
      setTimeout(() => {
        setRuns(MOCK_SCRAPER_RUNS);
        setIsLoadingRuns(false);
      }, 400);
      return;
    }
    try {
      const data = await fetchScraperRuns(10);
      setRuns(data);
    } catch (err: any) {
      showToast(err.message || "Failed to load scrape history", "error");
    } finally {
      setIsLoadingRuns(false);
    }
  }, [isDemoMode]);

  // Load active sites count
  const loadActiveSitesCount = useCallback(async () => {
    if (isDemoMode) {
      setActiveSitesCount(demoSites.filter((s) => s.is_active).length);
      return;
    }
    try {
      const activeSites = await fetchScraperSites("", true, 1000);
      setActiveSitesCount(activeSites.length);
    } catch (err) {
      console.error("Failed to load active sites count", err);
    }
  }, [isDemoMode, demoSites]);

  // Load candidate search preferences
  const loadPreferencesData = useCallback(async () => {
    if (isDemoMode) {
      setPrefRoles(demoPreferences.roles);
      setPrefLocations(demoPreferences.locations);
      setPrefExperience(demoPreferences.experience_range);
      setPrefMinScore(demoPreferences.min_relevance_score);
      setPrefInterval(demoPreferences.scrape_interval_hours);
      setTelegramConfigured(demoPreferences.telegram_configured ?? false);
      return;
    }
    try {
      const data = await fetchScraperPreferences();
      setPrefRoles(data.roles);
      setPrefLocations(data.locations);
      setPrefExperience(data.experience_range);
      setPrefMinScore(data.min_relevance_score);
      setPrefInterval(data.scrape_interval_hours);
      setTelegramConfigured(data.telegram_configured ?? false);
    } catch (err) {
      console.error("Failed to load scraper preferences", err);
    }
  }, [isDemoMode, demoPreferences]);

  // Load sites for the manager
  const loadSitesList = useCallback(
    async (searchQuery: string = siteSearchText, activeTab = siteStatusTab) => {
      setIsLoadingSites(true);
      const isActiveParam = activeTab === "all" ? undefined : activeTab === "active";

      if (isDemoMode) {
        setTimeout(() => {
          const filtered = demoSites.filter((site) => {
            const matchesSearch = site.site_name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesActive = isActiveParam === undefined || site.is_active === isActiveParam;
            return matchesSearch && matchesActive;
          });
          setSites(filtered);
          setIsLoadingSites(false);
        }, 300);
        return;
      }
      try {
        const data = await fetchScraperSites(searchQuery, isActiveParam, 100);
        setSites(data);
      } catch (err: any) {
        showToast(err.message || "Failed to fetch scraper sites", "error");
      } finally {
        setIsLoadingSites(false);
      }
    },
    [isDemoMode, demoSites, siteSearchText, siteStatusTab]
  );

  const loadAllData = useCallback(() => {
    loadJobs();
    loadRuns();
    loadActiveSitesCount();
    loadPreferencesData();
  }, [loadJobs, loadRuns, loadActiveSitesCount, loadPreferencesData]);

  // Load data when authenticated
  useEffect(() => {
    if (mounted && (token || isDemoMode)) {
      loadAllData();
    }
  }, [mounted, token, isDemoMode]);

  // Re-fetch jobs when filters shift
  useEffect(() => {
    if (mounted && (token || isDemoMode)) {
      loadJobs(minScore, limit);
    }
  }, [minScore, limit]);

  // Sync active count in demo mode
  useEffect(() => {
    if (isDemoMode) {
      setActiveSitesCount(demoSites.filter((s) => s.is_active).length);
    }
  }, [isDemoMode, demoSites]);

  // Trigger site list search on text change (debounced)
  useEffect(() => {
    if (!mounted || !(token || isDemoMode)) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      loadSitesList(siteSearchText, siteStatusTab);
    }, 300);
  }, [siteSearchText]);

  // Fetch list when status filter tab updates
  const handleTabChange = (tab: "all" | "active" | "inactive") => {
    setSiteStatusTab(tab);
    loadSitesList(siteSearchText, tab);
  };

  // Fetch full list once drawer is opened
  useEffect(() => {
    if (showSitesDrawer && (token || isDemoMode)) {
      loadSitesList("", siteStatusTab);
    }
  }, [showSitesDrawer]);

  // Refresh preferences state when modal is opened
  useEffect(() => {
    if (showPrefModal && (token || isDemoMode)) {
      loadPreferencesData();
    }
  }, [showPrefModal]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (mounted && (token || isDemoMode)) {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = setInterval(() => {
        loadAllData();
      }, 5 * 60 * 1000);
    }
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [mounted, token, isDemoMode, loadAllData]);

  // ── Actions ────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    if (isDemoMode) {
      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      saveStratosAuth("demo_token", expiresAt);
      setToken("demo_token");
      setAuthLoading(false);
      showToast("Demo login successful!", "success");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.detail || "Authentication rejected. Invalid credentials."
        );
      }
      const data = await response.json();
      const expiresAt = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString();
      saveStratosAuth(data.access_token, expiresAt);
      setToken(data.access_token);
      showToast("Successfully authenticated", "success");
    } catch (err: any) {
      setAuthError(err.message || "Something went wrong.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearStratosAuth();
    setToken(null);
    setJobs([]);
    setRuns([]);
    setSites([]);
    showToast("Logged out", "success");
  };

  const toggleDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    localStorage.setItem("stratos_demo_mode", val ? "true" : "false");
    if (val) {
      setToken("demo_token");
      showToast("Switched to Demo Mode", "success");
    } else {
      const savedToken = getStratosToken();
      setToken(savedToken);
      showToast("Switched to Production API Mode", "success");
    }
  };

  const handleRunScrape = async () => {
    setIsScraping(true);
    showToast("Starting full scrape cycle — this may take 30-90 seconds…", "success");

    if (isDemoMode) {
      setTimeout(() => {
        setIsScraping(false);
        showToast("Scrape completed! Found 4 new jobs (Demo)", "success");
        loadAllData();
      }, 3000);
      return;
    }

    try {
      await triggerScrapeNow();
      showToast("Scrape completed successfully!", "success");
      loadAllData();
    } catch (err: any) {
      showToast(err.message || "Scrape failed", "error");
    } finally {
      setIsScraping(false);
    }
  };

  // Toggle active state of a website
  const handleToggleSite = async (site: ScraperSite) => {
    const nextActive = !site.is_active;

    // Optimistic UI updates
    setSites((prev) =>
      prev.map((s) => (s.id === site.id ? { ...s, is_active: nextActive } : s))
    );

    if (isDemoMode) {
      setDemoSites((prev) =>
        prev.map((s) => (s.id === site.id ? { ...s, is_active: nextActive } : s))
      );
      showToast(
        `${capitalize(site.site_name)} is now ${
          nextActive ? "Active" : "Inactive"
        } (Demo)`,
        "success"
      );
      return;
    }

    try {
      await updateScraperSite(site.id, site.url, nextActive, site.site_name);
      showToast(
        `${capitalize(site.site_name)} has been ${
          nextActive ? "enabled" : "disabled"
        }`,
        "success"
      );
      loadActiveSitesCount();
    } catch (err: any) {
      // Revert state on failure
      setSites((prev) =>
        prev.map((s) => (s.id === site.id ? { ...s, is_active: !nextActive } : s))
      );
      showToast(err.message || "Failed to update website status", "error");
    }
  };

  // Add a new site to dictionary
  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim()) {
      showToast("Please enter a company name", "error");
      return;
    }
    if (!newSiteUrl.trim()) {
      showToast("Please enter a career page URL", "error");
      return;
    }

    setIsAddingSite(true);

    if (isDemoMode) {
      setTimeout(() => {
        const newSite: ScraperSite = {
          id: Math.max(...demoSites.map((s) => s.id), 0) + 1,
          site_name: newSiteName.trim(),
          url: newSiteUrl.trim(),
          site_type: "html",
          is_active: newSiteActive,
          last_success: null,
          fail_count: 0,
        };
        const updatedSites = [newSite, ...demoSites];
        setDemoSites(updatedSites);
        setSites((prev) => [newSite, ...prev]);

        setIsAddingSite(false);
        setNewSiteName("");
        setNewSiteUrl("");
        setShowAddForm(false);
        showToast(
          `Successfully registered ${newSiteName.trim()} in dictionary! (Demo)`,
          "success"
        );
      }, 600);
      return;
    }

    try {
      const added = await addScraperSite(
        newSiteName.trim(),
        newSiteUrl.trim(),
        newSiteActive
      );
      setSites((prev) => [added, ...prev]);
      loadActiveSitesCount();
      setIsAddingSite(false);
      setNewSiteName("");
      setNewSiteUrl("");
      setShowAddForm(false);
      showToast(`Successfully registered ${added.site_name}!`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to add website to dictionary", "error");
      setIsAddingSite(false);
    }
  };

  // Inline edit site triggers
  const handleStartEdit = (site: ScraperSite) => {
    setEditingSiteId(site.id);
    setEditSiteName(site.site_name);
    setEditSiteUrl(site.url);
  };

  const handleCancelSiteEdits = () => {
    setEditingSiteId(null);
    setEditSiteName("");
    setEditSiteUrl("");
  };

  const handleSaveSiteEdits = async (site: ScraperSite) => {
    if (!editSiteName.trim()) {
      showToast("Company name cannot be empty", "error");
      return;
    }
    if (!editSiteUrl.trim()) {
      showToast("Career page URL cannot be empty", "error");
      return;
    }

    setIsSavingSiteEdits(true);

    if (isDemoMode) {
      setTimeout(() => {
        const updated = demoSites.map((s) =>
          s.id === site.id
            ? { ...s, site_name: editSiteName.trim(), url: editSiteUrl.trim() }
            : s
        );
        setDemoSites(updated);
        setSites((prev) =>
          prev.map((s) =>
            s.id === site.id
              ? { ...s, site_name: editSiteName.trim(), url: editSiteUrl.trim() }
              : s
          )
        );
        setIsSavingSiteEdits(false);
        setEditingSiteId(null);
        showToast("Company details updated successfully (Demo)", "success");
      }, 500);
      return;
    }

    try {
      await updateScraperSite(
        site.id,
        editSiteUrl.trim(),
        site.is_active,
        editSiteName.trim()
      );
      setSites((prev) =>
        prev.map((s) =>
          s.id === site.id
            ? { ...s, site_name: editSiteName.trim(), url: editSiteUrl.trim() }
            : s
        )
      );
      showToast(`Successfully updated ${editSiteName.trim()}`, "success");
      setIsSavingSiteEdits(false);
      setEditingSiteId(null);
    } catch (err: any) {
      showToast(err.message || "Failed to update website details", "error");
      setIsSavingSiteEdits(false);
    }
  };

  // Delete site from list
  const handleDeleteSite = async (siteId: number, siteName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${siteName} from the scraper dictionary?`)) {
      return;
    }

    if (isDemoMode) {
      const updatedDemo = demoSites.filter((s) => s.id !== siteId);
      setDemoSites(updatedDemo);
      setSites((prev) => prev.filter((s) => s.id !== siteId));
      showToast(`${capitalize(siteName)} removed from dictionary (Demo)`, "success");
      return;
    }

    try {
      await deleteScraperSite(siteId);
      setSites((prev) => prev.filter((s) => s.id !== siteId));
      loadActiveSitesCount();
      showToast(`${capitalize(siteName)} removed from dictionary`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to delete scraper site", "error");
    }
  };

  // Bulk enable/disable sites listed
  const handleBulkToggle = async (activeState: boolean) => {
    if (sites.length === 0) return;
    
    setIsBulkToggling(true);
    showToast(`${activeState ? "Enabling" : "Disabling"} all listed sites...`, "success");

    if (isDemoMode) {
      setTimeout(() => {
        const updatedDemoSites = demoSites.map((s) => {
          const isMatched = sites.some((matched) => matched.id === s.id);
          return isMatched ? { ...s, is_active: activeState } : s;
        });
        setDemoSites(updatedDemoSites);
        setSites((prev) => prev.map((s) => ({ ...s, is_active: activeState })));
        setIsBulkToggling(false);
        showToast(`All listed sites have been ${activeState ? "enabled" : "disabled"} (Demo)`, "success");
      }, 600);
      return;
    }

    try {
      const sitesToUpdate = sites.filter((s) => s.is_active !== activeState);

      if (sitesToUpdate.length > 0) {
        await Promise.all(
          sitesToUpdate.map((s) =>
            updateScraperSite(s.id, s.url, activeState, s.site_name)
          )
        );
      }

      setSites((prev) => prev.map((s) => ({ ...s, is_active: activeState })));
      loadActiveSitesCount();
      showToast(`All listed sites have been ${activeState ? "enabled" : "disabled"}`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to bulk update sites", "error");
    } finally {
      setIsBulkToggling(false);
    }
  };

  // Save Scraper Preferences
  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPrefs(true);

    const payload: ScraperPreferences = {
      roles: prefRoles,
      locations: prefLocations,
      experience_range: prefExperience,
      min_relevance_score: prefMinScore,
      scrape_interval_hours: prefInterval,
      telegram_configured: telegramConfigured,
    };

    if (isDemoMode) {
      setTimeout(() => {
        setDemoPreferences(payload);
        setIsSavingPrefs(false);
        setShowPrefModal(false);
        showToast("Search preferences successfully saved! (Demo)", "success");
      }, 600);
      return;
    }

    try {
      await updateScraperPreferences(payload);
      showToast("Search preferences successfully updated!", "success");
      setIsSavingPrefs(false);
      setShowPrefModal(false);
    } catch (err: any) {
      showToast(err.message || "Failed to save preferences", "error");
      setIsSavingPrefs(false);
    }
  };

  // Add tag handlers
  const handleAddRole = () => {
    const val = newRoleInput.trim();
    if (val && !prefRoles.includes(val)) {
      setPrefRoles([...prefRoles, val]);
      setNewRoleInput("");
    }
  };

  const handleAddLocation = () => {
    const val = newLocInput.trim();
    if (val && !prefLocations.includes(val)) {
      setPrefLocations([...prefLocations, val]);
      setNewLocInput("");
    }
  };

  const handleRemoveRole = (role: string) => {
    setPrefRoles(prefRoles.filter((r) => r !== role));
  };

  const handleRemoveLocation = (loc: string) => {
    setPrefLocations(prefLocations.filter((l) => l !== loc));
  };

  const handleKeyDownTag = (
    e: React.KeyboardEvent,
    action: () => void
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      action();
    }
  };

  // ── Derived Data ───────────────────────────────────────────────────

  const latestRun = runs.length > 0 ? runs[0] : null;
  const totalJobs = jobs.length;
  const avgRelevance =
    jobs.length > 0
      ? jobs.reduce((sum, j) => sum + j.relevance_score, 0) / jobs.length
      : 0;

  const uniqueSites = Array.from(new Set(jobs.map((j) => j.site_name))).sort();
  const filteredJobs = jobs.filter((j) => {
    if (siteFilter !== "all" && j.site_name !== siteFilter) return false;
    if (
      searchText &&
      !j.title.toLowerCase().includes(searchText.toLowerCase())
    )
      return false;
    return true;
  });

  if (!mounted) return null;

  // ══════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* ── Toast Notifications ───────────────────────────────── */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className={`fixed top-20 left-1/2 z-[10005] px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 ${
                toastMessage.type === "success"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/15 border-rose-500/30 text-rose-400"
              }`}
            >
              {toastMessage.type === "success" ? (
                <CheckCircle2 size={14} />
              ) : (
                <AlertTriangle size={14} />
              )}
              {toastMessage.text}
              <button
                onClick={() => setToastMessage(null)}
                className="ml-2 hover:opacity-70 transition-opacity"
              >
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/40 backdrop-blur-md border border-border p-5 rounded-3xl shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Radar className="text-accent w-5 h-5 animate-pulse" />
              <h1 className="text-2xl font-black font-[family-name:var(--font-instrument-serif)] text-foreground tracking-tight">
                Career Radar
              </h1>
            </div>
            <p className="text-xs text-foreground-secondary font-medium">
              AI-powered job discovery — live ATS polling + browser scraping, matched to your profile
            </p>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between flex-wrap">
            {/* Demo mode toggle */}
            <div className="flex items-center gap-2 bg-muted p-1.5 rounded-xl border border-border/60">
              <span
                className={`text-[10px] font-black px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                  !isDemoMode
                    ? "bg-foreground text-background"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
                onClick={() => toggleDemoMode(false)}
              >
                PROD API
              </span>
              <span
                className={`text-[10px] font-black px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  isDemoMode
                    ? "bg-accent text-white"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
                onClick={() => toggleDemoMode(true)}
              >
                DEMO MODE
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              </span>
            </div>

            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-border/80 hover:bg-muted text-xs font-bold rounded-xl text-rose-500 transition-colors"
                title="Log out"
              >
                <LogOut size={13} />
                Logout
              </button>
            )}
          </div>
        </div>

        {/* ── Auth Guard ────────────────────────────────────────── */}
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
                <h2 className="text-xl font-extrabold text-foreground">
                  Secure Portal Login
                </h2>
                <p className="text-xs text-foreground-secondary mt-1">
                  Authenticate to access the career scraper dashboard
                </p>
              </div>

              {authError && (
                <div className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-2xl text-xs flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">
                    Username
                  </label>
                  <div className="relative">
                    <User
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary"
                    />
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
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-secondary"
                    />
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
                      Authenticating…
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
                    ⚡ You are in Demo Mode. Clicking unlock will bypass real
                    JWT.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* ══════════════════════════════════════════════════════
             AUTHENTICATED DASHBOARD
             ══════════════════════════════════════════════════════ */
          <div className="flex flex-col gap-6">
            
            {/* ── Control Row ───────────────────────────────────── */}
            <div className="flex justify-end gap-3 flex-wrap">
              <button
                onClick={() => setShowSitesDrawer(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-card border border-border hover:bg-muted text-foreground transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.97]"
              >
                <Globe size={14} className="text-foreground-secondary" />
                Manage Sites
              </button>

              <button
                onClick={() => setShowPrefModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black bg-card border border-border hover:bg-muted text-foreground transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.97]"
              >
                <Settings size={14} className="text-foreground-secondary" />
                Configure Preferences
              </button>

              <button
                onClick={handleRunScrape}
                disabled={isScraping}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all active:scale-[0.97] cursor-pointer disabled:cursor-wait ${
                  isScraping
                    ? "bg-accent/60 text-white/80"
                    : "bg-accent hover:bg-accent/90 text-white shadow-lg shadow-accent/20"
                }`}
              >
                {!isScraping && (
                  <span className="absolute inset-0 rounded-2xl animate-ping bg-accent/20 pointer-events-none" />
                )}
                {isScraping ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Scraping in progress…
                  </>
                ) : (
                  <>
                    <Zap size={14} />
                    Run Scrape Now
                  </>
                )}
              </button>
            </div>

            {/* ── Stats Bar ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                {
                  label: "Total Jobs Found",
                  value: totalJobs,
                  icon: <Briefcase size={16} className="text-accent" />,
                  suffix: "",
                },
                {
                  label: "New This Run",
                  value: latestRun?.new_jobs_found ?? 0,
                  icon: <Activity size={16} className="text-emerald-400" />,
                  suffix: "",
                },
                {
                  label: "Active Sites",
                  value: activeSitesCount,
                  icon: <Globe size={16} className="text-blue-400" />,
                  suffix: "",
                },
                {
                  label: "Avg Relevance",
                  value: Math.round(avgRelevance * 100),
                  icon: <BarChart3 size={16} className="text-amber-400" />,
                  suffix: "%",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 shadow-sm hover:border-accent/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {stat.icon}
                    <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-foreground tracking-tight">
                    <AnimatedNumber
                      value={stat.value}
                      suffix={stat.suffix}
                    />
                  </div>
                </motion.div>
              ))}

              {/* Last Scrape Card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
                className="bg-card/60 backdrop-blur-md border border-border rounded-2xl p-4 shadow-sm hover:border-accent/30 transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-violet-400" />
                  <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">
                    Last Scrape
                  </span>
                </div>
                <div className="text-lg font-black text-foreground tracking-tight">
                  {latestRun
                    ? relativeTime(latestRun.finished_at)
                    : "Never"}
                </div>
              </motion.div>
            </div>

            {/* ── Filter Controls ───────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-card/40 backdrop-blur-md border border-border rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <SlidersHorizontal
                  size={14}
                  className="text-foreground-secondary"
                />
                <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-wider">
                  Filters
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {/* Min Relevance Slider */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">
                    Min Relevance:{" "}
                    <span className="text-accent">
                      {(minScore * 100).toFixed(0)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={minScore * 100}
                    onChange={(e) =>
                      setMinScore(Number(e.target.value) / 100)
                    }
                    className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent"
                  />
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Limit Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">
                    Results Limit
                  </label>
                  <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-accent transition-colors cursor-pointer"
                  >
                    {[10, 25, 50, 100].map((v) => (
                      <option key={v} value={v}>
                        {v} results
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">
                    Search Title
                  </label>
                  <div className="relative">
                    <Search
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary"
                    />
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Filter by job title…"
                      className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-accent transition-colors"
                    />
                  </div>
                </div>

                {/* Site Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">
                    Company
                  </label>
                  <select
                    value={siteFilter}
                    onChange={(e) => setSiteFilter(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/50 border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-accent transition-colors cursor-pointer"
                  >
                    <option value="all">All Companies</option>
                    {uniqueSites.map((s) => (
                      <option key={s} value={s}>
                        {capitalize(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* ── Job Cards Grid ─────────────────────────────────── */}
            {isLoadingJobs ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-5">
                  <Briefcase
                    size={36}
                    className="text-foreground-secondary"
                  />
                </div>
                <h3 className="text-lg font-black text-foreground mb-1">
                  No jobs found yet
                </h3>
                <p className="text-xs text-foreground-secondary max-w-sm mb-5">
                  Click &ldquo;Run Scrape Now&rdquo; to start discovering
                  opportunities, or adjust your filters above.
                </p>
                <button
                  onClick={handleRunScrape}
                  disabled={isScraping}
                  className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white rounded-2xl text-xs font-black transition-all cursor-pointer disabled:opacity-50"
                >
                  <Zap size={14} />
                  Run Scrape Now
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredJobs.map((job, idx) => {
                  const rel = getRelevanceInfo(job.relevance_score);
                  return (
                    <motion.div
                      key={job.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: idx * 0.05,
                        duration: 0.35,
                        ease: "easeOut",
                      }}
                      className="group bg-card/60 backdrop-blur-md border border-border rounded-2xl p-5 shadow-sm hover:border-accent/30 hover:shadow-md transition-all duration-300"
                    >
                      {/* Title & Company */}
                      <h3 className="text-sm font-black text-foreground leading-snug mb-1 group-hover:text-accent transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-xs font-bold text-accent mb-3">
                        {capitalize(job.site_name)}
                      </p>

                      {/* Location & Department */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mb-3">
                        <span className="flex items-center gap-1 text-[11px] text-foreground-secondary">
                          <MapPin size={12} className="text-accent/60" />
                          {job.location}
                        </span>
                        {job.department && (
                          <span className="flex items-center gap-1 text-[11px] text-foreground-secondary">
                            <Building2
                              size={12}
                              className="text-accent/60"
                            />
                            {job.department}
                          </span>
                        )}
                      </div>

                      {/* Relevance Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${rel.color}`}
                          >
                            {rel.label}
                          </span>
                          <span
                            className={`text-[10px] font-black tabular-nums ${rel.color}`}
                          >
                            {Math.round(job.relevance_score * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${job.relevance_score * 100}%`,
                            }}
                            transition={{
                              delay: idx * 0.05 + 0.3,
                              duration: 0.6,
                              ease: "easeOut",
                            }}
                            className={`h-full rounded-full ${rel.bg}`}
                          />
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-[10px] text-muted-foreground">
                        {job.posted_date && (
                          <span className="flex items-center gap-1">
                            <Clock size={10} />
                            Posted {relativeTime(job.posted_date)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Radar size={10} />
                          Found {relativeTime(job.discovered_at)}
                        </span>
                      </div>

                      {/* Apply Button */}
                      <a
                        href={job.apply_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent/10 hover:bg-accent/20 border border-accent/20 hover:border-accent/40 text-accent text-[11px] font-bold rounded-xl transition-all duration-200"
                      >
                        Apply
                        <ExternalLink size={11} />
                      </a>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ── Scrape History Section ─────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-card/40 backdrop-blur-md border border-border rounded-2xl shadow-sm overflow-hidden"
            >
              {/* Collapsible Header */}
              <button
                onClick={() => setHistoryExpanded(!historyExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw size={14} className="text-foreground-secondary" />
                  <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Scrape History
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    ({runs.length} runs)
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-foreground-secondary transition-transform duration-300 ${
                    historyExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {historyExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    {isLoadingRuns ? (
                      <div className="p-6 flex items-center justify-center">
                        <Loader2
                          size={20}
                          className="animate-spin text-foreground-secondary"
                        />
                      </div>
                    ) : runs.length === 0 ? (
                      <div className="p-6 text-center text-xs text-foreground-secondary">
                        No scrape runs recorded yet.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-t border-border bg-muted/30">
                              <th className="text-left px-4 py-2.5 font-bold text-foreground-secondary uppercase tracking-wider text-[10px]">
                                Started At
                              </th>
                              <th className="text-left px-4 py-2.5 font-bold text-foreground-secondary uppercase tracking-wider text-[10px]">
                                Duration
                              </th>
                              <th className="text-center px-4 py-2.5 font-bold text-foreground-secondary uppercase tracking-wider text-[10px]">
                                Sites
                              </th>
                              <th className="text-center px-4 py-2.5 font-bold text-foreground-secondary uppercase tracking-wider text-[10px]">
                                New Jobs
                              </th>
                              <th className="text-left px-4 py-2.5 font-bold text-foreground-secondary uppercase tracking-wider text-[10px]">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {runs.map((run) => {
                              const allSuccess =
                                run.sites_succeeded ===
                                run.sites_attempted;
                              const hasErrors =
                                run.errors !== null && run.errors !== "";
                              const rowColor = hasErrors
                                ? "border-l-2 border-l-rose-500/50"
                                : allSuccess
                                ? "border-l-2 border-l-emerald-500/50"
                                : "border-l-2 border-l-amber-500/50";

                              return (
                                <React.Fragment key={run.id}>
                                  <tr
                                    className={`border-t border-border hover:bg-muted/20 transition-colors ${rowColor}`}
                                  >
                                    <td className="px-4 py-3 text-foreground font-medium whitespace-nowrap">
                                      {formatDate(run.started_at)}
                                    </td>
                                    <td className="px-4 py-3 text-foreground-secondary font-medium tabular-nums whitespace-nowrap">
                                      {formatDuration(
                                        run.started_at,
                                        run.finished_at
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <span
                                        className={`font-bold tabular-nums ${
                                          allSuccess
                                            ? "text-emerald-400"
                                            : "text-amber-400"
                                        }`}
                                      >
                                        {run.sites_succeeded}
                                      </span>
                                      <span className="text-muted-foreground">
                                        {" "}
                                        / {run.sites_attempted}
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-center font-bold text-foreground tabular-nums">
                                      +{run.new_jobs_found}
                                    </td>
                                    <td className="px-4 py-3">
                                      {hasErrors ? (
                                        <button
                                          onClick={() =>
                                            setExpandedErrorId(
                                              expandedErrorId === run.id
                                                ? null
                                                : run.id
                                            )
                                          }
                                          className="flex items-center gap-1 text-rose-400 hover:text-rose-300 font-bold transition-colors cursor-pointer"
                                        >
                                          <AlertTriangle size={12} />
                                          Errors
                                          <ChevronDown
                                            size={12}
                                            className={`transition-transform ${
                                              expandedErrorId === run.id
                                                ? "rotate-180"
                                                : ""
                                            }`}
                                          />
                                        </button>
                                      ) : (
                                        <span className="flex items-center gap-1 text-emerald-400 font-bold">
                                          <CheckCircle2 size={12} />
                                          Success
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                  {/* Error detail row */}
                                  {hasErrors &&
                                    expandedErrorId === run.id && (
                                      <tr className="border-t border-border/50">
                                        <td
                                          colSpan={5}
                                          className="px-6 py-3 bg-rose-500/5"
                                        >
                                          <div className="text-[11px] text-rose-300 font-mono leading-relaxed whitespace-pre-wrap">
                                            {run.errors}
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════════
         WEBSITE DICTIONARY MANAGER DRAWER (SLIDE-OVER)
         ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showSitesDrawer && (
          <div className="fixed inset-0 z-[10000] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSitesDrawer(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-background-elevated border-l border-border shadow-2xl h-full flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-border flex items-center justify-between bg-card/25 backdrop-blur-md">
                <div>
                  <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
                    <Globe size={16} className="text-accent" />
                    Manage Sites
                  </h2>
                  <p className="text-[10px] text-foreground-secondary mt-0.5">
                    Enable, disable, or register career pages for hourly scraping.
                  </p>
                </div>
                <button
                  onClick={() => setShowSitesDrawer(false)}
                  className="p-1.5 text-foreground-secondary hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status Filter Tabs */}
              <div className="px-5 pt-3 flex gap-1 border-b border-border/40 bg-card/5">
                {[
                  { id: "all", label: "All Sites" },
                  { id: "active", label: "Active" },
                  { id: "inactive", label: "Inactive" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`pb-2 px-3 text-xs font-black relative cursor-pointer ${
                      siteStatusTab === tab.id
                        ? "text-accent"
                        : "text-foreground-secondary hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                    {siteStatusTab === tab.id && (
                      <motion.div
                        layoutId="activeTabUnderline"
                        className="absolute bottom-0 inset-x-0 h-0.5 bg-accent"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                
                {/* Add Site Collapsible Form */}
                <div className="border border-border/80 bg-muted/20 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-xs font-bold text-foreground cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Plus size={14} className="text-accent" />
                      Register New Website
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-foreground-secondary transition-transform ${
                        showAddForm ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showAddForm && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <form
                          onSubmit={handleAddSite}
                          className="p-4 space-y-3.5 border-t border-border/50 bg-card/10"
                        >
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-foreground-secondary uppercase tracking-widest block">
                              Company / Name
                            </label>
                            <input
                              type="text"
                              value={newSiteName}
                              onChange={(e) => setNewSiteName(e.target.value)}
                              placeholder="e.g., OpenAI"
                              className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-accent rounded-xl text-xs font-semibold outline-none transition-colors"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-foreground-secondary uppercase tracking-widest block">
                              Career Page URL
                            </label>
                            <input
                              type="url"
                              value={newSiteUrl}
                              onChange={(e) => setNewSiteUrl(e.target.value)}
                              placeholder="https://openai.com/careers"
                              className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-accent rounded-xl text-xs font-semibold outline-none transition-colors"
                              required
                            />
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest">
                              Active immediately
                            </span>
                            <button
                              type="button"
                              onClick={() => setNewSiteActive(!newSiteActive)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                                newSiteActive ? "bg-accent" : "bg-muted"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                  newSiteActive ? "translate-x-4" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </div>

                          <button
                            type="submit"
                            disabled={isAddingSite}
                            className="w-full py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 active:scale-[0.98] cursor-pointer disabled:opacity-60"
                          >
                            {isAddingSite ? (
                              <>
                                <Loader2 size={13} className="animate-spin" />
                                Adding website…
                              </>
                            ) : (
                              <>
                                <Check size={13} />
                                Register Site
                              </>
                            )}
                          </button>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search
                    size={13}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary"
                  />
                  <input
                    type="text"
                    value={siteSearchText}
                    onChange={(e) => setSiteSearchText(e.target.value)}
                    placeholder="Search dictionary of 600+ companies…"
                    className="w-full pl-9 pr-8 py-2 bg-muted/30 border border-border focus:border-accent rounded-xl text-xs font-semibold text-foreground outline-none transition-colors"
                  />
                  {siteSearchText && (
                    <button
                      onClick={() => setSiteSearchText("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-secondary hover:text-foreground"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Bulk Actions Row */}
                <div className="flex items-center justify-between px-1 text-[10px] font-bold text-foreground-secondary">
                  <span>{sites.length} site{sites.length !== 1 ? 's' : ''} listed</span>
                  {isBulkToggling ? (
                    <span className="flex items-center gap-1 text-accent animate-pulse">
                      <Loader2 size={10} className="animate-spin" />
                      Updating…
                    </span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleBulkToggle(true)}
                        className="text-accent hover:text-accent/80 transition-colors cursor-pointer uppercase tracking-wider"
                      >
                        Enable All
                      </button>
                      <span className="text-border">|</span>
                      <button
                        type="button"
                        onClick={() => handleBulkToggle(false)}
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer uppercase tracking-wider"
                      >
                        Disable All
                      </button>
                    </div>
                  )}
                </div>

                {/* Scrollable Website List */}
                <div className="space-y-2 max-h-[calc(100vh-340px)] overflow-y-auto pr-1 font-sans">
                  {isLoadingSites ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <Loader2
                        size={20}
                        className="animate-spin text-accent"
                      />
                      <span className="text-[10px] text-foreground-secondary font-bold uppercase tracking-wider">
                        Searching dictionary…
                      </span>
                    </div>
                  ) : sites.length === 0 ? (
                    <div className="py-12 text-center text-xs text-foreground-secondary">
                      No matching websites found.
                    </div>
                  ) : (
                    sites.map((site) => {
                      const isEditing = editingSiteId === site.id;

                      return (
                        <div
                          key={site.id}
                          className="p-3.5 bg-card/30 border border-border/80 hover:border-accent/20 rounded-2xl transition-all duration-200"
                        >
                          {isEditing ? (
                            <div className="space-y-3">
                              {/* Inline Edit Inputs */}
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-foreground-secondary uppercase tracking-widest block">
                                  Company Name
                                </label>
                                <input
                                  type="text"
                                  value={editSiteName}
                                  onChange={(e) => setEditSiteName(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-xl text-xs font-semibold outline-none focus:border-accent transition-colors"
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] font-bold text-foreground-secondary uppercase tracking-widest block">
                                  Career Page URL
                                </label>
                                <input
                                  type="url"
                                  value={editSiteUrl}
                                  onChange={(e) => setEditSiteUrl(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-xl text-xs font-semibold outline-none focus:border-accent transition-colors"
                                  required
                                />
                              </div>

                              {/* Edit Action Row */}
                              <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
                                <button
                                  type="button"
                                  onClick={handleCancelSiteEdits}
                                  className="px-2.5 py-1 border border-border/80 hover:bg-muted text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                                  title="Cancel"
                                >
                                  <X size={10} />
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveSiteEdits(site)}
                                  disabled={isSavingSiteEdits}
                                  className="px-2.5 py-1 bg-accent hover:bg-accent/90 text-white text-[10px] font-black rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-60"
                                  title="Save Edits"
                                >
                                  {isSavingSiteEdits ? (
                                    <Loader2 size={10} className="animate-spin" />
                                  ) : (
                                    <Check size={10} />
                                  )}
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* Unedited View */
                            <div className="flex flex-col gap-2">
                              <div className="flex items-start justify-between">
                                <div className="space-y-0.5 max-w-[60%]">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-black text-foreground truncate">
                                      {site.site_name}
                                    </span>
                                    
                                    {/* Type badge */}
                                    <span className="px-1.5 py-0.2 border border-border/60 bg-muted/60 text-muted-secondary text-[8px] font-bold uppercase tracking-wider rounded">
                                      {site.site_type ? site.site_type : "—"}
                                    </span>

                                    {/* Fail count badge */}
                                    {site.fail_count !== undefined && site.fail_count > 0 && (
                                      <span className="px-1.5 py-0.2 bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[8px] font-bold tracking-wider rounded">
                                        FAIL: {site.fail_count}
                                      </span>
                                    )}
                                  </div>
                                  <a
                                    href={site.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-[10px] text-accent/80 hover:text-accent font-semibold transition-colors truncate max-w-full"
                                  >
                                    Visit careers page
                                    <ExternalLink size={8} />
                                  </a>
                                </div>

                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                  {/* Edit pencil button */}
                                  <button
                                    onClick={() => handleStartEdit(site)}
                                    className="p-1 text-foreground-secondary hover:text-foreground hover:bg-muted rounded-lg transition-all cursor-pointer"
                                    title="Edit Website"
                                  >
                                    <Pencil size={11} />
                                  </button>

                                  {/* Delete trash button */}
                                  <button
                                    onClick={() => handleDeleteSite(site.id, site.site_name)}
                                    className="p-1 text-foreground-secondary hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                                    title="Delete Site"
                                  >
                                    <Trash2 size={11} />
                                  </button>

                                  {/* Active Toggle Switch */}
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={() => handleToggleSite(site)}
                                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                                        site.is_active ? "bg-accent" : "bg-muted"
                                      }`}
                                    >
                                      <span
                                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                          site.is_active ? "translate-x-4" : "translate-x-0"
                                        }`}
                                      />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Relative Scraped success timestamp */}
                              <div className="text-[9px] text-muted-foreground font-medium flex items-center gap-1">
                                <Clock size={8} />
                                Last success: {site.last_success ? relativeTime(site.last_success) : "Never"}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* ── Direct ATS Polling Section ────────────────── */}
                <div className="border border-border/80 bg-muted/20 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    type="button"
                    onClick={() => setShowAtsSources(!showAtsSources)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/70 transition-colors text-xs font-bold text-foreground cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Target size={14} className="text-blue-400" />
                      Direct ATS Polling (FirstDips)
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-foreground-secondary transition-transform ${
                        showAtsSources ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {showAtsSources && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 space-y-3 border-t border-border/50 bg-card/10">
                          <p className="text-[10px] text-foreground-secondary leading-relaxed font-medium">
                            These companies are polled directly via their ATS API (Greenhouse, Lever, Ashby, Workday) every hour — no browser required. New jobs trigger instant Telegram alerts.
                          </p>
                          <div className="overflow-x-auto rounded-xl border border-border/85 bg-card/45">
                            <table className="w-full text-left text-[10px]">
                              <thead>
                                <tr className="bg-muted/50 border-b border-border/80">
                                  <th className="px-3 py-2 font-black text-foreground-secondary uppercase tracking-wider">Company</th>
                                  <th className="px-3 py-2 font-black text-foreground-secondary uppercase tracking-wider">ATS Platform</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { name: "Stripe", platform: "Greenhouse" },
                                  { name: "Spotify", platform: "Lever" },
                                  { name: "Vercel", platform: "Greenhouse" },
                                  { name: "Supabase", platform: "Greenhouse" },
                                  { name: "Cloudflare", platform: "Greenhouse" },
                                ].map((source) => (
                                  <tr key={source.name} className="border-b border-border/40 last:border-none hover:bg-muted/30 transition-colors">
                                    <td className="px-3 py-2 text-foreground font-semibold">{source.name}</td>
                                    <td className="px-3 py-2 text-foreground-secondary font-medium">{source.platform}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-[9px] text-muted-foreground italic leading-normal">
                            * To add more companies to the ATS polling list, edit <code className="font-mono text-accent bg-accent-light/50 px-1 py-0.2 rounded">app/scraper/firstdips/sources.yaml</code> on the server.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
         CONFIGURE PREFERENCES MODAL (CENTERED DIALOG)
         ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showPrefModal && (
          <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrefModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-background-elevated border border-border rounded-3xl p-6 shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden"
            >
              <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-accent/20 via-accent to-accent/20" />
              
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <Settings className="text-accent w-5 h-5" />
                  <h2 className="text-base font-extrabold text-foreground">
                    Search & Scraper Preferences
                  </h2>
                </div>
                <button
                  onClick={() => setShowPrefModal(false)}
                  className="p-1.5 text-foreground-secondary hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleSavePreferences}
                className="flex-1 overflow-y-auto py-4 space-y-5 font-sans"
              >
                
                {/* 1. Roles Tag Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest block">
                    Targeted Job Roles
                  </label>
                  
                  {/* Tag List */}
                  <div className="flex flex-wrap gap-1.5">
                    {prefRoles.length === 0 ? (
                      <span className="text-[11px] text-muted-foreground italic">
                        No roles added yet.
                      </span>
                    ) : (
                      prefRoles.map((role) => (
                        <span
                          key={role}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-light/50 border border-accent/25 text-accent text-[11px] font-bold rounded-lg"
                        >
                          {role}
                          <button
                            type="button"
                            onClick={() => handleRemoveRole(role)}
                            className="hover:text-foreground transition-colors cursor-pointer"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRoleInput}
                      onChange={(e) => setNewRoleInput(e.target.value)}
                      onKeyDown={(e) =>
                        handleKeyDownTag(e, handleAddRole)
                      }
                      placeholder="Add role (e.g. Data Engineer)..."
                      className="flex-1 px-3 py-1.5 bg-muted/40 border border-border focus:border-accent rounded-xl text-xs font-semibold outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddRole}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      Add
                    </button>
                  </div>
                </div>

                {/* 2. Locations Tag Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest block">
                    Target Locations
                  </label>
                  
                  {/* Tag List */}
                  <div className="flex flex-wrap gap-1.5">
                    {prefLocations.length === 0 ? (
                      <span className="text-[11px] text-muted-foreground italic">
                        No locations added yet.
                      </span>
                    ) : (
                      prefLocations.map((loc) => (
                        <span
                          key={loc}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent-light/50 border border-accent/25 text-accent text-[11px] font-bold rounded-lg"
                        >
                          {loc}
                          <button
                            type="button"
                            onClick={() => handleRemoveLocation(loc)}
                            className="hover:text-foreground transition-colors cursor-pointer"
                          >
                            <X size={11} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLocInput}
                      onChange={(e) => setNewLocInput(e.target.value)}
                      onKeyDown={(e) =>
                        handleKeyDownTag(e, handleAddLocation)
                      }
                      placeholder="Add location (e.g. Remote - India)..."
                      className="flex-1 px-3 py-1.5 bg-muted/40 border border-border focus:border-accent rounded-xl text-xs font-semibold outline-none transition-colors"
                    />
                    <button
                      type="button"
                      onClick={handleAddLocation}
                      className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      Add
                    </button>
                  </div>
                </div>

                {/* 3. Experience Range */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest block">
                    Required Experience Range
                  </label>
                  <input
                    type="text"
                    value={prefExperience}
                    onChange={(e) => setPrefExperience(e.target.value)}
                    placeholder="e.g. 2-6 years, Entry Level"
                    className="w-full px-3 py-2 bg-muted/40 border border-border focus:border-accent rounded-xl text-xs font-semibold outline-none transition-colors"
                    required
                  />
                </div>

                {/* 4. Min Relevance Score */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest block">
                    Cutoff Relevance Score:{" "}
                    <span className="text-accent font-black">
                      {Math.round(prefMinScore * 100)}%
                    </span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={prefMinScore * 100}
                    onChange={(e) =>
                      setPrefMinScore(Number(e.target.value) / 100)
                    }
                    className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-accent"
                  />
                  <div className="flex justify-between text-[9px] text-muted-foreground">
                    <span>0% (Any job matches)</span>
                    <span>100% (Strict match)</span>
                  </div>
                </div>

                {/* 5. Scrape Interval Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-foreground-secondary uppercase tracking-widest block">
                    Auto-Scrape Frequency
                  </label>
                  <select
                    value={prefInterval}
                    onChange={(e) => setPrefInterval(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-xs font-semibold text-foreground outline-none focus:border-accent transition-colors cursor-pointer"
                  >
                    {[1, 2, 6, 12, 24].map((hrs) => (
                      <option key={hrs} value={hrs}>
                        Scrape every {hrs} hour{hrs > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 6. Telegram Alerts Status (Modal Footer Sub-section) */}
                <div className="mt-4 pt-4 border-t border-border/85 font-sans space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-foreground">
                        🔔 Telegram Alerts
                      </span>
                    </div>
                    {telegramConfigured ? (
                      <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-wider">
                        ✅ Configured
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[9px] font-black uppercase tracking-wider">
                        ⚠ Not configured
                      </span>
                    )}
                  </div>

                  <div className={`p-3 rounded-2xl border text-[10px] font-semibold leading-relaxed ${
                    telegramConfigured 
                      ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-300/90" 
                      : "bg-rose-500/5 border-rose-500/10 text-rose-300/90"
                  }`}>
                    {telegramConfigured 
                      ? "Alerts will be sent automatically to your Telegram channel for new matching jobs."
                      : "Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in your .env file to enable push alerts."
                    }
                  </div>

                  {/* Collapsible Setup Guide */}
                  <div className="border border-border/80 bg-muted/10 rounded-xl overflow-hidden shadow-sm">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowTelegramSetup(!showTelegramSetup);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/40 transition-colors text-[10px] font-bold text-foreground-secondary cursor-pointer"
                    >
                      <span>How to set up Telegram push alerts</span>
                      <ChevronDown
                        size={12}
                        className={`text-foreground-secondary transition-transform ${
                          showTelegramSetup ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {showTelegramSetup && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-3 border-t border-border/50 space-y-2 text-[10px] text-foreground-secondary leading-normal bg-card/5">
                            <ol className="list-decimal list-inside space-y-1.5 font-medium">
                              <li>Message <code className="font-mono text-accent bg-accent-light/50 px-1 py-0.2 rounded">@BotFather</code> on Telegram to create your bot and receive your <code className="font-mono text-accent">TELEGRAM_BOT_TOKEN</code>.</li>
                              <li>Message <code className="font-mono text-accent bg-accent-light/50 px-1 py-0.2 rounded">@userinfobot</code> on Telegram to retrieve your <code className="font-mono text-accent">TELEGRAM_CHAT_ID</code>.</li>
                              <li>Add both variables to your backend host configuration <code className="font-mono text-accent">.env</code> file.</li>
                              <li>Restart the backend server to apply the changes. Alerts will begin firing automatically.</li>
                            </ol>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/80">
                  <button
                    type="button"
                    onClick={() => setShowPrefModal(false)}
                    className="px-4 py-2 border border-border/80 hover:bg-muted text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingPrefs}
                    className="px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 active:scale-[0.98] cursor-pointer disabled:opacity-60"
                  >
                    {isSavingPrefs ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Check size={13} />
                        Save Preferences
                      </>
                    )}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
