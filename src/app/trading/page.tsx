"use client";

import React, { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Lock,
  User,
  LogOut,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Target,
  Activity,
  LineChart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Clock,
  CheckCircle2,
  XCircle,
  Info,
  Send,
  Play,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Shield,
  DollarSign,
  Percent,
  Search,
  Star,
  Sun,
  Gauge,
} from "lucide-react";

import {
  BASE_URL,
  getStratosToken,
  saveStratosAuth,
  clearStratosAuth,
  stratosFetch,
} from "@/components/dashboard/api";

import {
  fetchMarketData,
  generateAISignal,
  createOrder,
  fetchOrders,
  fetchPositions,
  runBacktest,
  fetchBacktests,
  fetchPortfolio,
  fetchTradingHealth,
  scanWatchlist,
  scanMarketOpening,
} from "@/components/trading/api";

import type {
  AISignalResponse,
  Order,
  Position,
  BacktestResult,
  PortfolioSummary,
  TradingHealth,
  StrategyTemplate,
  WatchlistItem,
  WatchlistResponse,
  MarketOpeningScanResponse,
  FactorScores,
} from "@/components/trading/types";

import { STRATEGY_TEMPLATES, STOCK_UNIVERSES } from "@/components/trading/types";

// ── Helpers ──────────────────────────────────────────────────────────────

const formatCurrency = (n: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

const formatPercent = (n: number): string =>
  `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

const relativeTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

type Tab = "watchlist" | "signals" | "orders" | "positions" | "backtest" | "portfolio";

// ── Trading Page ─────────────────────────────────────────────────────────

export default function TradingPage() {
  // Auth state
  const [token, setToken] = useState<string | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // App state
  const [activeTab, setActiveTab] = useState<Tab>("watchlist");
  const [health, setHealth] = useState<TradingHealth | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth on mount
  useEffect(() => {
    const existing = getStratosToken();
    if (existing) {
      setToken(existing);
      setShowLogin(false);
    } else {
      setShowLogin(true);
      setLoading(false);
    }
  }, []);

  // Handle auth from other tabs/pages
  useEffect(() => {
    const handleAuthChange = () => {
      const t = getStratosToken();
      setToken(t);
      if (t) setShowLogin(false);
    };

    const handleUnauthorized = () => {
      setToken(null);
      setShowLogin(true);
    };

    window.addEventListener("stratos-unauthorized", handleUnauthorized);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("stratos-unauthorized", handleUnauthorized);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  // Health check
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetchTradingHealth()
      .then(setHealth)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  // ── Login Handler ───────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const cleanBase = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
      const res = await fetch(`${cleanBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Login failed");
      }

      const data = await res.json();
      const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString();

      saveStratosAuth(data.access_token || data.token, expiresAt);
      setToken(data.access_token || data.token);
      setShowLogin(false);
      setLoginUsername("");
      setLoginPassword("");
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearStratosAuth();
    setToken(null);
    setShowLogin(true);
    setHealth(null);
    setError(null);
  };

  // ── Login Screen ────────────────────────────────────────────────────
  if (showLogin) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-8 shadow-lg"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-light mb-4">
                <LineChart className="w-8 h-8 text-accent" />
              </div>
              <h1 className="font-[family-name:var(--font-instrument-serif)] text-2xl text-foreground mb-2">
                Vibe Trading
              </h1>
              <p className="text-foreground-secondary text-sm">
                AI-powered trading dashboard — connect to your Stratos backend
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                  <AlertTriangle size={16} />
                  {loginError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary"
                  />
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary"
                  />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                    placeholder="Enter password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 px-4 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loginLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Zap size={18} />
                )}
                Connect to Stratos
              </button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              Connects to your self-hosted Stratos backend via JWT auth.
            </p>
          </motion.div>
        </div>
      </>
    );
  }

  // ── Main Dashboard ───────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "watchlist", label: "Watchlist", icon: Search },
    { id: "signals", label: "AI Signals", icon: Bot },
    { id: "orders", label: "Orders", icon: Activity },
    { id: "positions", label: "Positions", icon: Target },
    { id: "backtest", label: "Backtest", icon: BarChart3 },
    { id: "portfolio", label: "Portfolio", icon: Wallet },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1512px] mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-accent-light">
                <LineChart className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h1 className="font-[family-name:var(--font-instrument-serif)] text-2xl text-foreground">
                  Vibe Trading
                </h1>
                <p className="text-foreground-secondary text-sm">
                  AI-powered trading insights &middot;{" "}
                  {health ? (
                    <span className="text-green-600 dark:text-green-400">
                      ● Connected
                    </span>
                  ) : (
                    "connecting…"
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-foreground-secondary hover:text-red-500 bg-muted hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
            >
              <LogOut size={15} />
              Disconnect
            </button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Health Warning */}
        {health && !health.llm_configured && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm mb-6">
            <Info size={16} />
            LLM API key not configured — AI signals will use technical analysis only. Set <code className="mx-1 px-1 bg-amber-100 dark:bg-amber-900/30 rounded text-xs">GEMINI_API_KEY</code> for enhanced signals.
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-6">
            <AlertTriangle size={16} />
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "watchlist" && <WatchlistPanel />}
            {activeTab === "signals" && <SignalsPanel />}
            {activeTab === "orders" && <OrdersPanel />}
            {activeTab === "positions" && <PositionsPanel />}
            {activeTab === "backtest" && <BacktestPanel />}
            {activeTab === "portfolio" && <PortfolioPanel />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

// ── Signals Panel ──────────────────────────────────────────────────────

function SignalsPanel() {
  const [symbol, setSymbol] = useState("AAPL");
  const [loading, setLoading] = useState(false);
  const [signal, setSignal] = useState<AISignalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Quick symbols
  const quickSymbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "NVDA", "RELIANCE.NS"];

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSignal(null);
    try {
      const s = await generateAISignal({ symbol: symbol.trim() });
      setSignal(s);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // Auto-analyze on mount
  useEffect(() => {
    handleGenerate();
  }, []);

  const signalColor =
    signal?.signal === "buy"
      ? "text-green-600 dark:text-green-400"
      : signal?.signal === "sell"
      ? "text-red-600 dark:text-red-400"
      : "text-amber-600 dark:text-amber-400";

  const signalBg =
    signal?.signal === "buy"
      ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
      : signal?.signal === "sell"
      ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"
      : "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800";

  const SignalIcon =
    signal?.signal === "buy"
      ? TrendingUp
      : signal?.signal === "sell"
      ? TrendingDown
      : Activity;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Input Panel */}
      <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6">
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-lg mb-4">
          Generate AI Signal
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
              Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all font-mono text-lg"
              placeholder="AAPL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-2">
              Quick Select
            </label>
            <div className="flex flex-wrap gap-2">
              {quickSymbols.map((s) => (
                <button
                  key={s}
                  onClick={() => setSymbol(s)}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    symbol === s
                      ? "bg-accent text-white"
                      : "bg-muted text-foreground-secondary hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !symbol.trim()}
            className="w-full py-2.5 px-4 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Bot size={18} />
            )}
            Analyze
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}
      </div>

      {/* Signal Result */}
      <div className="lg:col-span-2 space-y-6">
        {loading && (
          <div className="bg-card border border-border rounded-2xl p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-accent mx-auto mb-3" />
              <p className="text-foreground-secondary text-sm">
                Analyzing {symbol} with AI…
              </p>
            </div>
          </div>
        )}

        {signal && !loading && (
          <>
            {/* Signal Card */}
            <div className={`border rounded-2xl p-8 ${signalBg}`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-foreground-secondary mb-1">
                    {signal.symbol} &middot; {new Date(signal.timestamp).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-3">
                    <SignalIcon className={`w-8 h-8 ${signalColor}`} />
                    <span className={`text-3xl font-bold uppercase font-[family-name:var(--font-instrument-serif)] ${signalColor}`}>
                      {signal.signal}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-foreground-secondary">Confidence</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(signal.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              <p className="text-foreground-secondary text-sm leading-relaxed">
                {signal.reasoning}
              </p>
            </div>

            {/* Price Levels */}
            <div className="grid sm:grid-cols-3 gap-4">
              {signal.suggested_entry && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-1">
                    <ArrowRight size={14} />
                    Entry
                  </div>
                  <p className="text-xl font-mono font-bold text-foreground">
                    ₹{signal.suggested_entry.toFixed(2)}
                  </p>
                </div>
              )}
              {signal.suggested_stop_loss && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-1">
                    <Shield size={14} className="text-red-500" />
                    Stop Loss
                  </div>
                  <p className="text-xl font-mono font-bold text-foreground">
                    ₹{signal.suggested_stop_loss.toFixed(2)}
                  </p>
                </div>
              )}
              {signal.suggested_take_profit && (
                <div className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-1">
                    <Target size={14} className="text-green-500" />
                    Take Profit
                  </div>
                  <p className="text-xl font-mono font-bold text-foreground">
                    ₹{signal.suggested_take_profit.toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {signal.risk_reward_ratio && (
              <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
                <span className="text-foreground-secondary text-sm">Risk / Reward Ratio</span>
                <span className={`font-mono font-bold ${
                  signal.risk_reward_ratio >= 2
                    ? "text-green-600 dark:text-green-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}>
                  1:{signal.risk_reward_ratio.toFixed(2)}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Orders Panel ────────────────────────────────────────────────────────

function OrdersPanel() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // New order form
  const [orderSymbol, setOrderSymbol] = useState("");
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [orderQty, setOrderQty] = useState("10");
  const [orderPrice, setOrderPrice] = useState("");
  const [orderCreating, setOrderCreating] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrders({ limit: 50 });
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderCreating(true);
    try {
      await createOrder({
        symbol: orderSymbol.trim(),
        side: orderSide,
        quantity: parseFloat(orderQty),
        price: orderPrice ? parseFloat(orderPrice) : undefined,
        order_type: orderPrice ? "limit" : "market",
        reason: `Manual ${orderSide} order from Vibe Trading UI`,
      });
      setShowCreate(false);
      setOrderSymbol("");
      setOrderPrice("");
      loadOrders();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setOrderCreating(false);
    }
  };

  const statusStyle = (status: string) => {
    switch (status) {
      case "filled":
        return "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400";
      case "rejected":
        return "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400";
      case "cancelled":
        return "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400";
      default:
        return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400";
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Order Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-lg">
          {orders.length} Orders
        </h2>
        <div className="flex gap-2">
          <button
            onClick={loadOrders}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground bg-muted rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            {showCreate ? "Cancel" : "+ New Order"}
          </button>
        </div>
      </div>

      {/* New Order Form */}
      {showCreate && (
        <form onSubmit={handleCreateOrder} className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-medium text-foreground mb-4">Place Order</h3>
          <div className="grid sm:grid-cols-4 gap-4">
            <input
              type="text"
              value={orderSymbol}
              onChange={(e) => setOrderSymbol(e.target.value.toUpperCase())}
              placeholder="Symbol (e.g. AAPL)"
              className="px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono"
              required
            />
            <select
              value={orderSide}
              onChange={(e) => setOrderSide(e.target.value as "buy" | "sell")}
              className="px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <input
              type="number"
              value={orderQty}
              onChange={(e) => setOrderQty(e.target.value)}
              placeholder="Quantity"
              min="1"
              step="1"
              className="px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              required
            />
            <input
              type="number"
              value={orderPrice}
              onChange={(e) => setOrderPrice(e.target.value)}
              placeholder="Limit price (optional)"
              step="0.01"
              className="px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <button
            type="submit"
            disabled={orderCreating}
            className="mt-4 px-6 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {orderCreating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Submit Order
          </button>
        </form>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">Symbol</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">Side</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">Qty</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">Price</th>
                <th className="text-center px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-accent mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-foreground-secondary">
                    No orders yet. Create your first order above.
                  </td>
                </tr>
              )}
              {!loading &&
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-foreground-secondary font-mono">
                      #{order.id}
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground font-medium font-mono">
                      {order.symbol}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`font-medium ${
                          order.side === "buy"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {order.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground text-right font-mono">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground text-right font-mono">
                      {order.price ? `₹${order.price.toFixed(2)}` : "MARKET"}
                    </td>
                    <td className="px-6 py-3 text-sm text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground-secondary text-right whitespace-nowrap">
                      {relativeTime(order.created_at)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Positions Panel ─────────────────────────────────────────────────────

function PositionsPanel() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPositions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPositions({ is_open: true });
      setPositions(data.positions);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  const totalPnl = positions.reduce((sum, p) => sum + p.unrealized_pnl, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-lg">
          Open Positions ({positions.length})
        </h2>
        <button
          onClick={loadPositions}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground bg-muted rounded-lg transition-colors"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* P&L Summary Cards */}
      {positions.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-foreground-secondary">Total Unrealized P&L</p>
            <p
              className={`text-xl font-mono font-bold ${
                totalPnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(totalPnl)}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-foreground-secondary">Open Positions</p>
            <p className="text-xl font-mono font-bold text-foreground">
              {positions.length}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-foreground-secondary">Win / Loss</p>
            <p className="text-xl font-mono font-bold text-foreground">
              <span className="text-green-600 dark:text-green-400">
                {positions.filter((p) => p.unrealized_pnl > 0).length}
              </span>{" "}
              /{" "}
              <span className="text-red-600 dark:text-red-400">
                {positions.filter((p) => p.unrealized_pnl < 0).length}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Positions Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">Symbol</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">Side</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">Qty</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">Entry</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">Current</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">P&L</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-foreground-secondary uppercase tracking-wider">Stop Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-accent mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && positions.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-foreground-secondary">
                    No open positions.
                  </td>
                </tr>
              )}
              {!loading &&
                positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-foreground font-medium font-mono">
                      {pos.symbol}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span
                        className={`font-medium ${
                          pos.side === "long"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {pos.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground text-right font-mono">
                      {pos.quantity}
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground text-right font-mono">
                      {formatCurrency(pos.entry_price)}
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground text-right font-mono">
                      {pos.current_price ? formatCurrency(pos.current_price) : "—"}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-mono">
                      <span
                        className={
                          pos.unrealized_pnl >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {formatCurrency(pos.unrealized_pnl)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-foreground-secondary text-right font-mono">
                      {pos.stop_loss ? formatCurrency(pos.stop_loss) : "—"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Backtest Panel ──────────────────────────────────────────────────────

function BacktestPanel() {
  const [backtests, setBacktests] = useState<BacktestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  // Backtest form
  const [strategyIdx, setStrategyIdx] = useState(0);
  const [symbolsInput, setSymbolsInput] = useState("AAPL,GOOGL,MSFT");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [capital, setCapital] = useState("100000");

  const loadBacktests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBacktests({ limit: 20 });
      setBacktests(data.backtests);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBacktests();
  }, [loadBacktests]);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    setRunning(true);
    setError(null);
    try {
      const strategy = STRATEGY_TEMPLATES[strategyIdx];
      await runBacktest({
        strategy_name: strategy.name,
        symbols: symbolsInput.split(",").map((s) => s.trim()),
        start_date: startDate,
        end_date: endDate,
        initial_capital: parseFloat(capital),
        parameters: strategy.defaultParams,
      });
      await loadBacktests();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Config Panel */}
      <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6">
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-lg mb-4">
          Run Backtest
        </h2>

        <form onSubmit={handleRun} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
              Strategy
            </label>
            <select
              value={strategyIdx}
              onChange={(e) => setStrategyIdx(parseInt(e.target.value))}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {STRATEGY_TEMPLATES.map((s, i) => (
                <option key={s.name} value={i}>
                  {s.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-foreground-secondary mt-1">
              {STRATEGY_TEMPLATES[strategyIdx].description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
              Symbols (comma-separated)
            </label>
            <input
              type="text"
              value={symbolsInput}
              onChange={(e) => setSymbolsInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono text-sm"
              placeholder="AAPL,GOOGL,MSFT"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
              Initial Capital (₹)
            </label>
            <input
              type="number"
              value={capital}
              onChange={(e) => setCapital(e.target.value)}
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={running}
            className="w-full py-2.5 px-4 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {running ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Play size={18} />
            )}
            Run Backtest
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-lg">
            Backtest Results ({backtests.length})
          </h2>
          <button
            onClick={loadBacktests}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground bg-muted rounded-lg transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="bg-card border border-border rounded-2xl p-12 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-accent" />
            </div>
          )}

          {!loading && backtests.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-12 text-center text-foreground-secondary">
              No backtests yet. Configure and run your first backtest.
            </div>
          )}

          {!loading &&
            backtests.map((bt) => (
              <div
                key={bt.id}
                className="bg-card border border-border rounded-2xl p-6 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-foreground">{bt.strategy_name}</h3>
                    <p className="text-sm text-foreground-secondary">
                      {bt.symbols.join(", ")} &middot;{" "}
                      {new Date(bt.start_date).toLocaleDateString()} →{" "}
                      {new Date(bt.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${
                      bt.total_return >= 0
                        ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                        : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
                    }`}
                  >
                    {bt.total_return >= 0 ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                    {formatPercent(bt.total_return)}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <p className="text-xs text-foreground-secondary">Capital</p>
                    <p className="text-sm font-mono font-medium text-foreground">
                      {formatCurrency(bt.initial_capital)} → {formatCurrency(bt.final_capital)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-secondary">Sharpe</p>
                    <p className="text-sm font-mono font-medium text-foreground">
                      {bt.sharpe_ratio?.toFixed(3) ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-secondary">Max Drawdown</p>
                    <p className="text-sm font-mono font-medium text-red-600 dark:text-red-400">
                      {bt.max_drawdown !== null && bt.max_drawdown !== undefined
                        ? `${bt.max_drawdown.toFixed(1)}%`
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-secondary">Win Rate</p>
                    <p className="text-sm font-mono font-medium text-foreground">
                      {bt.win_rate?.toFixed(1) ?? "—"}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-secondary">Trades</p>
                    <p className="text-sm font-mono font-medium text-foreground">
                      {bt.total_trades} ({bt.winning_trades ?? 0}W / {bt.losing_trades ?? 0}L)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-foreground-secondary">Avg Win / Loss</p>
                    <p className="text-sm font-mono font-medium text-foreground">
                      <span className="text-green-600 dark:text-green-400">
                        {bt.avg_win?.toFixed(2) ?? "—"}
                      </span>{" "}
                      /{" "}
                      <span className="text-red-600 dark:text-red-400">
                        {bt.avg_loss?.toFixed(2) ?? "—"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-3 text-xs text-foreground-secondary">
                  Run {new Date(bt.created_at).toLocaleString()}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ── Portfolio Panel ─────────────────────────────────────────────────────

function PortfolioPanel() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await fetchPortfolio();
      setPortfolio(p);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center text-foreground-secondary">
        Unable to load portfolio.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-instrument-serif)] text-lg">
          Portfolio Overview
        </h2>
        <button
          onClick={loadPortfolio}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground bg-muted rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Main KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Value"
          value={formatCurrency(portfolio.total_value)}
          icon={Wallet}
        />
        <KpiCard
          label="Total P&L"
          value={formatCurrency(portfolio.total_pnl)}
          sub={formatPercent(portfolio.total_pnl_pct)}
          icon={DollarSign}
          tone={portfolio.total_pnl >= 0 ? "positive" : "negative"}
        />
        <KpiCard
          label="Daily P&L"
          value={formatCurrency(portfolio.daily_pnl)}
          icon={Activity}
          tone={portfolio.daily_pnl >= 0 ? "positive" : "negative"}
        />
        <KpiCard
          label="Win / Loss"
          value={`${portfolio.winning_positions} / ${portfolio.losing_positions}`}
          icon={Percent}
          sub={
            portfolio.open_positions > 0
              ? `${((portfolio.winning_positions / portfolio.open_positions) * 100).toFixed(0)}% win rate`
              : "No positions"
          }
        />
      </div>

      {/* Breakdown */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-foreground-secondary mb-1">Cash Balance</p>
          <p className="text-2xl font-mono font-bold text-foreground">
            {formatCurrency(portfolio.cash_balance)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-foreground-secondary mb-1">Positions Value</p>
          <p className="text-2xl font-mono font-bold text-foreground">
            {formatCurrency(portfolio.positions_value)}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-sm text-foreground-secondary mb-1">Open Positions</p>
          <p className="text-2xl font-mono font-bold text-foreground">
            {portfolio.open_positions}
          </p>
        </div>
      </div>

      {/* Allocation Visual */}
      {portfolio.positions_value > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-medium text-foreground mb-4">Allocation</h3>
          <div className="h-4 rounded-full bg-muted overflow-hidden flex">
            <div
              className="h-full bg-accent transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (portfolio.positions_value / (portfolio.total_value || 1)) * 100
                )}%`,
              }}
            />
            <div
              className="h-full bg-accent-secondary/50 transition-all"
              style={{
                width: `${Math.min(
                  100,
                  (portfolio.cash_balance / (portfolio.total_value || 1)) * 100
                )}%`,
              }}
            />
          </div>
          <div className="flex items-center gap-6 mt-3 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-accent" />
              <span className="text-foreground-secondary">
                Invested ({((portfolio.positions_value / (portfolio.total_value || 1)) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-accent-secondary/50" />
              <span className="text-foreground-secondary">
                Cash ({((portfolio.cash_balance / (portfolio.total_value || 1)) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Watchlist Panel (Stock Screener) ─────────────────────────────────

function WatchlistPanel() {
  const [universeKey, setUniverseKey] = useState("Nifty 50");
  const [maxResults, setMaxResults] = useState(10);
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [openingScan, setOpeningScan] = useState<MarketOpeningScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<"daily" | "opening">("daily");
  const [expandedStock, setExpandedStock] = useState<string | null>(null);

  const handleScan = useCallback(async () => {
    setLoading(true);
    setError(null);
    setOpeningScan(null);
    try {
      const universe = STOCK_UNIVERSES[universeKey] || STOCK_UNIVERSES["Nifty 50"];

      if (scanMode === "opening") {
        const result = await scanMarketOpening({
          universe,
        });
        setOpeningScan(result);
        setWatchlist(result.full_watchlist);
      } else {
        const result = await scanWatchlist({
          universe,
          max_results: maxResults,
        });
        setWatchlist(result.watchlist);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [universeKey, maxResults, scanMode]);

  // Auto-scan on mount
  useEffect(() => {
    handleScan();
  }, []);

  const directionBadge = (direction: string) => {
    switch (direction) {
      case "LONG":
        return "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case "SHORT":
        return "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
      case "WATCH_BOUNCE":
        return "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800";
      case "WATCH_REVERSAL":
        return "bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800";
      default:
        return "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700";
    }
  };

  const factorLabel = (key: string): string => {
    const labels: Record<string, string> = {
      volume_explosion: "Volume",
      trend_alignment: "Trend",
      momentum: "Momentum",
      rsi_sweet_spot: "RSI",
      bollinger_squeeze: "Bollinger",
      liquidity: "Liquidity",
    };
    return labels[key] || key;
  };

  const getFactorColor = (score: number): string => {
    if (score >= 70) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-400";
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      {/* Config Panel */}
      <div className="lg:col-span-1 bg-card border border-border rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-lg mb-1">
            Stock Screener
          </h2>
          <p className="text-sm text-foreground-secondary">
            Multi-factor ranking for daily watchlist
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
            Scan Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setScanMode("daily")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                scanMode === "daily"
                  ? "bg-accent text-white"
                  : "bg-muted text-foreground-secondary hover:text-foreground"
              }`}
            >
              <Gauge size={14} className="inline mr-1" />
              Daily
            </button>
            <button
              onClick={() => setScanMode("opening")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                scanMode === "opening"
                  ? "bg-accent text-white"
                  : "bg-muted text-foreground-secondary hover:text-foreground"
              }`}
            >
              <Sun size={14} className="inline mr-1" />
              Opening
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
            Universe
          </label>
          <select
            value={universeKey}
            onChange={(e) => setUniverseKey(e.target.value)}
            className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            {Object.keys(STOCK_UNIVERSES).map((key) => (
              <option key={key} value={key}>
                {key} ({STOCK_UNIVERSES[key].length} stocks)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-secondary mb-1.5">
            Top N Results
          </label>
          <input
            type="range"
            min="5"
            max="25"
            value={maxResults}
            onChange={(e) => setMaxResults(parseInt(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between text-xs text-foreground-secondary">
            <span>5</span>
            <span className="font-medium text-foreground">{maxResults}</span>
            <span>25</span>
          </div>
        </div>

        <button
          onClick={handleScan}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
          Scan Stocks
        </button>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="lg:col-span-3 space-y-4">
        {/* Market Notes (opening scan) */}
        {openingScan?.market_notes && (
          <div className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sun size={18} className="text-accent" />
              <h3 className="font-[family-name:var(--font-instrument-serif)] text-lg">
                Market Context
              </h3>
            </div>
            <p className="text-foreground-secondary">{openingScan.market_notes}</p>

            {/* Opening categories */}
            <div className="grid sm:grid-cols-3 gap-3 mt-4">
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">⚡ Gap Plays</p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{openingScan.gap_plays.length}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">🚀 Momentum</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{openingScan.momentum_plays.length}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-3 border border-purple-200 dark:border-purple-800">
                <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">🔄 Reversals</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{openingScan.reversal_plays.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-instrument-serif)] text-lg">
            {watchlist.length > 0 ? `${watchlist.length} Stocks Found` : "No stocks yet"}
          </h2>
          <button
            onClick={handleScan}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-foreground-secondary hover:text-foreground bg-muted rounded-lg transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Rescan
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-card border border-border rounded-2xl p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={32} className="animate-spin text-accent mx-auto mb-3" />
              <p className="text-foreground-secondary text-sm">
                Scanning {Object.keys(STOCK_UNIVERSES).includes(universeKey) ? STOCK_UNIVERSES[universeKey].length : "—"} stocks…
              </p>
            </div>
          </div>
        )}

        {/* Watchlist Cards */}
        {!loading &&
          watchlist.map((stock, idx) => (
            <div
              key={stock.symbol}
              className="bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-colors"
            >
              {/* Summary Row */}
              <button
                onClick={() =>
                  setExpandedStock(expandedStock === stock.symbol ? null : stock.symbol)
                }
                className="w-full p-5 flex items-center gap-4 text-left"
              >
                {/* Rank */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-foreground-secondary">
                  {idx + 1}
                </div>

                {/* Symbol & Score */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">{stock.symbol}</span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded border ${directionBadge(
                        stock.suggested_direction
                      )}`}
                    >
                      {stock.suggested_direction.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-foreground-secondary mt-0.5">
                    <span className="font-mono">₹{stock.price.toFixed(2)}</span>
                    <span
                      className={
                        stock.change_pct >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }
                    >
                      {stock.change_pct >= 0 ? "+" : ""}
                      {stock.change_pct.toFixed(2)}%
                    </span>
                    <span>Vol: {(stock.volume / 1000000).toFixed(1)}M</span>
                  </div>
                </div>

                {/* Composite Score */}
                <div className="flex-shrink-0 text-center">
                  <div
                    className={`text-2xl font-bold font-mono ${
                      stock.composite_score >= 70
                        ? "text-green-600 dark:text-green-400"
                        : stock.composite_score >= 50
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-foreground-secondary"
                    }`}
                  >
                    {stock.composite_score.toFixed(0)}
                  </div>
                  <div className="text-xs text-foreground-secondary">score</div>
                </div>

                {/* Expand */}
                <ChevronDown
                  size={18}
                  className={`text-foreground-secondary transition-transform ${
                    expandedStock === stock.symbol ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Expanded Detail */}
              {expandedStock === stock.symbol && (
                <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                  {/* Factor Scores */}
                  <div>
                    <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-3">
                      Factor Scores
                    </p>
                    <div className="space-y-2">
                      {Object.entries(stock.factor_scores).map(([key, score]) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="w-20 text-xs text-foreground-secondary flex-shrink-0">
                            {factorLabel(key)}
                          </span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getFactorColor(score)}`}
                              style={{ width: `${Math.min(100, score)}%` }}
                            />
                          </div>
                          <span className="w-8 text-xs font-mono text-foreground-secondary text-right">
                            {score.toFixed(0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reasons */}
                  {stock.reasons.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-2">
                        Why This Stock
                      </p>
                      <ul className="space-y-1">
                        {stock.reasons.map((reason, i) => (
                          <li key={i} className="text-sm text-foreground-secondary flex items-start gap-2">
                            <span className="text-accent mt-1">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Levels */}
                  {stock.key_levels && (
                    <div>
                      <p className="text-xs font-medium text-foreground-secondary uppercase tracking-wider mb-2">
                        Key Levels
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {stock.key_levels.resistance_2 && (
                          <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-2 text-center border border-red-100 dark:border-red-900/30">
                            <p className="text-xs text-red-600 dark:text-red-400">R2</p>
                            <p className="text-sm font-mono font-bold text-red-700 dark:text-red-400">
                              ₹{stock.key_levels.resistance_2.toFixed(2)}
                            </p>
                          </div>
                        )}
                        {stock.key_levels.resistance_1 && (
                          <div className="bg-red-50/50 dark:bg-red-950/10 rounded-lg p-2 text-center border border-red-100/50 dark:border-red-900/20">
                            <p className="text-xs text-red-600/70 dark:text-red-400/70">R1</p>
                            <p className="text-sm font-mono font-bold text-red-700/80 dark:text-red-400/80">
                              ₹{stock.key_levels.resistance_1.toFixed(2)}
                            </p>
                          </div>
                        )}
                        {stock.key_levels.pivot && (
                          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-2 text-center border border-blue-100 dark:border-blue-900/30">
                            <p className="text-xs text-blue-600 dark:text-blue-400">Pivot</p>
                            <p className="text-sm font-mono font-bold text-blue-700 dark:text-blue-400">
                              ₹{stock.key_levels.pivot.toFixed(2)}
                            </p>
                          </div>
                        )}
                        {stock.key_levels.support_1 && (
                          <div className="bg-green-50/50 dark:bg-green-950/10 rounded-lg p-2 text-center border border-green-100/50 dark:border-green-900/20">
                            <p className="text-xs text-green-600/70 dark:text-green-400/70">S1</p>
                            <p className="text-sm font-mono font-bold text-green-700/80 dark:text-green-400/80">
                              ₹{stock.key_levels.support_1.toFixed(2)}
                            </p>
                          </div>
                        )}
                        {stock.key_levels.support_2 && (
                          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-2 text-center border border-green-100 dark:border-green-900/30">
                            <p className="text-xs text-green-600 dark:text-green-400">S2</p>
                            <p className="text-sm font-mono font-bold text-green-700 dark:text-green-400">
                              ₹{stock.key_levels.support_2.toFixed(2)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}

// ── KPI Card Helper ─────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  tone?: "positive" | "negative";
}) {
  const valueColor = tone
    ? tone === "positive"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400"
    : "text-foreground";

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-foreground-secondary">{label}</p>
        <Icon size={16} className="text-foreground-secondary" />
      </div>
      <p className={`text-2xl font-mono font-bold ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-foreground-secondary mt-1">{sub}</p>}
    </div>
  );
}