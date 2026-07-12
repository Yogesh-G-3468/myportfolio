import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Youtube,
  Loader2,
  Settings2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  FileText,
  RefreshCw,
  Plus,
  Database
} from "lucide-react";
import {
  stratosFetch,
  getNotionDatabases,
  getNotionPages,
  createNotionDatabase,
  NotionItem
} from "./api";
import { SummarizePayload, SummarizeResponse } from "./types";

interface YoutubeSummarizerProps {
  isDemoMode: boolean;
  setToastMessage: (msg: { text: string; type: "success" | "error" } | null) => void;
}

const MOCK_DATABASES = [
  { id: "db-1", title: "My YouTube Summaries" },
  { id: "db-2", title: "Learning & Development Notes" },
];

const MOCK_PAGES = [
  { id: "page-1", title: "Personal Workspace" },
  { id: "page-2", title: "Projects & Tasks" },
  { id: "page-3", title: "Study Notes" },
];

export const YoutubeSummarizer: React.FC<YoutubeSummarizerProps> = ({
  isDemoMode,
  setToastMessage
}) => {
  // Input fields
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [runInBackground, setRunInBackground] = useState(false);
  
  // Advanced options accordion
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [notionApiKey, setNotionApiKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [model, setModel] = useState("");

  // Notion Database & Page State
  const [databases, setDatabases] = useState<NotionItem[]>([]);
  const [pages, setPages] = useState<NotionItem[]>([]);
  const [selectedDbId, setSelectedDbId] = useState("");
  const [selectedPageId, setSelectedPageId] = useState("");
  const [newDbTitle, setNewDbTitle] = useState("");

  const [dbsLoading, setDbsLoading] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [createDbLoading, setCreateDbLoading] = useState(false);
  const [showCreateDb, setShowCreateDb] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<SummarizeResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchDatabases = async (apiKeyOverride?: string) => {
    if (isDemoMode) {
      setDbsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setDatabases([...MOCK_DATABASES]);
      if (MOCK_DATABASES.length > 0 && !selectedDbId) {
        setSelectedDbId(MOCK_DATABASES[0].id);
      }
      setDbsLoading(false);
      return;
    }

    setDbsLoading(true);
    try {
      const dbs = await getNotionDatabases(apiKeyOverride || notionApiKey);
      setDatabases(dbs);
      if (dbs.length > 0) {
        setSelectedDbId((prev) => {
          const exists = dbs.some((db) => db.id === prev);
          return exists ? prev : dbs[0].id;
        });
      } else {
        setSelectedDbId("");
      }
    } catch (err: any) {
      console.error(err);
      setToastMessage({ text: err.message || "Failed to load Notion databases.", type: "error" });
    } finally {
      setDbsLoading(false);
    }
  };

  const fetchPages = async (apiKeyOverride?: string) => {
    if (isDemoMode) {
      setPagesLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setPages([...MOCK_PAGES]);
      if (MOCK_PAGES.length > 0 && !selectedPageId) {
        setSelectedPageId(MOCK_PAGES[0].id);
      }
      setPagesLoading(false);
      return;
    }

    setPagesLoading(true);
    try {
      const pgs = await getNotionPages(apiKeyOverride || notionApiKey);
      setPages(pgs);
      if (pgs.length > 0) {
        setSelectedPageId((prev) => {
          const exists = pgs.some((p) => p.id === prev);
          return exists ? prev : pgs[0].id;
        });
      } else {
        setSelectedPageId("");
      }
    } catch (err: any) {
      console.error(err);
      setToastMessage({ text: err.message || "Failed to load Notion pages.", type: "error" });
    } finally {
      setPagesLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabases();
    fetchPages();
  }, [isDemoMode]);

  const handleRefreshDbs = () => {
    fetchDatabases(notionApiKey);
    fetchPages(notionApiKey);
  };

  const handleCreateDatabase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDbTitle.trim()) {
      setToastMessage({ text: "Please enter a database title.", type: "error" });
      return;
    }

    setCreateDbLoading(true);
    try {
      if (isDemoMode) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const newDb = {
          id: `db-created-${Date.now()}`,
          title: newDbTitle.trim(),
        };
        MOCK_DATABASES.unshift(newDb);
        await fetchDatabases();
        setSelectedDbId(newDb.id);
        setNewDbTitle("");
        setShowCreateDb(false);
        setToastMessage({ text: "Notion database created successfully (Sandbox Mode)!", type: "success" });
      } else {
        const parentId = selectedPageId || undefined;
        const newDb = await createNotionDatabase(newDbTitle.trim(), parentId, notionApiKey);
        setToastMessage({ text: "Notion database created successfully!", type: "success" });
        setNewDbTitle("");
        setShowCreateDb(false);
        setDatabases((prev) => [newDb, ...prev]);
        setSelectedDbId(newDb.id);
        await fetchDatabases();
        setSelectedDbId(newDb.id);
      }
    } catch (err: any) {
      console.error(err);
      setToastMessage({ text: err.message || "Failed to create database.", type: "error" });
    } finally {
      setCreateDbLoading(false);
    }
  };

  const getNotionUrl = (pageId: string) => {
    // Remove hyphens for standard Notion URL format
    const cleanId = pageId.replace(/-/g, "");
    return `https://notion.so/${cleanId}`;
  };

  const handleCopyLink = (pageId: string, index: number) => {
    const url = getNotionUrl(pageId);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    // Validate YouTube URL
    if (!youtubeUrl.trim()) {
      setError("Please enter a valid YouTube URL.");
      setLoading(false);
      return;
    }

    const payload: SummarizePayload = {
      youtube_url: youtubeUrl.trim(),
      run_in_background: runInBackground,
    };

    if (notionApiKey.trim()) payload.notion_api_key = notionApiKey.trim();
    if (selectedDbId) payload.notion_database_id = selectedDbId;
    if (geminiApiKey.trim()) payload.gemini_api_key = geminiApiKey.trim();
    if (model.trim()) payload.model = model.trim();

    if (isDemoMode) {
      // Simulate API call for demo mode
      setTimeout(() => {
        setLoading(false);
        if (runInBackground) {
          const mockRes: SummarizeResponse = {
            status: "processing",
            message: "YouTube notes summarization has been started in the background.",
            pages: []
          };
          setResponse(mockRes);
          setToastMessage({ text: "Background summarization started (Sandbox Mode)!", type: "success" });
        } else {
          const mockRes: SummarizeResponse = {
            status: "success",
            message: "Successfully created 1 note(s) in Notion (Sandbox Mode).",
            pages: ["e6c71c4c-35ff-4ab5-bc09-968b209d8492"]
          };
          setResponse(mockRes);
          setToastMessage({ text: "Notion note generated successfully (Sandbox Mode)!", type: "success" });
        }
      }, 2000);
      return;
    }

    try {
      const apiRes = await stratosFetch("/summarize/process", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!apiRes.ok) {
        let errMsg = "Summarization pipeline failed";
        try {
          const errBody = await apiRes.json();
          errMsg = errBody.detail || JSON.stringify(errBody);
        } catch {}
        throw new Error(errMsg);
      }

      const data: SummarizeResponse = await apiRes.json();
      setResponse(data);
      
      setToastMessage({
        text: runInBackground 
          ? "Summarization started in the background!" 
          : "Notion page created successfully!",
        type: "success"
      });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to process video summarization.");
      setToastMessage({ text: err.message || "Summarization failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col h-full">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Youtube size={14} className="text-cyan-500" />
        YouTube Notes Summarizer
      </h2>

      <div className="flex-1 bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 flex flex-col shadow-xl justify-start">
        <form onSubmit={handleSummarize} className="space-y-4 mb-5">
          {/* YouTube Video URL Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              YouTube Video URL
            </label>
            <input
              type="text"
              required
              placeholder="e.g. https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-650 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-xs"
            />
          </div>

          {/* Target Notion Database Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Database size={12} className="text-cyan-400" />
              Target Notion Database
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={selectedDbId}
                  onChange={(e) => {
                    if (e.target.value === "__create_new__") {
                      setShowCreateDb(true);
                      return;
                    }
                    setSelectedDbId(e.target.value);
                  }}
                  disabled={dbsLoading}
                  className="w-full pl-3 pr-8 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-xs appearance-none cursor-pointer disabled:opacity-50"
                >
                  {dbsLoading ? (
                    <option value="" disabled>Loading databases...</option>
                  ) : databases.length === 0 ? (
                    <option value="" disabled>No databases found. Create one to get started.</option>
                  ) : (
                    <>
                      <option value="" disabled className="bg-slate-950 text-slate-500">
                        Select a database...
                      </option>
                      {databases.map((db) => (
                        <option key={db.id} value={db.id} className="bg-slate-950 text-slate-100">
                          {db.title || `Untitled (${db.id.substring(0, 8)}...)`}
                        </option>
                      ))}
                    </>
                  )}
                  <option value="__create_new__" className="bg-slate-950 text-cyan-400">
                    + Create New Database
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                  <ChevronDown size={14} />
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleRefreshDbs}
                disabled={dbsLoading}
                className="p-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-400 hover:text-cyan-400 hover:border-cyan-500 transition-all disabled:opacity-50 h-[34px] w-[34px] flex items-center justify-center cursor-pointer"
                title="Refresh Databases"
              >
                <RefreshCw size={14} className={dbsLoading ? "animate-spin text-cyan-400" : ""} />
              </button>
            </div>

            {/* Empty state CTA when no databases exist */}
            {!dbsLoading && databases.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-2.5 rounded-lg bg-cyan-500/5 border border-cyan-500/15 flex items-center justify-between"
              >
                <span className="text-[10px] text-slate-400 font-medium">
                  No databases found. Create one to get started.
                </span>
                <button
                  type="button"
                  onClick={() => setShowCreateDb(true)}
                  className="px-2.5 py-1 bg-cyan-600/80 hover:bg-cyan-500 transition-all rounded-md font-bold text-[9px] uppercase tracking-wider text-white flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={10} />
                  Create
                </button>
              </motion.div>
            )}
          </div>

          {/* Collapsible Create New Notion Database */}
          <div className="border border-slate-800/60 rounded-xl overflow-hidden bg-slate-950/20">
            <button
              type="button"
              onClick={() => setShowCreateDb(!showCreateDb)}
              className="w-full px-3 py-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-900/50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Plus size={12} className="text-cyan-400" />
                Create New Notion Database
              </span>
              {showCreateDb ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            <AnimatePresence>
              {showCreateDb && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 pb-3 border-t border-slate-850/50 space-y-3 pt-3 overflow-hidden text-xs"
                >
                  {/* Parent Page Dropdown (optional — omit for workspace root) */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Parent Page <span className="text-slate-600 normal-case">(optional — defaults to workspace root)</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedPageId}
                        onChange={(e) => setSelectedPageId(e.target.value)}
                        disabled={pagesLoading}
                        className="w-full pl-2 pr-6 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 focus:outline-none focus:border-cyan-550 transition-all text-xs appearance-none cursor-pointer disabled:opacity-50"
                      >
                        <option value="" className="bg-slate-950 text-slate-400">
                          Workspace Root (default)
                        </option>
                        {pagesLoading ? (
                          <option value="" disabled>Loading parent pages...</option>
                        ) : (
                          pages.map((p) => (
                            <option key={p.id} value={p.id} className="bg-slate-950 text-slate-200">
                              {p.title || `Untitled (${p.id.substring(0, 8)}...)`}
                            </option>
                          ))
                        )}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                        <ChevronDown size={12} />
                      </div>
                    </div>
                  </div>

                  {/* New Database Title */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      New Database Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. My Custom Database"
                      value={newDbTitle}
                      onChange={(e) => setNewDbTitle(e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-550 transition-all text-xs"
                    />
                  </div>

                  {/* Create Database Button */}
                  <button
                    type="button"
                    onClick={handleCreateDatabase}
                    disabled={createDbLoading || !newDbTitle.trim()}
                    className="w-full py-1.5 bg-cyan-600/80 hover:bg-cyan-500 active:scale-[0.98] transition-all rounded-md font-bold text-[10px] uppercase tracking-wider text-white flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {createDbLoading ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Creating Database...
                      </>
                    ) : (
                      <>
                        <Plus size={12} />
                        Create Database
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Run In Background Checkbox */}
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="runInBackground"
              checked={runInBackground}
              onChange={(e) => setRunInBackground(e.target.checked)}
              className="w-4 h-4 bg-slate-950 border border-slate-800 rounded text-cyan-500 focus:ring-cyan-500 cursor-pointer accent-cyan-500"
            />
            <label
              htmlFor="runInBackground"
              className="text-xs font-semibold text-slate-300 cursor-pointer select-none"
            >
              Run summarization in background
            </label>
          </div>

          {/* Collapsible Advanced Settings */}
          <div className="border border-slate-800/60 rounded-xl overflow-hidden bg-slate-950/20">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full px-3 py-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:bg-slate-900/50 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Settings2 size={12} className="text-cyan-400" />
                Advanced Overrides (Optional)
              </span>
              {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 pb-3 border-t border-slate-850/50 space-y-3 pt-3 overflow-hidden text-xs"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Notion API Key
                      </label>
                      <input
                        type="password"
                        placeholder="System default key"
                        value={notionApiKey}
                        onChange={(e) => setNotionApiKey(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-550 transition-all text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Gemini API Key
                      </label>
                      <input
                        type="password"
                        placeholder="System default key"
                        value={geminiApiKey}
                        onChange={(e) => setGeminiApiKey(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-550 transition-all text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Gemini Model
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. gemini-2.5-flash"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-slate-200 placeholder-slate-650 focus:outline-none focus:border-cyan-550 transition-all text-xs"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trigger Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-[0.98] transition-all rounded-lg font-bold text-xs tracking-wide text-white shadow-lg shadow-cyan-500/15 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                Processing Summarization...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate YouTube Notes
              </>
            )}
          </button>
        </form>

        {/* Results Panel */}
        <div className="flex-1 flex flex-col justify-center border-t border-slate-800/80 pt-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="flex items-start gap-2 text-rose-500 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20"
              >
                <XCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 flex flex-col items-center justify-center"
              >
                <div className="relative w-12 h-12 mb-3">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
                </div>
                <span className="text-xs font-semibold text-slate-300">
                  {runInBackground ? "Queueing background task..." : "Transcribing & extracting notes..."}
                </span>
                <p className="text-[10px] text-slate-500 mt-1 max-w-[260px]">
                  {runInBackground
                    ? "Your request is being submitted to the background queue."
                    : "This might take a couple of minutes depending on the video duration. Please wait."}
                </p>
              </motion.div>
            )}

            {!response && !error && !loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-10 flex flex-col items-center justify-center text-slate-500"
              >
                <FileText size={24} className="text-slate-600 mb-2" />
                <span className="text-xs font-semibold text-slate-400">Summarizer Console Idle</span>
                <p className="text-[10px] text-slate-600 max-w-xs mt-1">
                  Enter a YouTube link and trigger notes generation. Notes will be generated and automatically added to your Notion Database.
                </p>
              </motion.div>
            )}

            {response && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4 text-xs"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">
                    Pipeline Execution Status
                  </h3>
                  
                  {response.status === "processing" ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      <Clock size={10} /> {response.status.toUpperCase()}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 size={10} /> {response.status.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <p className="text-slate-350 leading-relaxed font-medium">
                    {response.message}
                  </p>
                  
                  {response.pages && response.pages.length > 0 && (
                    <div className="pt-2 border-t border-slate-900 space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">
                        Generated Notion Pages
                      </span>
                      
                      <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                        {response.pages.map((pageId, idx) => (
                          <div
                            key={pageId}
                            className="flex items-center justify-between bg-slate-900/40 p-2 rounded-lg border border-slate-850/50 hover:border-cyan-500/30 transition-all"
                          >
                            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[160px]">
                              {pageId}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {/* Open link */}
                              <a
                                href={getNotionUrl(pageId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 hover:text-cyan-400 text-slate-500 rounded hover:bg-slate-800 transition-colors"
                                title="Open in Notion"
                              >
                                <ExternalLink size={12} />
                              </a>
                              
                              {/* Copy button */}
                              <button
                                type="button"
                                onClick={() => handleCopyLink(pageId, idx)}
                                className="p-1 hover:text-cyan-400 text-slate-500 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                                title="Copy Notion Link"
                              >
                                {copiedIndex === idx ? (
                                  <Check size={12} className="text-emerald-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
