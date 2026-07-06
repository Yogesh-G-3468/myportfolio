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
  ShieldAlert,
  Rocket,
  Server,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronDown,
  Youtube
} from "lucide-react";

import {
  LiveScannerResult,
  LiveScannerResponse,
  StockDetailsResponse,
  RiskState,
  BacktestResult,
  formatCurrency,
  getPnLColor,
  SystemStatus,
  TriggerScanResponse,
  NewsSentimentItem,
  NewsSentimentResponse
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
  stratosFetch,
  BASE_URL
} from "../../components/dashboard/api";

import { StatusCards } from "../../components/dashboard/StatusCards";
import { RiskSafeguards } from "../../components/dashboard/RiskSafeguards";
import { FilterControls } from "../../components/dashboard/FilterControls";
import { WatchlistScanner } from "../../components/dashboard/WatchlistScanner";
import { AnalysisDrawer } from "../../components/dashboard/AnalysisDrawer";
import { BacktestSandbox } from "../../components/dashboard/BacktestSandbox";
import { NewsSentimentFeed } from "../../components/dashboard/NewsSentimentFeed";
import { YoutubeSummarizer } from "../../components/dashboard/YoutubeSummarizer";

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

  // Diagnostics & Force Scan States
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResultModalData, setScanResultModalData] = useState<TriggerScanResponse | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // News Sentiment States
  const [newsSentiment, setNewsSentiment] = useState<NewsSentimentResponse | null>(null);
  const [selectedStockNews, setSelectedStockNews] = useState<NewsSentimentItem | null>(null);

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
  const [activeRightTab, setActiveRightTab] = useState<"backtest" | "youtube">("backtest");

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

  // Toast auto-dismiss effect
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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
    setSelectedStockNews(null);

    if (isDemoMode) {
      setTimeout(() => {
        setStockDetails(generateMockStockDetails(symbol));
        setSelectedStockNews({
          headlines: [
            `${symbol} announces solid expansion plans and Q1 growth forecasts.`,
            `Retail demand signals solid sector volumes suggesting moderate upside for ${symbol}.`
          ],
          direction: ["RELIANCE.NS", "BHARTIARTL.NS", "ICICIBANK.NS"].includes(symbol) 
            ? "bullish" 
            : ["TCS.NS", "SBIN.NS"].includes(symbol) 
            ? "bearish" 
            : "neutral",
          horizon: "intraday",
          impact: ["RELIANCE.NS", "TCS.NS"].includes(symbol) ? "high" : "medium",
          summary: `Sector volumes suggest solid trend continuation for ${symbol} with positive sentiment signals.`,
          last_updated: new Date().toISOString()
        });
        setDetailsLoading(false);
      }, 400);
      return;
    }

    try {
      const [detailsResResult, newsResResult] = await Promise.all([
        stratosFetch(`/signals/${symbol}`).catch(err => {
          console.error(`Failed to fetch details for ${symbol}:`, err);
          return null;
        }),
        stratosFetch(`/signals/news/${symbol}`).catch(err => {
          console.error(`Failed to fetch news for ${symbol}:`, err);
          return null;
        })
      ]);

      if (detailsResResult && detailsResResult.ok) {
        const data: StockDetailsResponse = await detailsResResult.json();
        setStockDetails(data);
      } else {
        setDetailsError(`Technical scan indicators are currently unavailable for ${symbol}.`);
      }

      if (newsResResult && newsResResult.ok) {
        try {
          const newsData: NewsSentimentItem = await newsResResult.json();
          setSelectedStockNews(newsData);
        } catch (e) {
          console.error("Error parsing news JSON:", e);
        }
      }
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
        
        const mockStatus: SystemStatus = {
          app_env: "development",
          current_time_ist: new Date().toISOString(),
          is_market_day: true,
          is_scan_window: true,
          bypass_market_hours: true,
          active_universe: "NIFTY50",
          symbols: ["RELIANCE.NS", "HDFCBANK.NS", "INFY.NS", "TCS.NS", "ICICIBANK.NS"],
          scheduler_running: true,
          cache_keys: ["RELIANCE.NS", "HDFCBANK.NS"],
          cache_summary: {
            "RELIANCE.NS": {
              action: "BUY",
              score: 0.82,
              reasons: ["EMA alignment bullish", "Relative volume expansion"]
            },
            "HDFCBANK.NS": {
              action: "HOLD",
              score: 0.45,
              reasons: ["RSI neutral", "Inside narrow range"]
            }
          }
        };
        setSystemStatus(mockStatus);

        // Mock news sentiment response
        const mockNews: NewsSentimentResponse = {
          "RELIANCE.NS": {
            headlines: [
              "Reliance announces solid expansion plans and Q1 growth forecasts.",
              "Reliance Retail launches new store formats in tier-2 cities."
            ],
            direction: "bullish",
            horizon: "intraday",
            impact: "medium",
            summary: "Positive earnings forecast and solid sector volumes suggest moderate upside.",
            last_updated: new Date().toISOString()
          },
          "TCS.NS": {
            headlines: [
              "TCS faces minor headwinds in retail segments, margins stay flat.",
              "IT sector consolidation continues as overseas pipelines slow."
            ],
            direction: "bearish",
            horizon: "intraday",
            impact: "medium",
            summary: "Overseas pipeline slowdown and margin pressure signal bearish near-term outlook.",
            last_updated: new Date().toISOString()
          },
          "HDFCBANK.NS": {
            headlines: [
              "HDFC Bank shares consolidate following credit expansion adjustments.",
              "Private banking indexes show mixed flows this morning."
            ],
            direction: "neutral",
            horizon: "intraday",
            impact: "low",
            summary: "Sideways movements expected. Sentiment indicators are neutral.",
            last_updated: new Date().toISOString()
          },
          "BHARTIARTL.NS": {
            headlines: [
              "Bharti Airtel announces next-gen network rollouts across major regions.",
              "Airtel customer metrics hit target thresholds ahead of schedule."
            ],
            direction: "bullish",
            horizon: "intraday",
            impact: "high",
            summary: "Robust subscriber additions and infrastructure extensions warrant high conviction.",
            last_updated: new Date().toISOString()
          }
        };
        setNewsSentiment(mockNews);

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

      const [signalsRes, riskRes, statusResResult, newsResResult] = await Promise.all([
        stratosFetch(`/signals/live?${queryParams.toString()}`),
        stratosFetch("/signals/risk/state"),
        stratosFetch("/signals/status").catch(err => {
          console.error("Failed to fetch system status:", err);
          return null;
        }),
        stratosFetch("/signals/news").catch(err => {
          console.error("Failed to fetch news sentiment:", err);
          return null;
        })
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

      let statusData: SystemStatus | null = null;
      if (statusResResult && statusResResult.ok) {
        try {
          statusData = await statusResResult.json();
        } catch (e) {
          console.error("Error parsing status JSON:", e);
        }
      }

      let newsData: NewsSentimentResponse | null = null;
      if (newsResResult && newsResResult.ok) {
        try {
          newsData = await newsResResult.json();
        } catch (e) {
          console.error("Error parsing news JSON:", e);
        }
      }

      setLiveData(signalsData);
      setRiskState(riskData);
      if (statusData) {
        setSystemStatus(statusData);
      }
      if (newsData) {
        setNewsSentiment(newsData);
      }
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Failed to establish secure connection to FastAPI server.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTriggerScan = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setToastMessage(null);

    if (isDemoMode) {
      setTimeout(() => {
        const demoResult: TriggerScanResponse = {
          status: "success",
          processed_count: 5,
          processed: [
            { symbol: "RELIANCE.NS", action: "BUY", score: 0.82, trade_state: "OPEN" },
            { symbol: "HDFCBANK.NS", action: "HOLD", score: 0.45, trade_state: "NOT_CREATED" },
            { symbol: "INFY.NS", action: "SKIP", score: 0.32, trade_state: "NOT_CREATED" },
            { symbol: "TCS.NS", action: "SELL", score: 0.76, trade_state: "OPEN" },
            { symbol: "ICICIBANK.NS", action: "BUY", score: 0.68, trade_state: "NOT_CREATED" }
          ],
          errors: [],
          cache_keys: ["RELIANCE.NS", "HDFCBANK.NS", "INFY.NS", "TCS.NS", "ICICIBANK.NS"]
        };
        setIsScanning(false);
        setScanResultModalData(demoResult);
        setToastMessage({ text: "Demo scan completed successfully!", type: "success" });
        fetchDashboardData();
      }, 1500);
      return;
    }

    try {
      const response = await stratosFetch("/signals/trigger-scan", {
        method: "POST"
      });

      if (!response.ok) {
        let errorMsg = "Trigger scan failed";
        try {
          const errBody = await response.json();
          errorMsg = errBody.detail || JSON.stringify(errBody);
        } catch {}
        throw new Error(errorMsg);
      }

      const data: TriggerScanResponse = await response.json();
      setScanResultModalData(data);
      setToastMessage({ text: "Scan triggered and completed successfully!", type: "success" });
      await fetchDashboardData();
    } catch (err: any) {
      console.error(err);
      setToastMessage({ text: err.message || "Failed to trigger scan.", type: "error" });
    } finally {
      setIsScanning(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

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
                <div className="flex items-center gap-2 flex-wrap">
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

                  {/* System Status Popover Dropdown */}
                  <div className="relative z-[90]">
                    <button
                      type="button"
                      onClick={() => setShowSystemStatus(!showSystemStatus)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                        systemStatus?.scheduler_running
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${systemStatus?.scheduler_running ? "bg-emerald-400 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
                      System Status
                      <ChevronDown size={10} className={`transition-transform duration-200 ${showSystemStatus ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                      {showSystemStatus && (
                        <>
                          {/* Invisible Backdrop to close on click outside */}
                          <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setShowSystemStatus(false)} 
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl space-y-3.5 text-xs text-slate-300"
                          >
                            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                              <span className="font-bold text-white tracking-wider flex items-center gap-1.5 uppercase text-[10px] leading-none">
                                <Server size={12} className="text-cyan-400" />
                                Diagnostics
                              </span>
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">
                                {systemStatus?.app_env || "N/A"}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Scheduler Status:</span>
                                <span className={`font-bold flex items-center gap-1.5 ${systemStatus?.scheduler_running ? "text-emerald-400" : "text-rose-400"}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${systemStatus?.scheduler_running ? "bg-emerald-400 animate-ping" : "bg-rose-400"}`} />
                                  {systemStatus?.scheduler_running ? "ACTIVE" : "INACTIVE"}
                                </span>
                              </div>

                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Server Time (IST):</span>
                                <span className="font-bold text-slate-200 tabular-nums">
                                  {systemStatus?.current_time_ist 
                                    ? new Date(systemStatus.current_time_ist).toLocaleTimeString("en-US", { hour12: false }) 
                                    : "N/A"}
                                </span>
                              </div>

                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Active Universe:</span>
                                <span className="font-bold text-cyan-400 tracking-wide">
                                  {systemStatus?.active_universe || "N/A"}
                                </span>
                              </div>

                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Bypass Market Hours:</span>
                                <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                                  systemStatus?.bypass_market_hours 
                                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" 
                                    : "text-slate-400 bg-slate-800 border border-slate-700"
                                }`}>
                                  {systemStatus?.bypass_market_hours ? "ENABLED" : "DISABLED"}
                                </span>
                              </div>

                              <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Cached Symbols:</span>
                                <span className="font-bold text-slate-200 tabular-nums">
                                  {systemStatus?.cache_keys?.length ?? 0} symbols
                                </span>
                              </div>
                            </div>

                            {/* Cache Summaries Sub-panel */}
                            {systemStatus?.cache_summary && Object.keys(systemStatus.cache_summary).length > 0 && (
                              <div className="border-t border-slate-850 pt-2 space-y-1.5">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Cache Summaries</span>
                                <div className="max-h-24 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                  {Object.entries(systemStatus.cache_summary).map(([sym, details]) => (
                                    <div key={sym} className="flex justify-between items-center bg-slate-950/40 p-1.5 rounded-lg border border-slate-850/50">
                                      <span className="font-bold text-slate-400 text-[10px]">{sym}</span>
                                      <div className="flex items-center gap-1.5 text-[10px]">
                                        <span className={`font-black ${details.action === "BUY" ? "text-emerald-400" : details.action === "SELL" ? "text-rose-400" : "text-slate-400"}`}>
                                          {details.action}
                                        </span>
                                        <span className="text-slate-600">/</span>
                                        <span className="text-cyan-400 font-semibold">{Math.round(details.score * 100)}%</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
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
                  ALERT: Risk Limit Breached (Kill-Switch Engaged)
                </h4>
                <p className="text-xs text-red-200/80 font-medium">
                  The risk limit has been breached and the engine has halted trading for the day. All automated scans and order routing processes are suspended.
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
            onTriggerScan={handleTriggerScan}
            isScanning={isScanning}
          />

          {/* MAIN GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Left Column: Watchlist Scanner & News Sentiment Feed */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* LIVE WATCHLIST SCANNER GRID */}
              <WatchlistScanner
                liveData={liveData}
                handleSelectStock={handleSelectStock}
              />

              {/* LIVE NEWS SENTIMENT FEED */}
              <NewsSentimentFeed
                newsSentiment={newsSentiment}
                onSelectStock={handleSelectStock}
              />
            </div>

            {/* Right Column: Backtesting & YouTube Summarizer Tabs */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              {/* Tab Header Buttons */}
              <div className="flex gap-2 p-1 bg-slate-950/60 border border-slate-850 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveRightTab("backtest")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeRightTab === "backtest"
                      ? "bg-slate-900 border border-slate-800 text-purple-400 shadow-md shadow-purple-500/5"
                      : "text-slate-500 hover:text-slate-355"
                  }`}
                >
                  <Server size={13} />
                  Simulation Lab
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRightTab("youtube")}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeRightTab === "youtube"
                      ? "bg-slate-900 border border-slate-800 text-cyan-400 shadow-md shadow-cyan-500/5"
                      : "text-slate-500 hover:text-slate-355"
                  }`}
                >
                  <Youtube size={13} />
                  YouTube Notes
                </button>
              </div>

              {/* Tab Content Panels */}
              <AnimatePresence mode="wait">
                {activeRightTab === "backtest" ? (
                  <motion.div
                    key="backtest-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col h-full"
                  >
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
                  </motion.div>
                ) : (
                  <motion.div
                    key="youtube-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col h-full"
                  >
                    <YoutubeSummarizer
                      isDemoMode={isDemoMode}
                      setToastMessage={setToastMessage}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
            selectedStockNews={selectedStockNews}
            detailsLoading={detailsLoading}
            detailsError={detailsError}
            onClose={() => setSelectedStock(null)}
          />
        )}
      </AnimatePresence>

      {/* FORCE TRIGGER SCAN RESULTS MODAL */}
      <AnimatePresence>
        {scanResultModalData && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setScanResultModalData(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl p-6 overflow-hidden z-10 backdrop-blur-xl"
            >
              {/* Premium top accent gradient */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-indigo-500 to-transparent" />
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center text-cyan-400">
                    <CheckCircle2 size={20} className="animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Scanner Loop Execution Success</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Cache refreshed and signals watchlist updated</p>
                  </div>
                </div>
                <button
                  onClick={() => setScanResultModalData(null)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <AlertCircle size={18} className="rotate-45" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Summary */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950/50 border border-slate-850 p-3.5 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-500 block mb-0.5">Scanned Tickers</span>
                    <span className="text-xl font-black text-cyan-400 tabular-nums">
                      {scanResultModalData.processed_count}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-0.5">Cache Keys Active</span>
                    <span className="text-xl font-black text-indigo-400 tabular-nums">
                      {scanResultModalData.cache_keys?.length ?? 0}
                    </span>
                  </div>
                </div>

                {/* Processed Tickers Table */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Processed Telemetry</span>
                  <div className="max-h-48 overflow-y-auto border border-slate-850 rounded-xl overflow-hidden custom-scrollbar bg-slate-950/30">
                    <table className="w-full text-[11px] text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-950/80 text-slate-500 uppercase tracking-wider text-[9px] border-b border-slate-850">
                          <th className="p-2.5 font-bold">Ticker</th>
                          <th className="p-2.5 font-bold text-center">Action</th>
                          <th className="p-2.5 font-bold text-right">Score</th>
                          <th className="p-2.5 font-bold text-center">State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60">
                        {scanResultModalData.processed?.map((item) => (
                          <tr key={item.symbol} className="hover:bg-slate-900/30 transition-colors">
                            <td className="p-2.5 font-black text-slate-200">{item.symbol}</td>
                            <td className="p-2.5 text-center">
                              <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                                item.action === "BUY"
                                  ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
                                  : item.action === "SELL"
                                  ? "text-rose-400 bg-rose-500/10 border-rose-500/25"
                                  : "text-slate-400 bg-slate-800 border-slate-700/50"
                              }`}>
                                {item.action}
                              </span>
                            </td>
                            <td className="p-2.5 text-right font-bold text-cyan-400 tabular-nums">
                              {Math.round(item.score * 100)}%
                            </td>
                            <td className="p-2.5 text-center text-slate-400 font-semibold text-[10px]">
                              <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                item.trade_state === "OPEN"
                                  ? "text-cyan-400 bg-cyan-500/10"
                                  : "text-slate-500 bg-slate-950"
                              }`}>
                                {item.trade_state}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Errors display */}
                {scanResultModalData.errors && scanResultModalData.errors.length > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/25 p-3 rounded-2xl space-y-1">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Pipeline Warnings / Errors
                    </span>
                    <div className="max-h-20 overflow-y-auto text-[10px] text-rose-300 space-y-1 custom-scrollbar">
                      {scanResultModalData.errors.map((err: any, idx: number) => (
                        <p key={idx}>{typeof err === "string" ? err : JSON.stringify(err)}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-850 flex justify-end">
                <button
                  onClick={() => setScanResultModalData(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Acknowledge & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Notification Banner */}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className={`p-4 rounded-2xl border backdrop-blur-md shadow-2xl flex items-start gap-3 pointer-events-auto ${
                toastMessage.type === "success"
                  ? "bg-slate-900/90 border-emerald-500/20 text-slate-100"
                  : "bg-slate-900/90 border-rose-500/20 text-slate-100"
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
                <h5 className="font-bold text-white mb-0.5">
                  {toastMessage.type === "success" ? "System Event Success" : "System Error Action"}
                </h5>
                <p className="text-slate-400 font-medium leading-relaxed">{toastMessage.text}</p>
              </div>
              <button
                onClick={() => setToastMessage(null)}
                className="text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0 mt-0.5"
              >
                <AlertCircle size={14} className="rotate-45" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
