import {
  BASE_URL,
  getStratosToken,
  saveStratosAuth,
  clearStratosAuth,
  stratosFetch,
} from "@/components/dashboard/api";
import type {
  MarketDataRequest,
  MarketDataResponse,
  AISignalRequest,
  AISignalResponse,
  OrderRequest,
  Order,
  Position,
  BacktestRequest,
  BacktestResult,
  PortfolioSummary,
  TradingHealth,
  WatchlistRequest,
  WatchlistResponse,
  MarketOpeningScanResponse,
} from "./types";

const TRADING_PREFIX = "/api/trading";

// ── Market Data ──────────────────────────────────────────────────────────

export async function fetchMarketData(
  request: MarketDataRequest
): Promise<MarketDataResponse> {
  const res = await stratosFetch(`${TRADING_PREFIX}/market-data`, {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch market data");
  }
  return res.json();
}

// ── AI Signals ───────────────────────────────────────────────────────────

export async function generateAISignal(
  request: AISignalRequest
): Promise<AISignalResponse> {
  const res = await stratosFetch(`${TRADING_PREFIX}/signals/ai`, {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate AI signal");
  }
  return res.json();
}

// ── Orders ───────────────────────────────────────────────────────────────

export async function createOrder(request: OrderRequest): Promise<Order> {
  const res = await stratosFetch(`${TRADING_PREFIX}/orders`, {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create order");
  }
  return res.json();
}

export async function fetchOrders(params?: {
  symbol?: string;
  status?: string;
  limit?: number;
}): Promise<{ orders: Order[] }> {
  const searchParams = new URLSearchParams();
  if (params?.symbol) searchParams.set("symbol", params.symbol);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const qs = searchParams.toString();
  const res = await stratosFetch(`${TRADING_PREFIX}/orders${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch orders");
  }
  return res.json();
}

export async function fetchOrder(orderId: number): Promise<Order> {
  const res = await stratosFetch(`${TRADING_PREFIX}/orders/${orderId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Order not found");
  }
  return res.json();
}

// ── Positions ────────────────────────────────────────────────────────────

export async function fetchPositions(params?: {
  is_open?: boolean;
}): Promise<{ positions: Position[] }> {
  const searchParams = new URLSearchParams();
  if (params?.is_open !== undefined)
    searchParams.set("is_open", params.is_open.toString());

  const qs = searchParams.toString();
  const res = await stratosFetch(`${TRADING_PREFIX}/positions${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch positions");
  }
  return res.json();
}

export async function fetchPosition(symbol: string): Promise<Position> {
  const res = await stratosFetch(`${TRADING_PREFIX}/positions/${symbol}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Position not found");
  }
  return res.json();
}

// ── Backtest ─────────────────────────────────────────────────────────────

export async function runBacktest(
  request: BacktestRequest
): Promise<BacktestResult> {
  const res = await stratosFetch(`${TRADING_PREFIX}/backtest`, {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Backtest failed");
  }
  return res.json();
}

export async function fetchBacktests(params?: {
  strategy_name?: string;
  limit?: number;
}): Promise<{ backtests: BacktestResult[] }> {
  const searchParams = new URLSearchParams();
  if (params?.strategy_name) searchParams.set("strategy_name", params.strategy_name);
  if (params?.limit) searchParams.set("limit", params.limit.toString());

  const qs = searchParams.toString();
  const res = await stratosFetch(`${TRADING_PREFIX}/backtest${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch backtests");
  }
  return res.json();
}

// ── Portfolio ────────────────────────────────────────────────────────────

export async function fetchPortfolio(): Promise<PortfolioSummary> {
  const res = await stratosFetch(`${TRADING_PREFIX}/portfolio`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch portfolio");
  }
  return res.json();
}

// ── Health ───────────────────────────────────────────────────────────────

export async function fetchTradingHealth(): Promise<TradingHealth> {
  const res = await stratosFetch(`${TRADING_PREFIX}/health`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to check trading health");
  }
  return res.json();
}

export {
  BASE_URL,
  getStratosToken,
  saveStratosAuth,
  clearStratosAuth,
  stratosFetch,
};

// ── Watchlist / Stock Screener ─────────────────────────────────────────

export async function scanWatchlist(
  request: WatchlistRequest
): Promise<WatchlistResponse> {
  const res = await stratosFetch(`${TRADING_PREFIX}/watchlist`, {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Watchlist scan failed");
  }
  return res.json();
}

export async function scanMarketOpening(
  request: WatchlistRequest
): Promise<MarketOpeningScanResponse> {
  const res = await stratosFetch(`${TRADING_PREFIX}/watchlist/opening-bell`, {
    method: "POST",
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Opening bell scan failed");
  }
  return res.json();
}