"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Play,
  Lock,
  User,
  ShieldAlert,
  DollarSign,
  Percent,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  RefreshCw,
  LogOut,
  Activity,
  Database,
  ChevronDown,
  ChevronUp,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Zap,
  Scale
} from "lucide-react";

// Types matching FastAPI schemas
interface SignalReason {
  type: string;
  detail: string;
}

interface Signal {
  symbol: string;
  action: "BUY" | "SELL" | "HOLD";
  entry: number;
  stop_loss: number;
  target: number | null;
  position_size: number;
  risk_per_trade: number;
  confidence: number;
  strategy: string;
  timeframe: string;
  reasons: SignalReason[];
}

interface LiveSignalsResponse {
  as_of: string;
  universe: string[];
  signals: Signal[];
  disclaimer: string;
  is_market_open?: boolean;
  market_message?: string;
}

interface RiskState {
  date: string;
  realized_pnl_today: number;
  realized_pnl_week: number;
  realized_pnl_month: number;
  open_risk: number;
  kill_switch_active: boolean;
  max_concurrent_positions_limit: number;
  account_equity: number;
}

interface SimulatedTrade {
  symbol: string;
  entry_time: string;
  entry_price: number;
  stop_loss: number;
  target: number;
  exit_time: string;
  exit_price: number;
  pnl: number;
  outcome: "WIN" | "LOSS";
}

interface BacktestResult {
  total_trades: number;
  winning_trades: number;
  win_rate: number;
  net_pnl: number;
  trades_by_symbol: Record<string, SimulatedTrade[]>;
}

// Mock Data for Demo Mode
const MOCK_SIGNALS: Signal[] = [
  {
    symbol: "RELIANCE.NS",
    action: "BUY",
    entry: 2450.50,
    stop_loss: 2420.00,
    target: 2515.00,
    position_size: 40,
    risk_per_trade: 1220.00,
    confidence: 0.88,
    strategy: "AI Trend Follower",
    timeframe: "15m",
    reasons: [
      { type: "Technical", detail: "RSI is in bullish zone (62) and price is above 50-EMA." },
      { type: "Quant", detail: "Volume breakout detected. 3-day momentum is highly positive." },
      { type: "AI", detail: "Gemini explainer indicates positive sentiment shift in recent filings and sector momentum is backing the move." }
    ]
  },
  {
    symbol: "TCS.NS",
    action: "SELL",
    entry: 3820.00,
    stop_loss: 3875.00,
    target: 3710.00,
    position_size: 25,
    risk_per_trade: 1375.00,
    confidence: 0.74,
    strategy: "Mean Reversion",
    timeframe: "1h",
    reasons: [
      { type: "Technical", detail: "Double top pattern at 3880 resistance. Bearish MACD crossover." },
      { type: "Quant", detail: "Statistical volatility z-score is +2.4 indicating overbought state." },
      { type: "AI", detail: "Expected sector consolidation ahead of quarterly earnings report." }
    ]
  },
  {
    symbol: "INFY.NS",
    action: "HOLD",
    entry: 1480.00,
    stop_loss: 1450.00,
    target: 1540.00,
    position_size: 0,
    risk_per_trade: 0,
    confidence: 0.52,
    strategy: "Range Bound",
    timeframe: "5m",
    reasons: [
      { type: "Technical", detail: "Trading in a tight sideways corridor between 1475 and 1490." },
      { type: "Quant", detail: "Low volume and historical high correlations with index limit directional bias." },
      { type: "AI", detail: "Macro uncertainties make entering a fresh position unfavorable at the current price." }
    ]
  }
];

const MOCK_RISK: RiskState = {
  date: new Date().toISOString().split("T")[0],
  realized_pnl_today: 4250.00,
  realized_pnl_week: 12890.00,
  realized_pnl_month: 38400.00,
  open_risk: 2595.00,
  kill_switch_active: false,
  max_concurrent_positions_limit: 5,
  account_equity: 100000.00
};

const MOCK_TRADES: SimulatedTrade[] = [
  {
    symbol: "RELIANCE.NS",
    entry_time: "2026-06-12 10:15",
    entry_price: 2435.00,
    stop_loss: 2410.00,
    target: 2485.00,
    exit_time: "2026-06-12 14:30",
    exit_price: 2485.00,
    pnl: 2000.00,
    outcome: "WIN"
  },
  {
    symbol: "RELIANCE.NS",
    entry_time: "2026-06-13 09:30",
    entry_price: 2460.00,
    stop_loss: 2445.00,
    target: 2490.00,
    exit_time: "2026-06-13 11:15",
    exit_price: 2445.00,
    pnl: -600.00,
    outcome: "LOSS"
  },
  {
    symbol: "TCS.NS",
    entry_time: "2026-06-14 13:00",
    entry_price: 3850.00,
    stop_loss: 3880.00,
    target: 3790.00,
    exit_time: "2026-06-14 15:10",
    exit_price: 3790.00,
    pnl: 2400.00,
    outcome: "WIN"
  }
];

const MOCK_DISCLAIMER = "Disclaimer: Rationale provided by Gemini AI and Quantitative agents is for educational purposes only. Trading stocks involves substantial risk of loss. SEBI Registered Research Analyst registration pending.";

export default function TradingDashboard() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [adminAuthorized, setAdminAuthorized] = useState(false);
  const [checkingAdminAuth, setCheckingAdminAuth] = useState(true);
  const router = useRouter();

  // Utility to get cookie
  const getCookie = (name: string) => {
    if (typeof window === "undefined") return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return undefined;
  };

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
  const [liveData, setLiveData] = useState<LiveSignalsResponse | null>(null);
  const [riskState, setRiskState] = useState<RiskState | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // Collapsed Signal indices
  const [expandedSignals, setExpandedSignals] = useState<Record<string, boolean>>({});

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
  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backtestPollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get token and verify admin authorization on mount
  useEffect(() => {
    setMounted(true);

    const verifyAdmin = async () => {
      const adminToken = getCookie("admin_token") || localStorage.getItem("admin_token");

      if (!adminToken) {
        router.push("/admin");
        return;
      }

      try {
        const res = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        });

        if (res.ok) {
          setAdminAuthorized(true);
        } else {
          localStorage.removeItem("admin_token");
          document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          router.push("/admin");
        }
      } catch (error) {
        console.error("Admin verification failed", error);
        router.push("/admin");
      } finally {
        setCheckingAdminAuth(false);
      }
    };

    verifyAdmin();

    const savedToken = localStorage.getItem("stratos_jwt_token");
    const savedDemoMode = localStorage.getItem("stratos_demo_mode") === "true";
    
    setIsDemoMode(savedDemoMode);
    if (savedToken) {
      setToken(savedToken);
    }
  }, [router]);

  // Set up auto-refresh when token or demo-mode shifts
  useEffect(() => {
    if (!mounted || !adminAuthorized) return;

    if (token || isDemoMode) {
      fetchDashboardData();

      // Countdown loop
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setCountdown(10);
      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (liveData && liveData.is_market_open === false) {
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
  }, [token, isDemoMode, mounted, adminAuthorized, liveData?.is_market_open]);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (backtestPollTimerRef.current) clearInterval(backtestPollTimerRef.current);
    };
  }, []);

  const fetchDashboardData = async () => {
    if (!adminAuthorized) return;
    if (isRefreshing) return;
    setIsRefreshing(true);
    setApiError(null);

    if (isDemoMode) {
      // Load mock data
      setLiveData({
        as_of: new Date().toISOString(),
        universe: ["RELIANCE.NS", "TCS.NS", "INFY.NS"],
        signals: MOCK_SIGNALS,
        disclaimer: MOCK_DISCLAIMER,
        is_market_open: marketOpen,
        market_message: marketOpen ? undefined : "No new entries allowed after 14:45 IST. Market is currently closed."
      });
      setRiskState(MOCK_RISK);
      setLastRefreshed(new Date());
      setIsRefreshing(false);
      return;
    }

    if (!token) {
      setIsRefreshing(false);
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // Fetch signals and risk in parallel
      const [signalsRes, riskRes] = await Promise.all([
        fetch("https://stratos.yogeshwaran.space/signals/live", { headers }),
        fetch("https://stratos.yogeshwaran.space/signals/risk/state", { headers })
      ]);

      if (signalsRes.status === 401 || riskRes.status === 401) {
        handleLogout();
        throw new Error("Session expired. Please log in again.");
      }

      if (!signalsRes.ok || !riskRes.ok) {
        throw new Error("Failed to fetch latest dashboard telemetry.");
      }

      const signalsData: LiveSignalsResponse = await signalsRes.json();
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
      localStorage.setItem("stratos_jwt_token", data.access_token);
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
    localStorage.removeItem("stratos_jwt_token");
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

  const toggleSignalExpand = (symbol: string) => {
    setExpandedSignals(prev => ({
      ...prev,
      [symbol]: !prev[symbol]
    }));
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
      const response = await fetch("https://stratos.yogeshwaran.space/signals/backtest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
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
        const response = await fetch(`https://stratos.yogeshwaran.space/signals/backtest/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

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

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(val);
  };

  if (!mounted) return null;

  if (checkingAdminAuth || !adminAuthorized) {
    return (
      <div className="bg-[#020617] text-slate-100 min-h-screen flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="text-cyan-500 animate-spin" />
          <p className="text-xs text-slate-400 animate-pulse">Verifying operator credentials...</p>
        </div>
      </div>
    );
  }

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
                <div className="flex-grow border-t border-slate-800/80"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Quick Sandbox Access
                </span>
                <div className="flex-grow border-t border-slate-800/80"></div>
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
                  className="p-1 hover:text-white rounded transition-colors hover:bg-slate-800/80 disabled:opacity-50 cursor-pointer"
                  title="Force Sync"
                >
                  <RefreshCw size={14} className={isRefreshing ? "animate-spin text-cyan-400" : ""} />
                </button>
                <div className="w-[1px] h-4 bg-slate-800" />
                <span className="px-1 text-slate-500">
                  {liveData?.is_market_open === false ? (
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

          {/* SECTION 1: RISK METRIC GRID (Top Banner) */}
          <section className="mb-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Scale size={14} className="text-slate-400" />
              Live Risk Safeguard Center
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Account Capital */}
              <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-[0.03] text-white pointer-events-none group-hover:scale-110 transition-transform">
                  <DollarSign size={80} />
                </div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  Equity Base Capital
                </div>
                <div className="text-2xl font-black text-white tabular-nums tracking-tight">
                  {riskState ? formatCurrency(riskState.account_equity) : "₹0.00"}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-1">
                  Starting Balance Limit
                </div>
              </div>

              {/* Today realized PnL */}
              <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  Realized PnL (Today)
                </div>
                <div className={`text-2xl font-black tabular-nums tracking-tight transition-colors ${
                  (riskState?.realized_pnl_today ?? 0) >= 0 ? "text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.15)]" : "text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                }`}>
                  {riskState ? `${(riskState.realized_pnl_today ?? 0) >= 0 ? "+" : ""}${formatCurrency(riskState.realized_pnl_today)}` : "₹0.00"}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-medium">
                  {(riskState?.realized_pnl_today ?? 0) >= 0 ? (
                    <TrendingUp size={11} className="text-emerald-400" />
                  ) : (
                    <TrendingDown size={11} className="text-rose-400" />
                  )}
                  Real-time session outcomes
                </div>
              </div>

              {/* Weekly/Monthly aggregated PnL */}
              <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  PnL Aggregate Trend
                </div>
                <div className="flex flex-col gap-1.5 justify-center">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Past 7d:</span>
                    <span className={`font-bold tabular-nums ${
                      (riskState?.realized_pnl_week ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {riskState ? `${(riskState.realized_pnl_week ?? 0) >= 0 ? "+" : ""}${formatCurrency(riskState.realized_pnl_week)}` : "₹0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Past 30d:</span>
                    <span className={`font-bold tabular-nums ${
                      (riskState?.realized_pnl_month ?? 0) >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {riskState ? `${(riskState.realized_pnl_month ?? 0) >= 0 ? "+" : ""}${formatCurrency(riskState.realized_pnl_month)}` : "₹0.00"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Combined Open Risk */}
              <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700/60 transition-all duration-300">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                  Combined Open Risk
                </div>
                <div className="text-2xl font-black text-cyan-400 tabular-nums tracking-tight drop-shadow-[0_0_12px_rgba(34,211,238,0.15)]">
                  {riskState ? formatCurrency(riskState.open_risk) : "₹0.00"}
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-1">
                  At-risk active capital: <strong className="text-slate-400">{riskState ? ((riskState.open_risk / riskState.account_equity) * 100).toFixed(2) : 0}%</strong>
                </div>
              </div>

            </div>
          </section>

          {/* MAIN CONTENT SPLIT (LIVE SIGNALS & BACKTESTING SANDBOX) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* SECTION 2: LIVE SIGNALS PANEL (Left + Center Columns) */}
            <section className="lg:col-span-2 flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Activity size={14} className="text-cyan-500" />
                  Live Trading Directive Feed
                </h2>
                <div className="flex items-center gap-2">
                  {isDemoMode && (
                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !marketOpen;
                        setMarketOpen(nextState);
                        setLiveData(prev => prev ? {
                          ...prev,
                          is_market_open: nextState,
                          market_message: nextState ? undefined : "No new entries allowed after 14:45 IST."
                        } : null);
                      }}
                      className="text-[9px] font-bold uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-cyan-400 px-2 py-0.5 border border-slate-700 rounded transition-all cursor-pointer"
                    >
                      Demo Toggle Market ({marketOpen ? "Open" : "Closed"})
                    </button>
                  )}
                  <span className="text-[10px] text-slate-500 font-medium bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
                    {liveData?.is_market_open === false ? "0" : (liveData?.signals?.length || 0)} active assets monitored
                  </span>
                </div>
              </div>

              <div className="flex-1 bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col shadow-xl justify-center">
                {liveData && liveData.is_market_open === false ? (
                  <div className="flex-grow flex flex-col items-center justify-center text-center py-16 px-4">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/20 shadow-lg shadow-amber-500/5 animate-pulse">
                      <span className="text-2xl">🌙</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <h3 className="font-bold text-white text-base tracking-tight">Market is Closed</h3>
                    </div>
                    <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
                      {liveData.market_message || "No new entries allowed after 14:45 IST."}
                    </p>
                    <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                      Backtest Sandbox remains fully active
                    </span>
                  </div>
                ) : !liveData || liveData.signals.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                    <Loader2 size={36} className="text-cyan-500 animate-spin mb-4" />
                    <h3 className="font-bold text-slate-400 text-sm">Awaiting directive pipeline response</h3>
                    <p className="text-xs text-slate-600 max-w-xs mt-1">
                      No signals recorded yet in this session. Ensure FastAPI system data feeds are streaming correctly.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {liveData.signals.map((signal) => {
                      const isExpanded = expandedSignals[signal.symbol];
                      const statusColor =
                        signal.action === "BUY"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                          : signal.action === "SELL"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                          : "bg-slate-800/50 text-slate-400 border-slate-700/50";

                      return (
                        <div
                          key={signal.symbol}
                          className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-slate-700/60"
                        >
                          {/* Row Summary Header */}
                          <div
                            onClick={() => toggleSignalExpand(signal.symbol)}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/20 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {/* Action Icon */}
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                signal.action === "BUY"
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : signal.action === "SELL"
                                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                  : "bg-slate-800 border-slate-700 text-slate-500"
                              }`}>
                                {signal.action === "BUY" ? (
                                  <TrendingUp size={20} className="animate-bounce" />
                                ) : signal.action === "SELL" ? (
                                  <TrendingDown size={20} className="animate-bounce" />
                                ) : (
                                  <Clock size={20} />
                                )}
                              </div>
                              
                              <div>
                                <h3 className="font-bold text-white tracking-tight">{signal.symbol}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-black border ${statusColor}`}>
                                    {signal.action}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {signal.strategy} • {signal.timeframe} TF
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Core Prices */}
                            <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center text-xs">
                              <div>
                                <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Entry</span>
                                <strong className="font-bold text-slate-200 tabular-nums">{formatCurrency(signal.entry)}</strong>
                              </div>
                              <div>
                                <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Stop Loss</span>
                                <strong className="font-bold text-rose-400 tabular-nums">{formatCurrency(signal.stop_loss)}</strong>
                              </div>
                              <div>
                                <span className="block text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Target</span>
                                <strong className="font-bold text-emerald-400 tabular-nums">
                                  {signal.target ? formatCurrency(signal.target) : "N/A"}
                                </strong>
                              </div>
                            </div>

                            {/* Confidence Metric Gauge & Expand arrow */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 border-slate-800/60 pt-3 sm:pt-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider hidden sm:inline">
                                  Confidence
                                </span>
                                {/* Radial progress bar */}
                                <div className="relative w-12 h-12 flex items-center justify-center">
                                  <svg className="w-12 h-12 transform -rotate-90">
                                    <circle
                                      cx="24"
                                      cy="24"
                                      r="18"
                                      className="stroke-slate-800"
                                      strokeWidth="3.5"
                                      fill="transparent"
                                    />
                                    <circle
                                      cx="24"
                                      cy="24"
                                      r="18"
                                      className={`transition-all duration-700 ease-out ${
                                        signal.confidence >= 0.75
                                          ? "stroke-emerald-400"
                                          : signal.confidence >= 0.6
                                          ? "stroke-cyan-400"
                                          : "stroke-slate-500"
                                      }`}
                                      strokeWidth="3.5"
                                      fill="transparent"
                                      strokeDasharray={2 * Math.PI * 18}
                                      strokeDashoffset={2 * Math.PI * 18 * (1 - signal.confidence)}
                                      strokeLinecap="round"
                                    />
                                  </svg>
                                  <span className="absolute text-[10px] font-black text-slate-200 tabular-nums">
                                    {Math.round(signal.confidence * 100)}%
                                  </span>
                                </div>
                              </div>
                              
                              <button className="text-slate-500 hover:text-slate-300 p-1 rounded transition-all">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* Collapsible AGENT INSIGHTS */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="border-t border-slate-800/80 overflow-hidden bg-slate-950/40"
                              >
                                <div className="p-4 space-y-3">
                                  
                                  {/* Trade size metrics */}
                                  <div className="grid grid-cols-3 gap-2 bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/60 text-xs">
                                    <div>
                                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Recommended Size</span>
                                      <strong className="text-slate-300 font-semibold">{signal.position_size || "N/A"} shares</strong>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Expected Stop Distance</span>
                                      <strong className="text-rose-400 font-semibold">
                                        {((1 - (signal.stop_loss / signal.entry)) * 100).toFixed(2)}%
                                      </strong>
                                    </div>
                                    <div>
                                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Est. Risk Capital</span>
                                      <strong className="text-slate-300 font-semibold">{formatCurrency(signal.risk_per_trade)}</strong>
                                    </div>
                                  </div>

                                  {/* Deep agent explanations */}
                                  <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5 mt-2">
                                    <Sparkles size={11} />
                                    Stratos Multi-Agent Consensus Insights
                                  </h4>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {signal.reasons.map((reason, idx) => {
                                      const accent =
                                        reason.type === "Technical"
                                          ? "text-cyan-400 bg-cyan-950/20 border-cyan-800/30"
                                          : reason.type === "Quant"
                                          ? "text-purple-400 bg-purple-950/20 border-purple-800/30"
                                          : "text-emerald-400 bg-emerald-950/20 border-emerald-800/30";

                                      return (
                                        <div
                                          key={idx}
                                          className={`p-3 rounded-lg border text-xs leading-relaxed ${accent}`}
                                        >
                                          <strong className="block font-bold text-[10px] tracking-wider uppercase mb-1">
                                            {reason.type} Agent
                                          </strong>
                                          <p className="text-slate-300 text-[11px]">{reason.detail}</p>
                                        </div>
                                      );
                                    })}
                                  </div>

                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* SECTION 3: BACKTESTING SANDBOX SECTION (Right Column) */}
            <section className="flex flex-col h-full">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Database size={14} className="text-purple-500" />
                Backtesting Simulation Lab
              </h2>

              <div className="flex-1 bg-slate-900/20 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 flex flex-col shadow-xl">
                
                {/* Submit Form */}
                <form onSubmit={handleRunBacktest} className="space-y-4 mb-5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      Target Ticker Symbols
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RELIANCE.NS, TCS.NS"
                      value={backtestUniverse}
                      onChange={(e) => setBacktestUniverse(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Interval
                      </label>
                      <select
                        value={backtestInterval}
                        onChange={(e) => setBacktestInterval(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition-all text-xs cursor-pointer"
                      >
                        <option value="5m">5m Candle</option>
                        <option value="15m">15m Candle</option>
                        <option value="1h">1h Candle</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Simulation Period
                      </label>
                      <select
                        value={backtestPeriod}
                        onChange={(e) => setBacktestPeriod(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-purple-500 transition-all text-xs cursor-pointer"
                      >
                        <option value="5d">5 Days</option>
                        <option value="1mo">1 Month</option>
                        <option value="1y">1 Year</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                      <span>Per-Trade Risk Ratio</span>
                      <span className="text-purple-400">{(backtestRiskPct * 100).toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.005"
                      max="0.05"
                      step="0.005"
                      value={backtestRiskPct}
                      onChange={(e) => setBacktestRiskPct(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={backtestLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] transition-all rounded-lg font-bold text-xs tracking-wide text-white shadow-lg shadow-purple-500/15 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    {backtestLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-white" />
                        Simulation Active... ({backtestStatus})
                      </>
                    ) : (
                      <>
                        <Play size={14} />
                        Run Backtest Simulation
                      </>
                    )}
                  </button>
                </form>

                {/* Simulation Output Area */}
                <div className="flex-1 flex flex-col justify-center border-t border-slate-800/80 pt-4">
                  {backtestError && (
                    <div className="flex items-start gap-2 text-rose-500 text-xs bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                      <XCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{backtestError}</span>
                    </div>
                  )}

                  {backtestLoading && !backtestResults && (
                    <div className="text-center py-10 flex flex-col items-center">
                      <div className="relative w-12 h-12 mb-3">
                        <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
                        <div className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                      </div>
                      <span className="text-xs font-semibold text-slate-300">
                        {backtestStatus === "SUBMITTING"
                          ? "Generating Job Request..."
                          : backtestStatus === "PENDING"
                          ? "Queued in Backtest Broker..."
                          : "Simulating trades against historical feeds..."}
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Do not refresh this window. Live updates stream automatically.
                      </p>
                    </div>
                  )}

                  {!backtestResults && !backtestError && !backtestLoading && (
                    <div className="text-center py-10 flex flex-col items-center justify-center text-slate-500">
                      <Database size={24} className="text-slate-600 mb-2" />
                      <span className="text-xs font-semibold text-slate-400">Simulation Console Idle</span>
                      <p className="text-[10px] text-slate-600 max-w-xs mt-1">
                        Select ticker universe and click Run to calculate statistics, drawdown, and win ratios.
                      </p>
                    </div>
                  )}

                  {/* Backtest Results Dashboard */}
                  {backtestResults && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-white uppercase tracking-wider">
                          Simulation Results
                        </h3>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={10} /> Completed
                        </span>
                      </div>

                      {/* Score metrics & Dial */}
                      <div className="grid grid-cols-2 gap-3 items-center">
                        <div className="flex items-center justify-center p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                          <div className="relative w-20 h-20 flex items-center justify-center">
                            <svg className="w-20 h-20 transform -rotate-90">
                              <circle
                                cx="40"
                                cy="40"
                                r="32"
                                className="stroke-slate-850"
                                strokeWidth="5"
                                fill="transparent"
                              />
                              <circle
                                cx="40"
                                cy="40"
                                r="32"
                                className="stroke-purple-500 transition-all duration-1000 ease-out"
                                strokeWidth="5"
                                fill="transparent"
                                strokeDasharray={2 * Math.PI * 32}
                                strokeDashoffset={2 * Math.PI * 32 * (1 - backtestResults.win_rate)}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                              <span className="text-sm font-black text-white leading-none">
                                {Math.round(backtestResults.win_rate * 100)}%
                              </span>
                              <span className="text-[8px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">
                                Win Rate
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex justify-between">
                            <span className="text-slate-500 font-medium">Net PnL:</span>
                            <strong className={`font-bold tabular-nums ${
                              backtestResults.net_pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                            }`}>
                              {backtestResults.net_pnl >= 0 ? "+" : ""}{formatCurrency(backtestResults.net_pnl)}
                            </strong>
                          </div>
                          
                          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex justify-between">
                            <span className="text-slate-500 font-medium">Trades Executed:</span>
                            <strong className="text-slate-200 tabular-nums">{backtestResults.total_trades}</strong>
                          </div>

                          <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-800/60 flex justify-between">
                            <span className="text-slate-500 font-medium">Win/Loss:</span>
                            <strong className="text-slate-200 tabular-nums">
                              {backtestResults.winning_trades} / {backtestResults.total_trades - backtestResults.winning_trades}
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Collapsible logs table */}
                      <div className="border border-slate-800 rounded-xl overflow-hidden">
                        <div
                          onClick={() => setBacktestExpanded(!backtestExpanded)}
                          className="bg-slate-950/80 p-3 flex justify-between items-center cursor-pointer hover:bg-slate-900 transition-colors"
                        >
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock size={12} className="text-purple-400" />
                            Simulated Order Ledger
                          </span>
                          <button className="text-slate-500">
                            {backtestExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>

                        <AnimatePresence>
                          {backtestExpanded && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: "auto" }}
                              exit={{ height: 0 }}
                              className="overflow-x-auto max-h-48 border-t border-slate-850"
                            >
                              <table className="w-full text-[10px] text-left border-collapse">
                                <thead>
                                  <tr className="bg-slate-950 text-slate-500 uppercase tracking-wider border-b border-slate-850">
                                    <th className="p-2 font-semibold">Asset</th>
                                    <th className="p-2 font-semibold">Entry / Exit</th>
                                    <th className="p-2 font-semibold">SL / Target</th>
                                    <th className="p-2 font-semibold text-right">PnL</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {Object.keys(backtestResults.trades_by_symbol).map((symbol) => {
                                    const trades = backtestResults.trades_by_symbol[symbol] || [];
                                    if (trades.length === 0) return null;
                                    
                                    return trades.map((trade, idx) => {
                                      const isWin = trade.outcome === "WIN";
                                      return (
                                        <tr
                                          key={`${symbol}-${idx}`}
                                          className="border-b border-slate-900/60 hover:bg-slate-900/30 transition-colors text-slate-300"
                                        >
                                          <td className="p-2 font-bold whitespace-nowrap text-white">
                                            {symbol}
                                          </td>
                                          <td className="p-2 leading-relaxed">
                                            <span className="block tabular-nums">In: {formatCurrency(trade.entry_price)}</span>
                                            <span className="block text-[8px] text-slate-500">{trade.entry_time}</span>
                                            <span className="block tabular-nums">Out: {formatCurrency(trade.exit_price)}</span>
                                            <span className="block text-[8px] text-slate-500">{trade.exit_time}</span>
                                          </td>
                                          <td className="p-2 leading-relaxed">
                                            <span className="block text-[9px] text-rose-500/80 tabular-nums">SL: {formatCurrency(trade.stop_loss)}</span>
                                            <span className="block text-[9px] text-emerald-500/80 tabular-nums">TGT: {formatCurrency(trade.target)}</span>
                                          </td>
                                          <td className={`p-2 text-right font-semibold tabular-nums whitespace-nowrap ${
                                            isWin ? "text-emerald-400" : "text-rose-400"
                                          }`}>
                                            <span className="block">{isWin ? "+" : ""}{formatCurrency(trade.pnl)}</span>
                                            <span className={`inline-block text-[8px] px-1 py-0.2 rounded font-black mt-0.5 ${
                                              isWin ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                            }`}>
                                              {trade.outcome}
                                            </span>
                                          </td>
                                        </tr>
                                      );
                                    });
                                  })}
                                </tbody>
                              </table>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                    </motion.div>
                  )}
                </div>

              </div>
            </section>

          </div>

          {/* SECTION 4: COMPLIANCE FOOTER */}
          <footer className="mt-auto border-t border-slate-900 pt-6 pb-2 text-center relative z-10">
            <p className="text-[10px] text-slate-600 max-w-4xl mx-auto leading-relaxed">
              {liveData?.disclaimer || MOCK_DISCLAIMER}
            </p>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] text-slate-700 font-bold uppercase tracking-wider">
              <span>Stratos Trading Terminal v0.1.0</span>
              <span>•</span>
              <span>System Secured SSL 256-bit</span>
            </div>
          </footer>

        </div>
      )}
    </div>
  );
}
