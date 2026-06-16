"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  User,
  Lock,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
  RefreshCw,
  LogOut,
  ShieldAlert
} from "lucide-react";

import {
  LiveScannerResult,
  LiveScannerResponse,
  StockDetailsResponse,
  RiskState,
  BacktestResult,
  formatCurrency,
  getPnLColor
} from "../../components/dashboard/types";

import {
  MOCK_SCANNER_RESULTS,
  MOCK_RISK,
  MOCK_TRADES,
  generateMockStockDetails
} from "../../components/dashboard/mockData";

import {
  getStratosToken,
  saveStratosAuth,
  clearStratosAuth,
  stratosFetch
} from "../../components/dashboard/api";

import { StatusCards } from "../../components/dashboard/StatusCards";
import { RiskSafeguards } from "../../components/dashboard/RiskSafeguards";
import { FilterControls } from "../../components/dashboard/FilterControls";
import { WatchlistScanner } from "../../components/dashboard/WatchlistScanner";
import { AnalysisDrawer } from "../../components/dashboard/AnalysisDrawer";
import { BacktestSandbox } from "../../components/dashboard/BacktestSandbox";

export default function TradingDashboard() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Auth form states
  const [username, setUsername] = useState("yogesh");
  const [password, setPassword] = useState("stratos_pass"); // default test fallback
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Connection settings
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [marketOpen, setMarketOpen] = useState(true);

  // Live Data States
  const [liveData, setLiveData] = useState<LiveScannerResponse | null>(null);
  const [riskState, setRiskState] = useState<RiskState | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Filter States
  const [selectedUniverse, setSelectedUniverse] = useState<"NIFTY50" | "FO" | "CUSTOM">("NIFTY50");
  const [minScore, setMinScore] = useState<number>(0.0);
  const [directionFilter, setDirectionFilter] = useState<"All" | "BUY" | "SELL">("All");
  const [minConfidence, setMinConfidence] = useState<number>(0.0);

  // Single Stock Analysis States
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [stockDetails, setStockDetails] = useState<StockDetailsResponse | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Backtest states
  const [backtestUniverse, setBacktestUniverse] = useState("RELIANCE.NS");
  const [backtestPeriod, setBacktestPeriod] = useState("1mo");
  const [backtestInterval, setBacktestInterval] = useState("5m");
  const [backtestRiskPct, setBacktestRiskPct] = useState(0.01);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestJobId, setBacktestJobId] = useState<string | null>(null);
  const [backtestStatus, setBacktestStatus] = useState<string | null>(null);
  const [backtestResults, setBacktestResults] = useState<BacktestResult | null>(null);
  const [backtestError, setBacktestError] = useState<string | null>(null);
  const [backtestExpanded, setBacktestExpanded] = useState(true);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backtestPollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get token and configure interceptor listener on mount
  useEffect(() => {
    setMounted(true);

    const savedToken = getStratosToken();
    const savedDemoMode = localStorage.getItem("stratos_demo_mode") === "true";
    
    setIsDemoMode(savedDemoMode);
    if (savedToken) {
      setToken(savedToken);
    } else if (savedDemoMode) {
      setToken("demo_token");
    } else {
      clearStratosAuth();
    }

    // Interceptor broadcast listener
    const handleUnauthorized = () => {
      handleLogout();
    };

    window.addEventListener("stratos-unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("stratos-unauthorized", handleUnauthorized);
    };
  }, []);

  // Trigger fetch when filters shift
  useEffect(() => {
    if (mounted && (token || isDemoMode)) {
      fetchDashboardData();
    }
  }, [selectedUniverse, minScore, directionFilter, minConfidence]);

  // Set up auto-refresh when token or demo-mode shifts
  useEffect(() => {
    if (!mounted) return;

    if (token || isDemoMode) {
      fetchDashboardData();

      // Countdown loop
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setCountdown(10);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (liveData && liveData.market_state === "CLOSED") {
            return 10;
          }
          if (prev <= 1) {
            fetchDashboardData();
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [token, isDemoMode, mounted, liveData?.market_state]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (backtestPollTimerRef.current) clearInterval(backtestPollTimerRef.current);
    };
  }, []);

  const handleSelectStock = async (symbol: string) => {
    setSelectedStock(symbol);
    setDetailsLoading(true);
    setDetailsError(null);
    setStockDetails(null);

    if (isDemoMode) {
      setTimeout(() => {
        setStockDetails(generateMockStockDetails(symbol));
        setDetailsLoading(false);
      }, 400);
      return;
    }

    try {
      const response = await stratosFetch(`/signals/${symbol}`);
      if (!response.ok) {
        throw new Error(`Failed to load technical analysis for ${symbol}`);
      }
      const data: StockDetailsResponse = await response.json();
      setStockDetails(data);
    } catch (err: any) {
      console.error(err);
      setDetailsError(err.message || "Failed to sync detailed metrics.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setApiError(null);

    if (isDemoMode) {
      setTimeout(() => {
        const results: LiveScannerResult[] = [];
        Object.entries(MOCK_SCANNER_RESULTS).forEach(([symbol, info]) => {
          let matchUniverse = true;
          if (selectedUniverse === "FO") {
            matchUniverse = ["RELIANCE.NS", "HDFCBANK.NS", "SBIN.NS", "TCS.NS"].includes(symbol);
          } else if (selectedUniverse === "CUSTOM") {
            matchUniverse = ["INFY.NS", "ITC.NS", "WIPRO.NS"].includes(symbol);
          }

          const matchDirection = directionFilter === "All" || info.action === directionFilter;
          const matchScore = info.score >= minScore;
          const matchConfidence = info.confidence >= minConfidence;

          if (matchUniverse && matchDirection && matchScore && matchConfidence) {
            results.push({
              symbol,
              ...info
            });
          }
        });

        results.sort((a, b) => b.score - a.score);

        setLiveData({
          scan_time: new Date().toISOString(),
          market_state: marketOpen ? "OPEN" : "CLOSED",
          qualified_count: results.length,
          results
        });

        setRiskState(MOCK_RISK);
        setLastRefreshed(new Date());
        setIsRefreshing(false);
      }, 300);
      return;
    }

    const currentToken = getStratosToken();
    if (!currentToken) {
      setIsRefreshing(false);
      handleLogout();
      return;
    }

    try {
      const queryParams = new URLSearchParams();
      queryParams.append("universe", selectedUniverse);
      const sideMap = {
        All: "both",
        BUY: "buy",
        SELL: "sell"
      };
      queryParams.append("side", sideMap[directionFilter]);
      if (minScore > 0) {
        queryParams.append("min_score", minScore.toString());
      }
      if (minConfidence > 0) {
        queryParams.append("min_confidence", minConfidence.toString());
      }
      queryParams.append("max_results", "50");

      const [signalsRes, riskRes] = await Promise.all([
        stratosFetch(`/signals/live?${queryParams.toString()}`),
        stratosFetch("/signals/risk/state")
      ]);

      if (!signalsRes.ok || !riskRes.ok) {
        let errorDetail = "";
        if (!signalsRes.ok) {
          try {
            const body = await signalsRes.json();
            errorDetail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail || body);
          } catch {
            errorDetail = await signalsRes.text().catch(() => "Unknown error");
          }
          throw new Error(`Signals API Error (${signalsRes.status}): ${errorDetail}`);
        } else {
          try {
            const body = await riskRes.json();
            errorDetail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail || body);
          } catch {
            errorDetail = await riskRes.text().catch(() => "Unknown error");
          }
          throw new Error(`Risk API Error (${riskRes.status}): ${errorDetail}`);
        }
      }

      const signalsData: LiveScannerResponse = await signalsRes.json();
      const riskData: RiskState = await riskRes.json();

      setLiveData(signalsData);
      setRiskState(riskData);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to establish secure connection to FastAPI server.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await fetch("https://stratos.yogeshwaran.space/auth/login", {
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
      saveStratosAuth(data.access_token, data.expires_at);
      setToken(data.access_token);
      setIsDemoMode(false);
      localStorage.setItem("stratos_demo_mode", "false");
    } catch (err: any) {
      setAuthError(err.message || "Something went wrong during authentication.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearStratosAuth();
    setToken(null);
    setLiveData(null);
    setRiskState(null);
    setBacktestResults(null);
    setBacktestJobId(null);
    setBacktestStatus(null);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (backtestPollTimerRef.current) clearInterval(backtestPollTimerRef.current);
  };

  const enableDemoMode = () => {
    setIsDemoMode(true);
    localStorage.setItem("stratos_demo_mode", "true");
    setToken("demo_token");
    setAuthError(null);
  };

  const handleRunBacktest = async (e: React.FormEvent) => {
    e.preventDefault();
    setBacktestLoading(true);
    setBacktestError(null);
    setBacktestResults(null);
    setBacktestStatus("SUBMITTING");

    const universeArray = backtestUniverse
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    if (universeArray.length === 0) {
      setBacktestError("At least one ticker symbol is required.");
      setBacktestLoading(false);
      return;
    }

    if (isDemoMode) {
      // Simulate Backtesting Flow
      setTimeout(() => {
        setBacktestStatus("PENDING");
        setTimeout(() => {
          setBacktestStatus("RUNNING");
          setTimeout(() => {
            setBacktestStatus("SUCCESS");
            setBacktestResults({
              total_trades: 18,
              winning_trades: 12,
              win_rate: 0.67,
              net_pnl: 14650.00,
              trades_by_symbol: {
                [universeArray[0]]: MOCK_TRADES
              }
            });
            setBacktestLoading(false);
          }, 1500);
        }, 1500);
      }, 1000);
      return;
    }

    try {
      const response = await stratosFetch("/signals/backtest", {
        method: "POST",
        body: JSON.stringify({
          universe: universeArray,
          period: backtestPeriod,
          interval: backtestInterval,
          risk_pct: backtestRiskPct
        })
      });

      if (!response.ok) {
        throw new Error("Failed to submit backtest simulation. Check parameters.");
      }

      const data = await response.json();
      const jobId = data.job_id;
      setBacktestJobId(jobId);
      setBacktestStatus(data.status || "PENDING");

      // Start Polling
      if (backtestPollTimerRef.current) clearInterval(backtestPollTimerRef.current);
      pollBacktestStatus(jobId);
    } catch (err: any) {
      setBacktestError(err.message || "Failed to initialize simulation job.");
      setBacktestLoading(false);
      setBacktestStatus("FAILED");
    }
  };

  const pollBacktestStatus = (jobId: string) => {
    backtestPollTimerRef.current = setInterval(async () => {
      try {
        const response = await stratosFetch(`/signals/backtest/${jobId}`);

        if (!response.ok) {
          throw new Error("Unable to read simulation job state.");
        }

        const data = await response.json();
        setBacktestStatus(data.status);

        if (data.status === "SUCCESS") {
          setBacktestResults(data.result || {
            total_trades: 0,
            winning_trades: 0,
            win_rate: 0.0,
            net_pnl: 0,
            trades_by_symbol: {}
          });
          setBacktestLoading(false);
          if (backtestPollTimerRef.current) clearInterval(backtestPollTimerRef.current);
        } else if (data.status === "FAILED") {
          setBacktestError(data.error || "Simulation engine reported internal failure.");
          setBacktestLoading(false);
          if (backtestPollTimerRef.current) clearInterval(backtestPollTimerRef.current);
        }
      } catch (err: any) {
        setBacktestError(err.message || "Telemetry loss during simulation polling.");
        setBacktestLoading(false);
        if (backtestPollTimerRef.current) clearInterval(backtestPollTimerRef.current);
      }
    }, 2000);
  };

  if (!mounted) return null;

  return (
    <div className="bg-[#020617] text-slate-100 min-h-screen relative flex flex-col font-sans selection:bg-cyan-500/30 selection:text-white">
      {/* Premium background radial glowing spots */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-1/3 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[180px] pointer-events-none z-0" />

      {/* LOGIN PORTAL (Page 1) */}
      {!token && (
        <div className="flex-1 flex items-center justify-center p-4 relative z-10 min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-md bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-2xl relative overflow-hidden"
          >
            {/* Top design accent */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
            
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4">
                <Activity size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">STRATOS TERMINAL</h1>
              <p className="text-slate-400 text-xs mt-1 text-center">
                Secured Stock Signal & Portfolio Risk Dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter terminal operator ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Access Key
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-sm"
                  />
                </div>
              </div>

              {authError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-start gap-2 text-rose-500 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20"
                >
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-[0.98] transition-all rounded-xl font-semibold text-sm tracking-wide text-white shadow-lg shadow-indigo-500/15 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {authLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Initializing Secure Handshake...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Secure Login
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800/85"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Quick Sandbox Access
                </span>
                <div className="flex-grow border-t border-slate-800/85"></div>
              </div>

              <button
                type="button"
                onClick={enableDemoMode}
                className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800/60 hover:border-slate-700 active:scale-[0.98] transition-all rounded-xl font-semibold text-sm text-cyan-400 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap size={15} />
                Launch Sandbox (Demo Mode)
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* DASHBOARD CONTENT (Page 2) */}
      {token && (
        <div className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* HEADER SECTION */}
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-cyan-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Activity size={20} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    STRATOS TERMINAL
                  </h1>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isDemoMode
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : apiError
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isDemoMode ? "bg-amber-500 animate-pulse" : apiError ? "bg-rose-500" : "bg-emerald-500 animate-ping"}`} />
                    {isDemoMode ? "Demo Mode" : apiError ? "Server Interrupted" : "API Operational"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {lastRefreshed ? `Last sync: ${lastRefreshed.toLocaleTimeString()}` : "Pending initial data handshake"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Sync controls */}
              <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-xl p-1.5 text-xs text-slate-400">
                <button
                  onClick={fetchDashboardData}
                  disabled={isRefreshing}
                  className="p-1 hover:text-white rounded transition-colors hover:bg-slate-800/80 disabled:opacity-50 cursor-pointer animate-none"
                  title="Force Sync"
                >
                  <RefreshCw size={14} className={isRefreshing ? "animate-spin text-cyan-400" : ""} />
                </button>
                <div className="w-[1px] h-4 bg-slate-800" />
                <span className="px-1 text-slate-500">
                  {liveData?.market_state === "CLOSED" ? (
                    <span className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">Market Closed</span>
                  ) : (
                    <>Auto-sync in <strong className="text-slate-300 tabular-nums">{countdown}s</strong></>
                  )}
                </span>
              </div>

              {/* Logged in info & Logout */}
              <div className="flex items-center gap-2 bg-slate-900/40 border border-slate-800/80 rounded-xl pl-3 pr-1 py-1 text-xs font-semibold">
                <span className="text-slate-400">Operator:</span>
                <span className="text-cyan-400">{isDemoMode ? "sandbox_guest" : username}</span>
                <button
                  onClick={handleLogout}
                  className="ml-2 p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer"
                  title="Disconnect Terminal"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </header>

          {/* LIVE MARKET STATUS BANNER */}
          {liveData && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 flex items-center justify-between gap-4 p-4 rounded-xl border backdrop-blur-md shadow-lg ${
                liveData.market_state === "OPEN"
                  ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-200"
                  : "border-amber-500/20 bg-amber-500/5 text-amber-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    liveData.market_state === "OPEN" ? "bg-emerald-400" : "bg-amber-400"
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    liveData.market_state === "OPEN" ? "bg-emerald-500" : "bg-amber-500"
                  }`}></span>
                </span>
                <span className="text-xs font-semibold tracking-wide">
                  {liveData.market_state === "OPEN" 
                    ? "Market is currently OPEN. Active scans running on intraday signals." 
                    : liveData.market_state === "CUTOFF_PASSED"
                    ? "Market session completed (Cutoff Passed). Directives frozen."
                    : "Market is CLOSED. Displaying final scanned stock directive states."
                  }
                </span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest opacity-60">
                {liveData.market_state === "OPEN" ? "Trading Active" : "Trading Paused"}
              </div>
            </motion.div>
          )}

          {/* TELEMETRY ERROR ALERTS */}
          {apiError && !isDemoMode && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-center justify-between gap-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-200 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <ShieldAlert size={16} className="text-rose-400 shrink-0" />
                <div>
                  <span className="font-bold">Database Telemetry Error:</span> {apiError}
                </div>
              </div>
              <button
                onClick={enableDemoMode}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 font-bold rounded-lg transition-all shrink-0 cursor-pointer"
              >
                Launch Offline Demo
              </button>
            </motion.div>
          )}

          {/* KILL-SWITCH EMERGENCY ALERT */}
          {riskState?.kill_switch_active && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ repeat: Infinity, repeatType: "reverse", duration: 1.2 }}
              className="mb-6 bg-red-950/40 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 shadow-lg shadow-red-950/20"
            >
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center shrink-0">
                <ShieldAlert size={20} className="text-red-500 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-red-400 text-sm tracking-wider uppercase">
                  ALERT: Daily Loss Cap Exceeded. Kill-Switch Active.
                </h4>
                <p className="text-xs text-red-200/80 font-medium">
                  All automated signals and manual order executions are halted for the remainder of today&apos;s session. Risk safeguards engaged.
                </p>
              </div>
            </motion.div>
          )}

          {/* RISK METRICS PANEL */}
          <RiskSafeguards riskState={riskState} />

          {/* HEADER STATUS CARDS */}
          <StatusCards
            liveData={liveData}
            isDemoMode={isDemoMode}
            marketOpen={marketOpen}
            setMarketOpen={setMarketOpen}
            fetchDashboardData={fetchDashboardData}
          />

          {/* FILTER CONTROLS BAR */}
          <FilterControls
            selectedUniverse={selectedUniverse}
            setSelectedUniverse={setSelectedUniverse}
            minScore={minScore}
            setMinScore={setMinScore}
            directionFilter={directionFilter}
            setDirectionFilter={setDirectionFilter}
            minConfidence={minConfidence}
            setMinConfidence={setMinConfidence}
          />

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* LIVE WATCHLIST SCANNER GRID */}
            <WatchlistScanner
              liveData={liveData}
              handleSelectStock={handleSelectStock}
            />

            {/* BACKTESTING SIMULATION LAB */}
            <BacktestSandbox
              handleRunBacktest={handleRunBacktest}
              backtestUniverse={backtestUniverse}
              setBacktestUniverse={setBacktestUniverse}
              backtestInterval={backtestInterval}
              setBacktestInterval={setBacktestInterval}
              backtestPeriod={backtestPeriod}
              setBacktestPeriod={setBacktestPeriod}
              backtestRiskPct={backtestRiskPct}
              setBacktestRiskPct={setBacktestRiskPct}
              backtestLoading={backtestLoading}
              backtestStatus={backtestStatus}
              backtestError={backtestError}
              backtestResults={backtestResults}
              backtestExpanded={backtestExpanded}
              setBacktestExpanded={setBacktestExpanded}
            />

          </div>

          <footer className="text-center py-6 text-[10px] text-slate-500 font-medium border-t border-slate-900/60 mt-auto">
            Disclaimer: Rationale provided by Gemini AI and Quantitative agents is for educational purposes only. Trading stocks involves substantial risk of loss. SEBI Registered Research Analyst registration pending.
          </footer>

        </div>
      )}

      {/* Interactive Stock Analysis Modal / Side Drawer */}
      <AnimatePresence>
        {selectedStock && (
          <AnalysisDrawer
            selectedStock={selectedStock}
            stockDetails={stockDetails}
            detailsLoading={detailsLoading}
            detailsError={detailsError}
            onClose={() => setSelectedStock(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
